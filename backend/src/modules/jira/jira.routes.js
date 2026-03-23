import express from "express";
import { db } from "../../config/db.js";
import { usersTable, followups } from "../../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
import { encrypt } from "../../utils/encryption.js";
import { syncUserJiraTickets } from "../../services/jira.service.js";

const router = express.Router();

/**
 * POST /api/jira/connect
 * Connect Jira Account securely
 */
router.post("/connect", authenticateUser, async (req, res) => {
  try {
    const { jiraEmail, jiraDomain, jiraApiToken, managerEmail } = req.body;

    if (!jiraEmail || !jiraDomain || !jiraApiToken) {
      return res.status(400).json({ message: "jiraEmail, jiraDomain, and jiraApiToken are required" });
    }

    // Encrypt the API token securely with AES-256-GCM
    const encryptedToken = encrypt(jiraApiToken);

    await db.update(usersTable).set({
      jiraEmail,
      jiraDomain,
      jiraApiToken: encryptedToken,
      managerEmail: managerEmail || req.user.managerEmail,
      updatedAt: new Date()
    }).where(eq(usersTable.id, req.user.id));

    return res.json({ message: "Jira connected successfully" });
  } catch (error) {
    console.error("Jira connection error:", error);
    return res.status(500).json({ message: "Internal server error connecting to Jira", error: error.message });
  }
});

/**
 * GET /api/jira/sync
 * Manually trigger Jira Sync for the authenticated user
 */
router.get("/sync", authenticateUser, async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id));
    
    if (!user.jiraApiToken) {
      return res.status(400).json({ message: "Jira is not connected" });
    }

    const result = await syncUserJiraTickets(user);

    if (result.success) {
      return res.json({ message: "Jira sync successful", count: result.count });
    } else {
      return res.status(500).json({ message: "Jira sync failed", error: result.error });
    }
  } catch (error) {
    console.error("Manual Jira sync error:", error);
    return res.status(500).json({ message: "Internal server error during sync", error: error.message });
  }
});

/**
 * GET /api/jira/tickets
 * List synced Jira tickets
 */
router.get("/tickets", authenticateUser, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const query = and(
        eq(followups.userId, req.user.id),
        eq(followups.externalSource, "JIRA")
    );

    const countResult = await db.select().from(followups).where(query);
    const total = countResult.length;

    const rows = await db
      .select()
      .from(followups)
      .where(query)
      .orderBy(desc(followups.updatedAt))
      .limit(limit)
      .offset(offset);

    // Provide user Jira status to UI
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id));

    return res.json({
      settings: {
        isConnected: !!user.jiraApiToken,
        jiraEmail: user.jiraEmail,
        jiraDomain: user.jiraDomain,
        managerEmail: user.managerEmail,
      },
      tickets: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("List Jira tickets error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * DELETE /api/jira/disconnect
 * Clear Jira credentials
 */
router.delete("/disconnect", authenticateUser, async (req, res) => {
  try {
    await db.update(usersTable).set({
      jiraEmail: null,
      jiraDomain: null,
      jiraApiToken: null,
      updatedAt: new Date()
    }).where(eq(usersTable.id, req.user.id));

    // Optional: Mark all Jira followups as inactive/done
    // await db.update(followups).set({ isActive: false, status: 'DONE' }) ...

    return res.json({ message: "Jira disconnected" });
  } catch (error) {
    console.error("Disconnect Jira error:", error);
    return res.status(500).json({ message: "Internal server error disconnecting from Jira" });
  }
});

export default router;
