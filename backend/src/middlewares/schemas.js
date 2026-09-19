import { z } from "zod";

// ============================================================================
// Reusable primitives
// ============================================================================

const uuidParam = z.object({
  id: z.string().uuid("Invalid UUID format"),
});

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(2000).default(10).optional(),
}).passthrough();

// ============================================================================
// AUTH — signup, login, forgot-password, reset-password
// ============================================================================

export const signupSchema = {
  body: z.object({
    name: z.string().min(1, "Name is required").max(120),
    email: z.string().email("Invalid email format").max(255),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
};

export const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
};

export const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
  }),
};

export const resendVerificationSchema = {
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
};

export const refreshTokenSchema = {
  body: z.object({
    refreshToken: z.string().min(1, "refreshToken is required"),
  }),
};

// ============================================================================
// FOLLOWUPS
// ============================================================================

const followupPriority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const reminderPolicy = z.enum(["NORMAL", "PERSISTENT", "AGGRESSIVE"]);

export const extractFollowupSchema = {
  body: z.object({
    text: z.string().min(1, "text is required").max(2000),
  }),
};

export const createFollowupSchema = {
  body: z.object({
    title: z.string().min(1, "Title is required").max(255),
    target: z.string().max(255).optional().nullable(),
    notes: z.string().max(10000).optional().nullable(),
    dueAt: z.string().datetime({ message: "dueAt must be a valid ISO datetime" }),
    reminderPolicy: reminderPolicy.default("NORMAL"),
    priority: followupPriority.default("MEDIUM"),
  }),
};

export const updateFollowupSchema = {
  params: uuidParam,
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    target: z.string().max(255).optional().nullable(),
    notes: z.string().max(10000).optional().nullable(),
    dueAt: z.string().datetime().optional(),
    priority: followupPriority.optional(),
    reminderPolicy: reminderPolicy.optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  }),
};

export const snoozeFollowupSchema = {
  params: uuidParam,
  body: z.object({
    snoozeMinutes: z.number().int().min(5, "snoozeMinutes must be >= 5").max(43200),
  }),
};

export const followupIdParam = {
  params: uuidParam,
};

export const listFollowupsQuery = {
  query: paginationQuery,
};

// ============================================================================
// TEMPLATES
// ============================================================================

export const createTemplateSchema = {
  body: z.object({
    name: z.string().min(1, "Name is required").max(120),
    title: z.string().min(1, "Title is required").max(255),
    target: z.string().max(255).optional().nullable(),
    notes: z.string().max(10000).optional().nullable(),
    defaultDueOffsetMinutes: z.number().int().min(1).max(525600).default(1440),
    defaultPriority: followupPriority.default("MEDIUM"),
    defaultReminderPolicy: reminderPolicy.default("NORMAL"),
  }),
};

export const updateTemplateSchema = {
  params: uuidParam,
  body: z.object({
    name: z.string().min(1).max(120).optional(),
    title: z.string().min(1).max(255).optional(),
    target: z.string().max(255).optional().nullable(),
    notes: z.string().max(10000).optional().nullable(),
    defaultDueOffsetMinutes: z.number().int().min(1).max(525600).optional(),
    defaultPriority: followupPriority.optional(),
    defaultReminderPolicy: reminderPolicy.optional(),
  }),
};

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

const emailTemplateType = z.enum(["REMINDER", "ESCALATION", "DIGEST"]);

export const createEmailTemplateSchema = {
  body: z.object({
    name: z.string().min(1, "Name is required").max(120),
    type: emailTemplateType.default("REMINDER"),
    subject: z.string().min(1, "Subject is required").max(255),
    bodyHtml: z.string().min(1, "Body HTML is required").max(50000),
  }),
};

export const updateEmailTemplateSchema = {
  params: uuidParam,
  body: z.object({
    name: z.string().min(1).max(120).optional(),
    type: emailTemplateType.optional(),
    subject: z.string().min(1).max(255).optional(),
    bodyHtml: z.string().min(1).max(50000).optional(),
  }),
};

// ============================================================================
// TODOS
// ============================================================================

export const createTodoSchema = {
  body: z.object({
    title: z.string().min(1, "Title is required").max(255),
    notes: z.string().max(10000).optional().nullable(),
    remindAt: z.string().datetime().optional().nullable(),
    forDate: z.string().optional(), // YYYY-MM-DD date string
  }),
};

export const updateTodoSchema = {
  params: uuidParam,
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    notes: z.string().max(10000).optional().nullable(),
    status: z.enum(["PENDING", "DONE"]).optional(),
    remindAt: z.string().datetime().optional().nullable(),
  }),
};

// ============================================================================
// JIRA
// ============================================================================

export const connectJiraSchema = {
  body: z.object({
    jiraEmail: z.string().email("Invalid Jira email"),
    jiraDomain: z.string().min(1, "Jira domain is required").max(255),
    jiraApiToken: z.string().min(1, "API token is required").max(500),
    managerEmail: z.string().email().optional().nullable(),
  }),
};

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const batchMarkReadSchema = {
  body: z.object({
    ids: z.array(z.string().uuid()).min(1, "At least one notification ID required").max(100),
  }),
};

export const snoozeActionSchema = {
  params: uuidParam,
  body: z.object({
    snoozeMinutes: z.number().int().min(5).max(43200),
  }),
};

export const updatePreferencesSchema = {
  body: z.object({
    emailEnabled: z.boolean().optional(),
    inAppEnabled: z.boolean().optional(),
    typesDisabled: z.array(z.string()).optional(),
    quietHoursEnabled: z.boolean().optional(),
    quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format").optional().nullable(),
    quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format").optional().nullable(),
  }),
};
