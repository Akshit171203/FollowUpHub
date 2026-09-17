import * as oauthService from "../services/oauth.service.js";
import * as tokenService from "../services/token.service.js";

export const oauthController = {
  googleStart(req, res) {
    console.log("--- GOOGLE OAUTH START ---");
    console.log("CLIENT_ID from env:", process.env.GOOGLE_CLIENT_ID);
    console.log("Redirect URI being sent:", process.env.GOOGLE_REDIRECT_URI);

    res.redirect(oauthService.buildGoogleRedirectUrl());
  },

  async googleCallback(req, res) {
    try {
      const user = await oauthService.handleGoogleCallback(req.query.code);
      const { accessToken, refreshToken } = await tokenService.issueTokenPair(user);

      // Redirect to frontend with tokens in the URL for it to store
      res.redirect(
        `${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`
      );
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
      const user = await oauthService.handleGithubCallback(req.query.code);
      const { accessToken, refreshToken } = await tokenService.issueTokenPair(user);

      // Redirect to frontend with tokens in the URL for it to store
      res.redirect(
        `${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`
      );
    } catch (err) {
      console.error(err);
      res.redirect(`${process.env.CLIENT_URL}/login?error=github_failed`);
    }
  },
};
