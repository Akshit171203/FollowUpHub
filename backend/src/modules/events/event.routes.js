import express from "express";
import { db } from "../../config/db.js";
import { followupEvents, followups } from "../../db/schema.js";
import { eq, desc, and } from "drizzle-orm";
import { authenticateUser } from "../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * GET /api/events/timeline
 * Global timeline for the user
 * Pagination: ?page=1&limit=10
 */
router.get("/timeline", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await db
      .select({ id: followupEvents.id })
      .from(followupEvents)
      .where(eq(followupEvents.userId, userId));
    
    const total = countResult.length;

    // Get paginated events with followup details
    const rows = await db
      .select({
        id: followupEvents.id,
        eventType: followupEvents.eventType,
        message: followupEvents.message,
        createdAt: followupEvents.createdAt,
        followupId: followupEvents.followupId,
        
        // optional: include followup basic details
        followupTitle: followups.title,
      })
      .from(followupEvents)
      .leftJoin(followups, eq(followupEvents.followupId, followups.id))
      .where(eq(followupEvents.userId, userId))
      .orderBy(desc(followupEvents.createdAt))
      .limit(limit)
      .offset(offset);

    return res.json({ 
      events: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("GET /events/timeline error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
