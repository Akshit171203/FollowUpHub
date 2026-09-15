import * as authService from "../services/auth.service.js";
import * as tokenService from "../services/token.service.js";

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };
}

function refreshCookieOptions() {
  return {
    ...cookieOptions(),
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days, matches token.service.js's REFRESH_TOKEN_TTL_SECONDS
  };
}

export const authController = {
  async signup(req, res) {
    const { email, password, name } = req.body;

    try {
      const existingUser = await authService.findUserByEmail(email);

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const newUser = await authService.createUser({ name, email, password });

      authService.seedDefaultTemplates(newUser.id);

      const verifyToken = authService.createEmailVerificationToken(newUser.id);

      // Send verification email (fire-and-forget to prevent blocking)
      authService
        .sendVerificationEmail(email, verifyToken)
        .catch((err) => console.error("Failed to send background email:", err));

      return res.status(201).json({
        message: "Signup successful. Verification email sent.",
      });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  async login(req, res) {
    const { email, password } = req.body;

    const found = await authService.findUserByEmail(email);

    if (!found) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!found.verified) {
      return res.status(400).json({
        message: "Email not verified. Please verify before logging in.",
      });
    }

    const isValid = await authService.verifyPassword(password, found.password);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const { accessToken, refreshToken } = await tokenService.issueTokenPair(found);

    res.cookie("token", accessToken, cookieOptions());
    res.cookie("refreshToken", refreshToken, refreshCookieOptions());

    return res.json({ message: "Login successful", token: accessToken, refreshToken });
  },

  async refresh(req, res) {
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const result = await tokenService.rotateRefreshToken(refreshToken);

    if (result.error) {
      res.clearCookie("token", cookieOptions());
      res.clearCookie("refreshToken", refreshCookieOptions());
      return res.status(401).json({ message: "Session expired, please log in again" });
    }

    res.cookie("token", result.accessToken, cookieOptions());
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions());

    return res.json({ token: result.accessToken, refreshToken: result.refreshToken });
  },

  getProfile(req, res) {
    res.json({
      message: "Profile accessed",
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  },

  async logout(req, res) {
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;

    if (refreshToken) {
      await tokenService.revokeRefreshToken(refreshToken);
    }

    res.clearCookie("token", cookieOptions());
    res.clearCookie("refreshToken", refreshCookieOptions());
    res.json({ message: "Logout successful" });
  },

  async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({ message: "Verification token missing" });
      }

      const userId = authService.verifyEmailToken(token);
      await authService.markUserVerified(userId);

      return res.json({ message: "Email verified successfully!" });
    } catch (error) {
      if (error.code === "EXPIRED") {
        return res.status(400).json({ message: "Verification link expired" });
      }
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }
  },

  async forgotPassword(req, res) {
    const { email } = req.body;

    const found = await authService.findUserByEmail(email);

    // Always return success to avoid account enumeration
    if (!found) {
      return res.json({ message: "Password reset link sent if account exists." });
    }

    const resetToken = authService.createPasswordResetToken(found.id);

    authService
      .sendPasswordResetEmail(email, resetToken)
      .catch((err) => console.error("Failed to send background email:", err));

    return res.json({ message: "Password reset link sent if account exists." });
  },

  async resetPassword(req, res) {
    const { token, newPassword } = req.body;

    if (!token) return res.status(400).json({ message: "Reset token missing" });
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const userId = authService.verifyPasswordResetToken(token);
    if (!userId) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    await authService.updateUserPassword(userId, newPassword);

    return res.json({ message: "Password reset successful" });
  },

  async resendVerification(req, res) {
    const { email } = req.body;

    const found = await authService.findUserByEmail(email);

    // Do NOT expose if account exists
    if (!found) {
      return res.json({ message: "Verification email sent" });
    }

    // Detect Google OAuth account
    if (found.password === "GOOGLE_OAUTH") {
      return res.status(400).json({
        message: "This account was created using Google Sign-In. Please log in with Google.",
      });
    }
    if (found.verified) {
      return res.json({ message: "Email already verified" });
    }

    const verifyToken = authService.createEmailVerificationToken(found.id);

    authService
      .sendVerificationEmail(email, verifyToken)
      .catch((err) => console.error("Failed to send background email:", err));

    return res.json({ message: "Verification email sent" });
  },
};
