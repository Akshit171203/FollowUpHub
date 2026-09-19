import express from "express";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";
import { rateLimit } from "../../middlewares/rateLimiter.js";
import {
  createFollowupSchema,
  updateFollowupSchema,
  snoozeFollowupSchema,
  followupIdParam,
  listFollowupsQuery,
  extractFollowupSchema,
} from "../../middlewares/schemas.js";
import { followupController } from "./followup.controller.js";

const router = express.Router();

const aiRateLimit = (keyPrefix, limit) =>
  rateLimit({ keyPrefix, limit, windowSec: 3600, keyFn: (req) => req.user?.id });

router.post("/", authenticateUser, validate(createFollowupSchema), followupController.create);
router.get("/", authenticateUser, validate(listFollowupsQuery), followupController.list);
router.get("/:id", authenticateUser, validate(followupIdParam), followupController.getById);
router.patch("/:id/done", authenticateUser, validate(followupIdParam), followupController.markDone);
router.patch("/:id", authenticateUser, validate(updateFollowupSchema), followupController.update);
router.patch("/:id/snooze", authenticateUser, validate(snoozeFollowupSchema), followupController.snooze);
router.get("/:id/events", authenticateUser, followupController.getEvents);
router.post(
  "/extract",
  authenticateUser,
  aiRateLimit("ai-extract", 15),
  validate(extractFollowupSchema),
  followupController.extract
);
router.post(
  "/:id/generate-draft",
  authenticateUser,
  aiRateLimit("ai-generate-draft", 20),
  validate(followupIdParam),
  followupController.generateDraft
);
router.patch("/:id/cancel", authenticateUser, validate(followupIdParam), followupController.cancel);
router.delete("/:id", authenticateUser, validate(followupIdParam), followupController.remove);

export default router;
