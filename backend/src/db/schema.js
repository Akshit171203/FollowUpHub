import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

// Enums
export const followupStatusEnum = pgEnum("followup_status", [
  "PENDING",
  "SNOOZED",
  "ESCALATED",
  "DONE",
]);

export const followupPriorityEnum = pgEnum("followup_priority", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

export const reminderPolicyEnum = pgEnum("reminder_policy", [
  "NORMAL",
  "PERSISTENT",
  "AGGRESSIVE",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "CREATED",
  "REMINDER_SENT",
  "SNOOZED",
  "RESCHEDULED",
  "ESCALATED",
  "DONE",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "FOLLOWUP_DUE",
  "FOLLOWUP_ESCALATED",
  "FOLLOWUP_CREATED",
  "FOLLOWUP_DONE",
  "FOLLOWUP_SNOOZED",
  "REMINDER_SENT",
  "TODO_REMINDER",
  "JIRA_TICKET_REMINDER",
  "JIRA_TICKET_ESCALATED",
]);
export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN"]);

// Users table
export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(), // Primary Key

  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),

  password: text("password").notNull(),
  salt: text("salt").notNull(),

  verified: boolean("verified").default(false).notNull(),
  role: userRoleEnum("role").default("USER").notNull(),

  // Jira Integration Fields
  jiraEmail: varchar("jira_email", { length: 255 }),
  jiraDomain: varchar("jira_domain", { length: 255 }), // e.g., company.atlassian.net
  jiraApiToken: text("jira_api_token"), // Encrypted JSON string { iv, authTag, encryptedData }
  managerEmail: varchar("manager_email", { length: 255 }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// FollowUps table
export const followups = pgTable(
  "followups",
  {
    id: uuid("id").defaultRandom().primaryKey(), // Primary Key

    userId: uuid("user_id").notNull(), // Foreign Key -> users.id

    title: varchar("title", { length: 255 }).notNull(),
    target: varchar("target", { length: 255 }),
    notes: text("notes"),

    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),

    status: followupStatusEnum("status").default("PENDING").notNull(),
    priority: followupPriorityEnum("priority").default("MEDIUM").notNull(),
    reminderPolicy: reminderPolicyEnum("reminder_policy")
      .default("NORMAL")
      .notNull(),

    ignoreCount: integer("ignore_count").default(0).notNull(),
    escalationLevel: integer("escalation_level").default(0).notNull(),

    isActive: boolean("is_active").default(true).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    lastReminderSentAt: timestamp("last_reminder_sent_at", { withTimezone: true }),

    // External Integrations (Jira etc.)
    externalSource: varchar("external_source", { length: 50 }), // e.g., 'JIRA'
    externalId: varchar("external_id", { length: 255 }),
    externalUrl: text("external_url"),
    lastManagerNotifiedAt: timestamp("last_manager_notified_at", { withTimezone: true }),

    // AI-drafted follow-up message (Gemini), editable by the user before sending
    aiDraft: text("ai_draft"),
    isAiGenerated: boolean("is_ai_generated").default(false).notNull(),

  },
  // Performance Optimization (Indexes):
  // 1. userId: Indexed because almost all API queries are filtered by the logged-in user.
  // 2. dueAt & status: Indexed because the background Cron Job scans these fields every 60 seconds.
  // 3. externalId & externalSource: A composite index to instantly find tickets synced from Jira.
  (table) => ({
    userIdIdx: index("followups_user_id_idx").on(table.userId),
    dueAtIdx: index("followups_due_at_idx").on(table.dueAt),
    statusIdx: index("followups_status_idx").on(table.status),
    externalIdSourceIdx: index("followups_external_id_source_idx").on(table.externalId, table.externalSource),
  })
);

// Timeline Events table
export const followupEvents = pgTable(
  "followup_events",
  {
    id: uuid("id").defaultRandom().primaryKey(), // Primary Key

    followupId: uuid("followup_id").notNull(), // Foreign Key -> followups.id
    userId: uuid("user_id").notNull(), // Foreign Key -> users.id

    eventType: eventTypeEnum("event_type").notNull(),
    message: text("message"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    followupIdIdx: index("events_followup_id_idx").on(table.followupId),
  })
);


// Notifications table
export const notificationSeverityEnum = pgEnum("notification_severity", [
  "INFO",
  "SUCCESS",
  "WARNING",
  "ERROR",
  "CRITICAL",
]);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(), // Primary Key

    userId: uuid("user_id").notNull(), // Foreign Key -> users.id
    followupId: uuid("followup_id"), // Foreign Key -> followups.id (Optional)

    groupKey: varchar("group_key", { length: 255 }).default('legacy').notNull(), // Strict NOT NULL
    
    type: notificationTypeEnum("type").notNull(), // e.g. FOLLOWUP_DUE
    severity: notificationSeverityEnum("severity").default("INFO").notNull(),
    
    title: varchar("title", { length: 255 }).notNull(),
    body: text("body"),
    
    metadata: jsonb("metadata").default({}).notNull(),
    
    actionType: varchar("action_type", { length: 50 }), // e.g. OPEN_LINK, SNOOZE_MODAL
    
    isRead: boolean("is_read").default(false).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index("notifications_user_id_idx").on(table.userId),
    groupKeyIdx: index("notifications_group_key_idx").on(table.groupKey),
    isReadIdx: index("notifications_is_read_idx").on(table.isRead),
  })
);

// User Notification Preferences
export const notificationPreferences = pgTable("notification_preferences", {
  userId: uuid("user_id").primaryKey().references(() => usersTable.id, { onDelete: 'cascade' }), // Primary Key & Foreign Key -> users.id
  
  emailEnabled: boolean("email_enabled").default(true).notNull(),
  inAppEnabled: boolean("in_app_enabled").default(true).notNull(),
  
  // JSONB array of disabled notification types (e.g. ["REMINDER_SENT"])
  typesDisabled: jsonb("types_disabled").default([]).notNull(),
  
  quietHoursEnabled: boolean("quiet_hours_enabled").default(false).notNull(),
  quietHoursStart: varchar("quiet_hours_start", { length: 5 }), // HH:MM
  quietHoursEnd: varchar("quiet_hours_end", { length: 5 }), // HH:MM
  
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});


// Followup Templates table
export const followupTemplates = pgTable(
  "followup_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(), // Primary Key

    userId: uuid("user_id").notNull(), // Foreign Key -> users.id

    name: varchar("name", { length: 120 }).notNull(), // e.g. "HR Followup"
    title: varchar("title", { length: 255 }).notNull(),

    target: varchar("target", { length: 255 }),
    notes: text("notes"),

    // due date computed when applying template: now + offset minutes
    defaultDueOffsetMinutes: integer("default_due_offset_minutes")
      .default(1440) // 1 day
      .notNull(),

    defaultPriority: followupPriorityEnum("default_priority")
      .default("MEDIUM")
      .notNull(),

    defaultReminderPolicy: reminderPolicyEnum("default_reminder_policy")
      .default("NORMAL")
      .notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("templates_user_id_idx").on(table.userId),
    nameIdx: index("templates_name_idx").on(table.name),
  })
);

export const emailTemplateTypeEnum = pgEnum("email_template_type", [
  "REMINDER",
  "ESCALATION",
  "DIGEST",
]);

export const emailTemplates = pgTable(
  "email_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(), // Primary Key
    userId: uuid("user_id").notNull(), // Foreign Key -> users.id
    
    name: varchar("name", { length: 120 }).notNull(),
    type: emailTemplateTypeEnum("type").notNull(),
    
    subject: varchar("subject", { length: 255 }).notNull(),
    bodyHtml: text("body_html").notNull(),
    
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("email_templates_user_id_idx").on(table.userId),
    typeIdx: index("email_templates_type_idx").on(table.type),
  })
);

// Todo Status Enum  
export const todoStatusEnum = pgEnum("todo_status", ["PENDING", "DONE"]);

// Todos table
export const todos = pgTable(
  "todos",
  {
    id: uuid("id").defaultRandom().primaryKey(), // Primary Key
    
    userId: uuid("user_id").notNull(), // Foreign Key -> users.id
    
    title: varchar("title", { length: 255 }).notNull(),
    notes: text("notes"),
    
    status: todoStatusEnum("status").default("PENDING").notNull(),
    
    forDate: timestamp("for_date", { mode: 'date' }).notNull(),
    remindAt: timestamp("remind_at", { withTimezone: true }),
    lastRemindedAt: timestamp("last_reminded_at", { withTimezone: true }),
    
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdForDateIdx: index("todos_user_id_for_date_idx").on(table.userId, table.forDate),
    userIdStatusIdx: index("todos_user_id_status_idx").on(table.userId, table.status),
  })
);


// Jira Sync Logs table
export const jiraSyncStatusEnum = pgEnum("jira_sync_status", ["SUCCESS", "FAILED"]);

export const jiraSyncLogs = pgTable(
  "jira_sync_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(), // Primary Key
    userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: 'cascade' }), // Foreign Key -> users.id
    
    status: jiraSyncStatusEnum("status").notNull(),
    ticketsSynced: integer("tickets_synced").default(0).notNull(),
    errorMessage: text("error_message"),
    
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("jira_sync_logs_user_id_idx").on(table.userId),
    statusIdx: index("jira_sync_logs_status_idx").on(table.status),
  })
);

