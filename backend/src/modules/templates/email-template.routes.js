import express from "express";
import { db } from "../../config/db.js";
import { emailTemplates } from "../../db/schema.js";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
import { and, eq, desc } from "drizzle-orm";

const router = express.Router();

/**
 * GET /api/email-templates
 */
router.get("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const countResult = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.userId, userId));
    
    const total = countResult.length;

    const rows = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.userId, userId))
      .orderBy(desc(emailTemplates.updatedAt))
      .limit(limit)
      .offset(offset);

    return res.json({ 
      emailTemplates: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("GET /email-templates error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/email-templates/:id
 */
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const rows = await db
      .select()
      .from(emailTemplates)
      .where(and(eq(emailTemplates.id, id), eq(emailTemplates.userId, userId)));

    if (!rows.length) {
      return res.status(404).json({ message: "Email template not found" });
    }

    return res.json({ emailTemplate: rows[0] });
  } catch (err) {
    console.error("GET /email-templates/:id error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/email-templates
 */
router.post("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, subject, bodyHtml } = req.body;

    if (!name || !subject || !bodyHtml) {
      return res.status(400).json({ message: "Name, subject, and bodyHtml are required" });
    }

    const inserted = await db
      .insert(emailTemplates)
      .values({
        userId,
        name,
        type: type || "REMINDER",
        subject,
        bodyHtml,
      })
      .returning();

    return res.status(201).json({ 
      message: "Email template created", 
      emailTemplate: inserted[0] 
    });
  } catch (err) {
    console.error("POST /email-templates error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * PATCH /api/email-templates/:id
 */
router.patch("/:id", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, type, subject, bodyHtml } = req.body;

    const updated = await db
      .update(emailTemplates)
      .set({
        ...(name && { name }),
        ...(type && { type }),
        ...(subject && { subject }),
        ...(bodyHtml && { bodyHtml }),
        updatedAt: new Date(),
      })
      .where(and(eq(emailTemplates.id, id), eq(emailTemplates.userId, userId)))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ message: "Email template not found" });
    }

    return res.json({ 
      message: "Email template updated", 
      emailTemplate: updated[0] 
    });
  } catch (err) {
    console.error("PATCH /email-templates/:id error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * DELETE /api/email-templates/:id
 */
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await db
      .delete(emailTemplates)
      .where(and(eq(emailTemplates.id, id), eq(emailTemplates.userId, userId)))
      .returning();

    if (!deleted.length) {
      return res.status(404).json({ message: "Email template not found" });
    }

    return res.json({ message: "Email template deleted" });
  } catch (err) {
    console.error("DELETE /email-templates/:id error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
