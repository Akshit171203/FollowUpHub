import { getEventTimeline } from "./event.service.js";

export const eventController = {
  /**
   * GET /api/events/timeline
   * Global timeline for the user
   * Pagination: ?page=1&limit=10
   */
  async getTimeline(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await getEventTimeline(req.user.id, { page, limit });

      return res.json(result);
    } catch (err) {
      console.error("GET /events/timeline error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
