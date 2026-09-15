import * as jiraService from "./jira.service.js";

export const jiraController = {
  /**
   * POST /api/jira/connect
   */
  async connect(req, res) {
    try {
      const { jiraEmail, jiraDomain, jiraApiToken } = req.body;

      if (!jiraEmail || !jiraDomain || !jiraApiToken) {
        return res.status(400).json({ message: "jiraEmail, jiraDomain, and jiraApiToken are required" });
      }

      await jiraService.connectJiraAccount(req.user.id, req.user.managerEmail, req.body);

      return res.json({ message: "Jira connected successfully" });
    } catch (error) {
      console.error("Jira connection error:", error);
      return res.status(500).json({ message: "Internal server error connecting to Jira", error: error.message });
    }
  },

  /**
   * GET /api/jira/sync
   */
  async sync(req, res) {
    try {
      const result = await jiraService.syncUserById(req.user.id);

      if (result.notConnected) {
        return res.status(400).json({ message: "Jira is not connected" });
      }

      if (result.success) {
        return res.json({ message: "Jira sync successful", count: result.count });
      }

      return res.status(500).json({ message: "Jira sync failed", error: result.error });
    } catch (error) {
      console.error("Manual Jira sync error:", error);
      return res.status(500).json({ message: "Internal server error during sync", error: error.message });
    }
  },

  /**
   * GET /api/jira/tickets
   */
  async listTickets(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await jiraService.listJiraTickets(req.user.id, { page, limit });

      return res.json(result);
    } catch (error) {
      console.error("List Jira tickets error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * DELETE /api/jira/disconnect
   */
  async disconnect(req, res) {
    try {
      await jiraService.disconnectJiraAccount(req.user.id);

      return res.json({ message: "Jira disconnected" });
    } catch (error) {
      console.error("Disconnect Jira error:", error);
      return res.status(500).json({ message: "Internal server error disconnecting from Jira" });
    }
  },
};
