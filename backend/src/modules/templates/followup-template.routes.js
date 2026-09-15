import express from "express";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";
import {
  createTemplateSchema,
  updateTemplateSchema,
  followupIdParam,
  listFollowupsQuery,
} from "../../middlewares/schemas.js";
import { templateController } from "./followup-template.controller.js";

const router = express.Router();

router.post("/", authenticateUser, validate(createTemplateSchema), templateController.create);
router.get("/", authenticateUser, validate(listFollowupsQuery), templateController.list);
router.get("/:id", authenticateUser, validate(followupIdParam), templateController.getById);
router.patch("/:id", authenticateUser, validate(updateTemplateSchema), templateController.update);
router.delete("/:id", authenticateUser, validate(followupIdParam), templateController.remove);
router.post("/:id/apply", authenticateUser, validate(followupIdParam), templateController.apply);

export default router;
