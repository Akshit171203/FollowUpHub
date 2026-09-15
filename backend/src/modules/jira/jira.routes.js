import express from "express";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";
import { connectJiraSchema, listFollowupsQuery } from "../../middlewares/schemas.js";
import { jiraController } from "./jira.controller.js";

const router = express.Router();

router.post("/connect", authenticateUser, validate(connectJiraSchema), jiraController.connect);
router.get("/sync", authenticateUser, jiraController.sync);
router.get("/tickets", authenticateUser, validate(listFollowupsQuery), jiraController.listTickets);
router.delete("/disconnect", authenticateUser, jiraController.disconnect);

export default router;
