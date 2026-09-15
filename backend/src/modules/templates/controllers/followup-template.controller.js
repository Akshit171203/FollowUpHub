import * as templateService from "../services/followup-template.service.js";

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const templateController = {
  async create(req, res) {
    try {
      const { name, title } = req.body;

      if (!name || !title) {
        return res.status(400).json({ message: "name and title are required" });
      }

      const template = await templateService.createTemplate(req.user.id, req.body);

      return res.status(201).json({ message: "Template created", template });
    } catch (err) {
      console.error("POST /templates error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  async list(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await templateService.listTemplates(req.user.id, { page, limit });

      return res.json(result);
    } catch (err) {
      console.error("GET /templates error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      if (!UUID_RE.test(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }

      const template = await templateService.getTemplateById(req.user.id, id);

      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      return res.json({ template });
    } catch (err) {
      console.error("GET /templates/:id error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;

      const template = await templateService.updateTemplate(req.user.id, id, req.body);

      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      return res.json({ message: "Template updated", template });
    } catch (err) {
      console.error("PATCH /templates/:id error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const deleted = await templateService.deleteTemplate(req.user.id, id);

      if (!deleted) {
        return res.status(404).json({ message: "Template not found" });
      }

      return res.json({ message: "Template deleted" });
    } catch (err) {
      console.error("DELETE /templates/:id error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  async apply(req, res) {
    try {
      const { id } = req.params;

      const result = await templateService.applyTemplate(req.user.id, id);

      if (!result.success) {
        return res.status(404).json({ message: result.error });
      }

      return res.status(201).json({
        message: "Followup created from template",
        followup: result.followup,
      });
    } catch (err) {
      console.error("POST /templates/:id/apply error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
