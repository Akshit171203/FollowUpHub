import * as emailTemplateService from "./email-template.service.js";

export const emailTemplateController = {
  async list(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await emailTemplateService.listEmailTemplates(req.user.id, { page, limit });

      return res.json(result);
    } catch (err) {
      console.error("GET /email-templates error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const emailTemplate = await emailTemplateService.getEmailTemplateById(req.user.id, id);

      if (!emailTemplate) {
        return res.status(404).json({ message: "Email template not found" });
      }

      return res.json({ emailTemplate });
    } catch (err) {
      console.error("GET /email-templates/:id error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  async create(req, res) {
    try {
      const { name, subject, bodyHtml } = req.body;

      if (!name || !subject || !bodyHtml) {
        return res.status(400).json({ message: "Name, subject, and bodyHtml are required" });
      }

      const emailTemplate = await emailTemplateService.createEmailTemplate(req.user.id, req.body);

      return res.status(201).json({
        message: "Email template created",
        emailTemplate,
      });
    } catch (err) {
      console.error("POST /email-templates error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;

      const emailTemplate = await emailTemplateService.updateEmailTemplate(req.user.id, id, req.body);

      if (!emailTemplate) {
        return res.status(404).json({ message: "Email template not found" });
      }

      return res.json({
        message: "Email template updated",
        emailTemplate,
      });
    } catch (err) {
      console.error("PATCH /email-templates/:id error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const deleted = await emailTemplateService.deleteEmailTemplate(req.user.id, id);

      if (!deleted) {
        return res.status(404).json({ message: "Email template not found" });
      }

      return res.json({ message: "Email template deleted" });
    } catch (err) {
      console.error("DELETE /email-templates/:id error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
