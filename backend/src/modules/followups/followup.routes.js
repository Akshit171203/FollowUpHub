import express from "express";
import { db } from "../../config/db.js";
import { followups } from "../../db/schema.js";
import { eq, desc, and } from "drizzle-orm";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
import {
  followupEvents,
  followups as followupsTable,
} from "../../db/schema.js";
import { logEvent } from "../events/event.service.js";
const router = express.Router();

/**
 * POST /api/followups
 * Create followup
 */
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { title, target, notes, dueAt, reminderPolicy, priority } = req.body;

    if (!title || !dueAt) {
      return res.status(400).json({ message: "title and dueAt are required" });
    }

    const inserted = await db
      .insert(followups)
      .values({
        userId: req.user.id,
        title,
        target,
        notes,
        dueAt: new Date(dueAt),
        reminderPolicy: reminderPolicy || "NORMAL",
        priority: priority || "MEDIUM",
      })
      .returning();

    return res.status(201).json({
      message: "Followup created",
      followup: inserted[0],
    });
  } catch (error) {
    console.error("Create followup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/followups
 * List followups for logged-in user
 */
router.get("/", authenticateUser, async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(followups)
      .where(eq(followups.userId, req.user.id))
      .orderBy(desc(followups.createdAt));

    return res.json({ followups: rows });
  } catch (error) {
    console.error("List followups error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//Get Followup by ID
router.get("/:id", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const result = await db.select().from(followups).where(eq(followups.id, id));

  if (result.length === 0) {
    return res.status(404).json({ message: "Followup not found" });
  }

  const followup = result[0];

  if (followup.userId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return res.json({ followup });
});

/**
 * PATCH /api/followups/:id/done
 * Mark followup done
 */
router.patch("/:id/done", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await db
      .update(followups)
      .set({
        status: "DONE",
        completedAt: new Date(),
        updatedAt: new Date(),
        isActive: false,
        lastReminderSentAt: null,
      })
      .where(eq(followups.id, id))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ message: "Followup not found" });
    }

    return res.json({
      message: "Followup marked as DONE",
      followup: updated[0],
    });
  } catch (error) {
    console.error("Done followup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// UPDATE followup (edit)
router.patch("/:id", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { title, target, notes, dueAt, priority, reminderPolicy } = req.body;

    const updated = await db
      .update(followups)
      .set({
        ...(title && { title }),
        ...(target && { target }),
        ...(notes && { notes }),

        // ✅ FIX: Convert dueAt to Date before saving
        ...(dueAt && { dueAt: new Date(dueAt) }),

        ...(priority && { priority }),
        ...(reminderPolicy && { reminderPolicy }),
        updatedAt: new Date(),
      })
      .where(and(eq(followups.id, id), eq(followups.userId, userId)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ message: "Followup not found" });
    }

    await logEvent({
      followupId: id,
      userId,
      eventType: "RESCHEDULED",
      message: "Followup updated",
    });

    return res.json({ message: "Followup updated", followup: updated[0] });
  } catch (err) {
    console.error("PATCH /followups/:id error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// SNOOZE
router.patch("/:id/snooze", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { snoozeMinutes } = req.body;

  if (!snoozeMinutes || snoozeMinutes < 5) {
    return res.status(400).json({ message: "snoozeMinutes must be >= 5" });
  }

  const existing = await db
    .select()
    .from(followups)
    .where(and(eq(followups.id, id), eq(followups.userId, userId)));

  if (existing.length === 0) {
    return res.status(404).json({ message: "Followup not found" });
  }

  // ✅ Prevent snoozing of completed follow-ups
  if (existing[0].status === "DONE") {
    return res.status(400).json({ message: "Cannot snooze a completed follow-up" });
  }

  const newDueAt = new Date(
    new Date(existing[0].dueAt).getTime() + snoozeMinutes * 60000
  );

  const updated = await db
    .update(followups)
    .set({
      dueAt: newDueAt,
      status: "SNOOZED",
      lastReminderSentAt: null,
      updatedAt: new Date(),
    })
    .where(and(eq(followups.id, id), eq(followups.userId, userId)))
    .returning();

  await logEvent({
    followupId: id,
    userId,
    eventType: "SNOOZED",
    message: `Snoozed for ${snoozeMinutes} minutes`,
  });

  return res.json({ message: "Followup snoozed", followup: updated[0] });
});

// GET EVENTS TIMELINE
router.get("/:id/events", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const events = await db
    .select()
    .from(followupEvents)
    .where(
      and(eq(followupEvents.followupId, id), eq(followupEvents.userId, userId))
    );

  return res.json({ events });
});

export default router;
