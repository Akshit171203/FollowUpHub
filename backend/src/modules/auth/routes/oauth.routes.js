import express from "express";
import { oauthController } from "../controllers/oauth.controller.js";

const router = express.Router();

// Google OAuth Routes
router.get("/google", oauthController.googleStart);
router.get("/google/callback", oauthController.googleCallback);

// GitHub OAuth Routes
router.get("/github", oauthController.githubStart);
router.get("/github/callback", oauthController.githubCallback);

export default router;
