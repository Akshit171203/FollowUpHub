import jwt from "jsonwebtoken";
import crypto from "crypto";
import { redisClient } from "../../../config/redis.js";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

function refreshKey(tokenId) {
  return `auth:refresh:${tokenId}`;
}

function familyKey(familyId) {
  return `auth:family:${familyId}`;
}

export function createAccessToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.LOGIN_SECRET_KEY,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

async function storeRefreshToken({ id, email }, familyId, tokenId) {
  await redisClient.set(
    refreshKey(tokenId),
    JSON.stringify({ userId: id, email, familyId }),
    { EX: REFRESH_TOKEN_TTL_SECONDS }
  );
  await redisClient.set(familyKey(familyId), tokenId, { EX: REFRESH_TOKEN_TTL_SECONDS });
}

/**
 * Issues a fresh access + refresh token pair for a new login, starting a new
 * rotation "family" for this session.
 */
export async function issueTokenPair(user) {
  const familyId = crypto.randomUUID();
  const tokenId = crypto.randomBytes(32).toString("hex");

  await storeRefreshToken(user, familyId, tokenId);

  return {
    accessToken: createAccessToken(user),
    refreshToken: tokenId,
  };
}

/**
 * Rotates a refresh token: validates it, then checks it's still the current
 * token for its family. If an older, already-rotated token is replayed, that's
 * a strong signal of theft (someone captured a refresh token that has since
 * been used by the legitimate client) — the whole family is revoked, forcing
 * a fresh login instead of silently accepting the stale token.
 *
 * Returns { accessToken, refreshToken } on success, or
 * { error: "INVALID" | "REUSE_DETECTED" } on failure.
 */
export async function rotateRefreshToken(oldToken) {
  const raw = await redisClient.get(refreshKey(oldToken));

  if (!raw) {
    return { error: "INVALID" };
  }

  const { userId, email, familyId } = JSON.parse(raw);
  const currentTokenId = await redisClient.get(familyKey(familyId));

  if (currentTokenId !== oldToken) {
    await redisClient.del(familyKey(familyId));
    return { error: "REUSE_DETECTED" };
  }

  const newTokenId = crypto.randomBytes(32).toString("hex");
  const user = { id: userId, email };
  await storeRefreshToken(user, familyId, newTokenId);

  return {
    accessToken: createAccessToken(user),
    refreshToken: newTokenId,
  };
}

/**
 * Revokes a refresh token's entire family (used on logout). Safe to call
 * with an unknown/already-expired token — it's a no-op.
 */
export async function revokeRefreshToken(token) {
  if (!token) return;

  const raw = await redisClient.get(refreshKey(token));
  if (!raw) return;

  const { familyId } = JSON.parse(raw);
  await redisClient.del(familyKey(familyId));
  await redisClient.del(refreshKey(token));
}
