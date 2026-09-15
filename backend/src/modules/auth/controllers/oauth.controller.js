import * as oauthService from "../services/oauth.service.js";

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };
}

export const oauthController = {
  googleStart(req, res) {
    console.log("--- GOOGLE OAUTH START ---");
    console.log("CLIENT_ID from env:", process.env.GOOGLE_CLIENT_ID);
    console.log("Redirect URI being sent:", process.env.GOOGLE_REDIRECT_URI);

    res.redirect(oauthService.buildGoogleRedirectUrl());
  },

  async googleCallback(req, res) {
    try {
      const token = await oauthService.handleGoogleCallback(req.query.code);

      res.cookie("token", token, cookieOptions());

      // Redirect to frontend with token in URL (works on Safari/mobile)
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    } catch (err) {
      console.error("Google OAuth error:", err);
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  },

  githubStart(req, res) {
    console.log("--- GITHUB OAUTH START ---");
    console.log("CLIENT_ID from env:", process.env.GITHUB_CLIENT_ID);
    console.log("Redirect URI being sent:", process.env.GITHUB_REDIRECT_URI);

    res.redirect(oauthService.buildGithubRedirectUrl());
  },

  async githubCallback(req, res) {
    try {
      const token = await oauthService.handleGithubCallback(req.query.code);

      res.cookie("token", token, cookieOptions());

      // Redirect to frontend with token in URL (works on Safari/mobile)
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    } catch (err) {
      console.error(err);
      res.redirect(`${process.env.CLIENT_URL}/login?error=github_failed`);
    }
  },
};
