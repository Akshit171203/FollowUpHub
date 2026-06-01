import express from "express";
import bcrypt from "bcryptjs";
import { db } from "../../../config/db.js";
import { usersTable } from "../../../db/schema.js";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { authenticateUser } from "../../../middlewares/auth.middleware.js";
import { sendEmail } from "../../../config/mailer.js";
import { rateLimit } from "../../../middlewares/rateLimiter.js";
import { validate } from "../../../middlewares/validate.js";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
} from "../../../middlewares/schemas.js";


const router = express.Router();

// SIGNUP
router.post(
  "/signup",
  rateLimit({ keyPrefix: "signup", limit: 5, windowSec: 300 }),
  validate(signupSchema),
  async (req, res) => {
    const { email, password, name } = req.body;

    try {
      // Check if user exists
      const existingUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));

      if (existingUser.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert user
      const insertedUser = await db
        .insert(usersTable)
        .values({
          name,
          email,
          password: hashedPassword,
          salt,
          verified: false,
        })
        .returning();

      const newUser = insertedUser[0];

      // Seed default templates for the new user
      import("../../../utils/templateSeeder.js").then(({ seedUserTemplates }) => {
        seedUserTemplates(newUser.id);
      }).catch(err => console.error("Failed to dynamically import templateSeeder", err));

      // Create email verification token
      const verifyToken = jwt.sign(
        { userId: newUser.id, type: "emailVerification" },
        process.env.EMAIL_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      // Send verification email
      // Send verification email (fire-and-forget to prevent blocking)
      sendEmail({
        to: email,
        subject: "Verify your email",
        html: `
          <h2>Email Verification</h2>
          <p>Click below to verify your email:</p>
          <a href="${verifyUrl}">
            Verify Email
          </a>
          <p>This link expires in 1 hour.</p>
        `,
      }).catch(err => console.error("Failed to send background email:", err));

      return res.status(201).json({
        message: "Signup successful. Verification email sent.",
      });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// LOGIN
router.post(
  "/login",
  rateLimit({ keyPrefix: "login", limit: 8, windowSec: 300 }),
  validate(loginSchema),
  async (req, res) => {
    const { email, password } = req.body;

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (user.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const found = user[0];

    if (!found.verified) {
      return res.status(400).json({
        message: "Email not verified. Please verify before logging in.",
      });
    }

    const isValid = await bcrypt.compare(password, found.password);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const payload = { userId: found.id, email: found.email };
    const token = jwt.sign(payload, process.env.LOGIN_SECRET_KEY, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.json({ message: "Login successful", token });
  }
);

// PROTECTED PROFILE
router.get("/profile", authenticateUser, (req, res) => {
  res.json({
    message: "Profile accessed",
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.json({ message: "Logout successful" });
});

// VERIFY EMAIL
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Verification token missing" });
    }

    const decoded = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET);

    if (decoded.type !== "emailVerification") {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    const userId = decoded.userId;

    await db
      .update(usersTable)
      .set({ verified: true })
      .where(eq(usersTable.id, userId));

    return res.json({ message: "Email verified successfully!" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Verification link expired" });
    }
    return res
      .status(400)
      .json({ message: "Invalid or expired verification token" });
  }
});

// FORGOT PASSWORD
router.post(
  "/forgot-password",
  rateLimit({ keyPrefix: "forgot", limit: 3, windowSec: 300 }),
  validate(forgotPasswordSchema),
  async (req, res) => {
    const { email } = req.body;

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    // Always return success to avoid account enumeration
    if (user.length === 0) {
      return res.json({
        message: "Password reset link sent if account exists.",
      });
    }

    const found = user[0];

    const resetToken = jwt.sign(
      { userId: found.id, type: "passwordReset" },
      process.env.RESET_PASSWORD_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    // Send email in background
    sendEmail({
      to: email,
      subject: "Reset Your Password",
      html: `
        <h2>Password Reset</h2>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}" target="_blank">Reset Password</a>
        <p>This link expires in 15 minutes.</p>
      `,
    }).catch(err => console.error("Failed to send background email:", err));

    return res.json({ message: "Password reset link sent if account exists." });
  }
);

// RESET PASSWORD
router.post("/reset-password", validate(resetPasswordSchema), async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token) return res.status(400).json({ message: "Reset token missing" });
  if (!newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }

  if (decoded.type !== "passwordReset") {
    return res.status(400).json({ message: "Invalid reset token" });
  }

  const userId = decoded.userId;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await db
    .update(usersTable)
    .set({ password: hashedPassword, salt })
    .where(eq(usersTable.id, userId));

  return res.json({ message: "Password reset successful" });
});

// RESEND VERIFICATION EMAIL
router.post(
  "/resend-verification",
  rateLimit({ keyPrefix: "resendverify", limit: 3, windowSec: 300 }),
  validate(resendVerificationSchema),
  async (req, res) => {
    const { email } = req.body;

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    // Do NOT expose if account exists
    if (user.length === 0) {
      return res.json({ message: "Verification email sent" });
    }

    const found = user[0];

    // Detect Google OAuth account
    if (found.password === "GOOGLE_OAUTH") {
      return res.status(400).json({
        message:
          "This account was created using Google Sign-In. Please log in with Google.",
      });
    }
    if (found.verified) {
      return res.json({ message: "Email already verified" });
    }

    const verifyToken = jwt.sign(
      { userId: found.id, type: "emailVerification" },
      process.env.EMAIL_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    
    const verifyUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/verify-email?token=${verifyToken}`;

    // Send verification email in background
    sendEmail({
      to: email,
      subject: "Verify your email",
      html: `
        <h2>Email Verification</h2>
        <p>Click below to verify your email:</p>
        <a href="${verifyUrl}">
          Verify Email
        </a>
        <p>This link expires in 1 hour.</p>
      `,
    }).catch(err => console.error("Failed to send background email:", err));

    return res.json({ message: "Verification email sent" });
  }
);

export default router;
