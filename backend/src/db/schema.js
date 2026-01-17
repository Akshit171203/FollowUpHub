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
]);
export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN"]);

// Users table
export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),

  password: text("password").notNull(),
  salt: text("salt").notNull(),

  verified: boolean("verified").default(false).notNull(),
  role: userRoleEnum("role").default("USER").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// FollowUps table
export const followups = pgTable(
  "followups",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id").notNull(), // references users.id later

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

  },
  (table) => ({
    userIdIdx: index("followups_user_id_idx").on(table.userId),
    dueAtIdx: index("followups_due_at_idx").on(table.dueAt),
    statusIdx: index("followups_status_idx").on(table.status),
  })
);

// Timeline Events table
export const followupEvents = pgTable(
  "followup_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    followupId: uuid("followup_id").notNull(), // references followups.id later
    userId: uuid("user_id").notNull(),

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
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id").notNull(),
    followupId: uuid("followup_id"), // optional

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
  userId: uuid("user_id").primaryKey().references(() => usersTable.id, { onDelete: 'cascade' }),
  
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
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id").notNull(),

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
