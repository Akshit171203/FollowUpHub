import express from "express";
import { db } from "../../config/db.js";
import { followupTemplates, followups } from "../../db/schema.js";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
import { and, eq, desc } from "drizzle-orm";
import { logEvent } from "../events/event.service.js";

const router = express.Router();

/**
 * POST /api/templates
 */
router.post("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      title,
      target,
      notes,
      defaultDueOffsetMinutes,
      defaultPriority,
      defaultReminderPolicy,
    } = req.body;

    if (!name || !title) {
      return res.status(400).json({ message: "name and title are required" });
    }

    const inserted = await db
      .insert(followupTemplates)
      .values({
        userId,
        name,
        title,
        target,
        notes,
        defaultDueOffsetMinutes: defaultDueOffsetMinutes ?? 1440,
        defaultPriority: defaultPriority ?? "MEDIUM",
        defaultReminderPolicy: defaultReminderPolicy ?? "NORMAL",
      })
      .returning();

    return res.status(201).json({ message: "Template created", template: inserted[0] });
  } catch (err) {
    console.error("POST /templates error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/templates
 */
router.get("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const rows = await db
      .select()
      .from(followupTemplates)
      .where(eq(followupTemplates.userId, userId))
      .orderBy(desc(followupTemplates.createdAt));

    return res.json({ templates: rows });
  } catch (err) {
    console.error("GET /templates error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * PATCH /api/templates/:id
 */
router.patch("/:id", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const {
      name,
      title,
      target,
      notes,
      defaultDueOffsetMinutes,
      defaultPriority,
      defaultReminderPolicy,
    } = req.body;

    const updated = await db
      .update(followupTemplates)
      .set({
        ...(name && { name }),
        ...(title && { title }),
        ...(target !== undefined && { target }),
        ...(notes !== undefined && { notes }),
        ...(defaultDueOffsetMinutes !== undefined && { defaultDueOffsetMinutes }),
        ...(defaultPriority && { defaultPriority }),
        ...(defaultReminderPolicy && { defaultReminderPolicy }),
        updatedAt: new Date(),
      })
      .where(and(eq(followupTemplates.id, id), eq(followupTemplates.userId, userId)))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ message: "Template not found" });
    }

    return res.json({ message: "Template updated", template: updated[0] });
  } catch (err) {
    console.error("PATCH /templates/:id error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * DELETE /api/templates/:id
 */
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await db
      .delete(followupTemplates)
      .where(and(eq(followupTemplates.id, id), eq(followupTemplates.userId, userId)))
      .returning();

    if (!deleted.length) {
      return res.status(404).json({ message: "Template not found" });
    }

    return res.json({ message: "Template deleted" });
  } catch (err) {
    console.error("DELETE /templates/:id error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/templates/:id/apply
 * Creates a followup using template defaults
 */
router.post("/:id/apply", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const tplRows = await db
      .select()
      .from(followupTemplates)
      .where(and(eq(followupTemplates.id, id), eq(followupTemplates.userId, userId)));

    if (!tplRows.length) {
      return res.status(404).json({ message: "Template not found" });
    }

    const tpl = tplRows[0];

    const dueAt = new Date(Date.now() + tpl.defaultDueOffsetMinutes * 60 * 1000);

    const inserted = await db
      .insert(followups)
      .values({
        userId,
        title: tpl.title,
        target: tpl.target,
        notes: tpl.notes,
        dueAt,
        priority: tpl.defaultPriority,
        reminderPolicy: tpl.defaultReminderPolicy,
      })
      .returning();

    await logEvent({
      followupId: inserted[0].id,
      userId,
      eventType: "CREATED",
      message: `Created from template: ${tpl.name}`,
    });

    return res.status(201).json({
      message: "Followup created from template",
      followup: inserted[0],
    });
  } catch (err) {
    console.error("POST /templates/:id/apply error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
