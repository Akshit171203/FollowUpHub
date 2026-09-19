import * as followupService from "./followup.service.js";
import { AiServiceError } from "../../services/ai.service.js";

const AI_ERROR_STATUS = {
  TIMEOUT: 503,
  RATE_LIMITED: 429,
  MISSING_KEY: 500,
  EMPTY_RESPONSE: 502,
  UPSTREAM_ERROR: 502,
};

function handleAiError(res, error, fallbackMessage) {
  if (error instanceof AiServiceError) {
    const status = AI_ERROR_STATUS[error.code] || 502;
    return res.status(status).json({ message: error.message });
  }
  console.error(fallbackMessage, error);
  return res.status(500).json({ message: fallbackMessage });
}

export const followupController = {
  /**
   * POST /api/followups
   */
  async create(req, res) {
    try {
      const { title, dueAt } = req.body;

      if (!title || !dueAt) {
        return res.status(400).json({ message: "title and dueAt are required" });
      }

      const followup = await followupService.createFollowup(req.user.id, req.body);

      return res.status(201).json({
        message: "Followup created",
        followup,
      });
    } catch (error) {
      console.error("Create followup error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * GET /api/followups
   */
  async list(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await followupService.listFollowups(req.user.id, { page, limit });

      return res.json(result);
    } catch (error) {
      console.error("List followups error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * GET /api/followups/:id
   */
  async getById(req, res) {
    const userId = req.user.id;
    const { id } = req.params;

    const followup = await followupService.getFollowupById(id);

    if (!followup) {
      return res.status(404).json({ message: "Followup not found" });
    }

    if (followup.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json({ followup });
  },

  /**
   * PATCH /api/followups/:id/done
   */
  async markDone(req, res) {
    try {
      const { id } = req.params;

      const followup = await followupService.markFollowupDone(req.user.id, id);

      if (!followup) {
        return res.status(404).json({ message: "Followup not found" });
      }

      return res.json({
        message: "Followup marked as DONE",
        followup,
      });
    } catch (error) {
      console.error("Done followup error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * PATCH /api/followups/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const followup = await followupService.updateFollowup(req.user.id, id, req.body);

      if (!followup) {
        return res.status(404).json({ message: "Followup not found" });
      }

      return res.json({ message: "Followup updated", followup });
    } catch (err) {
      console.error("PATCH /followups/:id error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * PATCH /api/followups/:id/snooze
   */
  async snooze(req, res) {
    const { id } = req.params;
    const { snoozeMinutes } = req.body;

    if (!snoozeMinutes || snoozeMinutes < 5) {
      return res.status(400).json({ message: "snoozeMinutes must be >= 5" });
    }

    const result = await followupService.snoozeFollowup(req.user.id, id, snoozeMinutes);

    if (result.notFound) {
      return res.status(404).json({ message: "Followup not found" });
    }

    if (result.cannotSnoozeDone) {
      return res.status(400).json({ message: "Cannot snooze a completed follow-up" });
    }

    return res.json({ message: "Followup snoozed", followup: result.followup });
  },

  /**
   * GET /api/followups/:id/events
   */
  async getEvents(req, res) {
    const events = await followupService.getFollowupEvents(req.user.id, req.params.id);
    return res.json({ events });
  },

  /**
   * PATCH /api/followups/:id/cancel
   */
  async cancel(req, res) {
    try {
      const followup = await followupService.cancelFollowup(req.user.id, req.params.id);

      if (!followup) {
        return res.status(404).json({ message: "Followup not found" });
      }

      return res.json({ message: "Followup cancelled", followup });
    } catch (error) {
      console.error("Cancel followup error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * POST /api/followups/extract
   */
  async extract(req, res) {
    try {
      const { text } = req.body;

      const extracted = await followupService.extractFollowupFromText(text);

      return res.json({ message: "Extracted", followup: extracted });
    } catch (error) {
      return handleAiError(res, error, "Extract followup error:");
    }
  },

  /**
   * POST /api/followups/:id/generate-draft
   */
  async generateDraft(req, res) {
    try {
      const { id } = req.params;

      const result = await followupService.generateDraftForFollowup(req.user.id, id);

      if (result.notFound) {
        return res.status(404).json({ message: "Followup not found" });
      }

      return res.json({ message: "Draft generated", followup: result.followup });
    } catch (error) {
      return handleAiError(res, error, "Generate draft error:");
    }
  },

  /**
   * DELETE /api/followups/:id
   */
  async remove(req, res) {
    try {
      const deleted = await followupService.deleteFollowup(req.user.id, req.params.id);

      if (!deleted) {
        return res.status(404).json({ message: "Followup not found" });
      }

      return res.json({ message: "Followup deleted" });
    } catch (error) {
      console.error("Delete followup error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
