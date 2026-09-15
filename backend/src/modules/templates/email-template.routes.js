import express from "express";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";
import {
  createEmailTemplateSchema,
  updateEmailTemplateSchema,
  followupIdParam,
  listFollowupsQuery,
} from "../../middlewares/schemas.js";
import { emailTemplateController } from "./email-template.controller.js";

const router = express.Router();

router.get("/", authenticateUser, validate(listFollowupsQuery), emailTemplateController.list);
router.get("/:id", authenticateUser, validate(followupIdParam), emailTemplateController.getById);
router.post("/", authenticateUser, validate(createEmailTemplateSchema), emailTemplateController.create);
router.patch("/:id", authenticateUser, validate(updateEmailTemplateSchema), emailTemplateController.update);
router.delete("/:id", authenticateUser, validate(followupIdParam), emailTemplateController.remove);

export default router;
