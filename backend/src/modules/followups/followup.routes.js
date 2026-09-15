import express from "express";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";
import {
  createFollowupSchema,
  updateFollowupSchema,
  snoozeFollowupSchema,
  followupIdParam,
  listFollowupsQuery,
} from "../../middlewares/schemas.js";
import { followupController } from "./followup.controller.js";

const router = express.Router();

router.post("/", authenticateUser, validate(createFollowupSchema), followupController.create);
router.get("/", authenticateUser, validate(listFollowupsQuery), followupController.list);
router.get("/:id", authenticateUser, validate(followupIdParam), followupController.getById);
router.patch("/:id/done", authenticateUser, validate(followupIdParam), followupController.markDone);
router.patch("/:id", authenticateUser, validate(updateFollowupSchema), followupController.update);
router.patch("/:id/snooze", authenticateUser, validate(snoozeFollowupSchema), followupController.snooze);
router.get("/:id/events", authenticateUser, followupController.getEvents);
router.patch("/:id/cancel", authenticateUser, validate(followupIdParam), followupController.cancel);
router.delete("/:id", authenticateUser, validate(followupIdParam), followupController.remove);

export default router;
