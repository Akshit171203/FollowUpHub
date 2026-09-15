import axios from "axios";
import { db } from "../../../config/db.js";
import { usersTable } from "../../../db/schema.js";
import { eq } from "drizzle-orm";
import { getGoogleTokens, getGoogleUser } from "../../../utils/googleOAuth.js";
import { seedDefaultTemplates } from "./auth.service.js";

export function buildGoogleRedirectUrl() {
  return (
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      prompt: "select_account",
    })
  );
}

export function buildGithubRedirectUrl() {
  return (
    "https://github.com/login/oauth/authorize?" +
    new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: process.env.GITHUB_REDIRECT_URI,
      scope: "read:user user:email",
    })
  );
}

async function findOrCreateOAuthUser({ name, email, provider }) {
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (existing.length > 0) {
    return existing[0];
  }

  const created = await db
    .insert(usersTable)
    .values({
      name,
      email,
      password: provider,
      salt: provider,
      verified: true,
    })
    .returning();

  const user = created[0];
  seedDefaultTemplates(user.id);

  return user;
}

export async function handleGoogleCallback(code) {
  const { access_token, id_token } = await getGoogleTokens({
    code,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  });

  const googleUser = await getGoogleUser(id_token, access_token);
  const { email, name } = googleUser;

  return findOrCreateOAuthUser({ name, email, provider: "GOOGLE_OAUTH" });
}

export async function handleGithubCallback(code) {
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

  const userResponse = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const emailResponse = await axios.get("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const githubUser = userResponse.data;
  const emailObj = emailResponse.data.find((e) => e.primary) || emailResponse.data[0];

  const name = githubUser.name || githubUser.login;
  const email = emailObj.email;

  return findOrCreateOAuthUser({ name, email, provider: "GITHUB_OAUTH" });
}
