import express from "express";
import { authenticateUser } from "../../../middlewares/auth.middleware.js";
import { rateLimit } from "../../../middlewares/rateLimiter.js";
import { validate } from "../../../middlewares/validate.js";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  refreshTokenSchema,
} from "../../../middlewares/schemas.js";
import { authController } from "../controllers/auth.controller.js";

const router = express.Router();

router.post(
  "/signup",
  rateLimit({ keyPrefix: "signup", limit: 5, windowSec: 300 }),
  validate(signupSchema),
  authController.signup
);

router.post(
  "/login",
  rateLimit({ keyPrefix: "login", limit: 8, windowSec: 300 }),
  validate(loginSchema),
  authController.login
);

router.get("/profile", authenticateUser, authController.getProfile);

router.post(
  "/refresh",
  rateLimit({ keyPrefix: "refresh", limit: 30, windowSec: 300 }),
  validate(refreshTokenSchema),
  authController.refresh
);

router.post("/logout", authController.logout);

router.get("/verify-email", authController.verifyEmail);

router.post(
  "/forgot-password",
  rateLimit({ keyPrefix: "forgot", limit: 3, windowSec: 300 }),
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

router.post(
  "/resend-verification",
  rateLimit({ keyPrefix: "resendverify", limit: 3, windowSec: 300 }),
  validate(resendVerificationSchema),
  authController.resendVerification
);

export default router;
