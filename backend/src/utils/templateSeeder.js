/**
 * ============================================================================
 * TEMPLATE SEEDER UTILITY
 * ============================================================================
 * Purpose: Dynamically imported when a brand-new user creates an account.
 * Automatically injects default "Follow-up Templates" into their account 
 * so they don't start with a completely empty dashboard.
 */
import { db } from "../config/db.js";
import { followupTemplates } from "../db/schema.js";

const DEFAULT_TEMPLATES = [
  {
    name: "Sales Outreach",
    title: "Follow up on initial sales pitch",
    target: "Prospect",
    notes: "Ask if they had time to review the proposal and if they have any questions.",
    defaultDueOffsetMinutes: 3 * 24 * 60, // 3 days
    defaultPriority: "HIGH",
    defaultReminderPolicy: "AGGRESSIVE",
  },
  {
    name: "Invoice Reminder",
    title: "Follow up on unpaid invoice",
    target: "Client Billing",
    notes: "Friendly reminder that invoice is past due. Attach original invoice.",
    defaultDueOffsetMinutes: 7 * 24 * 60, // 7 days
    defaultPriority: "HIGH",
    defaultReminderPolicy: "AGGRESSIVE",
  },
  {
    name: "Post-Meeting Action Items",
    title: "Follow up on action items discussed in meeting",
    target: "Meeting Attendees",
    notes: "Share meeting notes and ask for updates on assigned action items.",
    defaultDueOffsetMinutes: 2 * 24 * 60, // 2 days
    defaultPriority: "MEDIUM",
    defaultReminderPolicy: "NORMAL",
  },
  {
    name: "Job Application",
    title: "Follow up on submitted job application",
    target: "Recruiter / Hiring Manager",
    notes: "Express continued interest in the role and ask if they need any additional information.",
    defaultDueOffsetMinutes: 7 * 24 * 60, // 7 days
    defaultPriority: "MEDIUM",
    defaultReminderPolicy: "NORMAL",
  },
  {
    name: "Networking Connection",
    title: "Follow up after networking event",
    target: "New Connection",
    notes: "Great meeting you at the event! Let's grab coffee sometime.",
    defaultDueOffsetMinutes: 1 * 24 * 60, // 1 day
    defaultPriority: "LOW",
    defaultReminderPolicy: "NORMAL",
  },
  {
    name: "Bug Fix / Feature Request",
    title: "Follow up on bug report or feature request",
    target: "Engineering Team",
    notes: "Check if the bug has been reproduced or if the feature has been scheduled.",
    defaultDueOffsetMinutes: 7 * 24 * 60, // 7 days
    defaultPriority: "LOW",
    defaultReminderPolicy: "NORMAL",
  },
  {
    name: "Vendor Quote",
    title: "Follow up on requested vendor quote",
    target: "Vendor / Supplier",
    notes: "Ask when we can expect to receive the quote for the requested services.",
    defaultDueOffsetMinutes: 2 * 24 * 60, // 2 days
    defaultPriority: "MEDIUM",
    defaultReminderPolicy: "NORMAL",
  },
  {
    name: "Doctor Appointment",
    title: "Follow up for routine checkup scheduling",
    target: "Doctor's Office",
    notes: "Call to schedule annual physical or routine checkup.",
    defaultDueOffsetMinutes: 30 * 24 * 60, // 30 days
    defaultPriority: "LOW",
    defaultReminderPolicy: "NORMAL",
  },
];

export async function seedUserTemplates(userId) {
  try {
    const templatesToInsert = DEFAULT_TEMPLATES.map((template) => ({
      ...template,
      userId,
    }));

    await db.insert(followupTemplates).values(templatesToInsert);
    console.log(`✅ Seeded ${DEFAULT_TEMPLATES.length} default templates for user ${userId}`);
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
  }
}
