import express from "express";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
import { eventController } from "./event.controller.js";

const router = express.Router();

router.get("/timeline", authenticateUser, eventController.getTimeline);

export default router;
