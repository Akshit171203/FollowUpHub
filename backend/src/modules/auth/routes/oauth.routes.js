import express from "express";
import jwt from "jsonwebtoken";
import { db } from "../../../config/db.js";
import { usersTable } from "../../../db/schema.js";
import { eq } from "drizzle-orm";
import { getGoogleTokens, getGoogleUser } from "../../../utils/googleOAuth.js";

import axios from "axios";

const router = express.Router();

//Google OAuth Routes
// STEP 1 — Redirect user to Google
router.get("/google", (req, res) => {
  console.log("--- GOOGLE OAUTH START ---");
  console.log("CLIENT_ID from env:", process.env.GOOGLE_CLIENT_ID);
  console.log("Redirect URI being sent:", process.env.GOOGLE_REDIRECT_URI);

  const redirectUrl = 
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      prompt: "select_account",
    });

  res.redirect(redirectUrl);
});
//STEP 2 — Google redirects back with a ?code=
router.get("/google/callback", async (req, res) => {
  try {
    const code = req.query.code;
    const { access_token, id_token } = await getGoogleTokens({
      code,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    });

    const googleUser = await getGoogleUser(id_token, access_token);

    const { email, name, picture } = googleUser;

    // Check if user exists
    let existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    let user;

    if (existing.length === 0) {
      // Create new user with no password (OAuth flag)
      const created = await db
        .insert(usersTable)
        .values({
          name,
          email,
          password: "GOOGLE_OAUTH",
          salt: "GOOGLE_OAUTH",
          verified: true,
        })
        .returning();

      user = created[0];
    } else {
      user = existing[0];
    }

    // Create JWT session token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.LOGIN_SECRET_KEY,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    // Redirect to frontend dashboard
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
});


//Github OAuth Routes
// STEP 1 — Redirect user to Github
router.get("/github", (req, res) => {
  console.log("--- GITHUB OAUTH START ---");
  console.log("CLIENT_ID from env:", process.env.GITHUB_CLIENT_ID);
  console.log("Redirect URI being sent:", process.env.GITHUB_REDIRECT_URI);

  const url =
    "https://github.com/login/oauth/authorize?" +
    new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: process.env.GITHUB_REDIRECT_URI,
      scope: "read:user user:email",
    });

  res.redirect(url);
});
//STEP 2 — Github redirects back with a ?code=
router.get("/github/callback", async (req, res) => {
  try {
    const code = req.query.code;

    // Exchange code for access_token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const access_token = tokenResponse.data.access_token;

    // Fetch GitHub user info
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const emailResponse = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const githubUser = userResponse.data;
    const emailObj = emailResponse.data.find(e => e.primary) || emailResponse.data[0];

    const name = githubUser.name || githubUser.login;
    const email = emailObj.email;

    // Check if user exists in DB
    let existing = await db.select().from(usersTable).where(eq(usersTable.email, email));

    let user;
    if (existing.length === 0) {
      const created = await db
        .insert(usersTable)
        .values({
          name,
          email,
          password: "GITHUB_OAUTH",
          salt: "GITHUB_OAUTH",
          verified: true,
        })
        .returning();

      user = created[0];
    } else {
      user = existing[0];
    }

    // Issue JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.LOGIN_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.redirect(`${process.env.CLIENT_URL}/dashboard`);

  } catch (err) {
    console.error(err);
    res.redirect(`${process.env.CLIENT_URL}/login?error=github_failed`);
  }
});

export default router;
