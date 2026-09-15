import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../../config/db.js";
import { usersTable } from "../../../db/schema.js";
import { eq } from "drizzle-orm";
import { sendEmail } from "../../../config/mailer.js";

export function seedDefaultTemplates(userId) {
  import("../../../utils/templateSeeder.js")
    .then(({ seedUserTemplates }) => seedUserTemplates(userId))
    .catch((err) => console.error("Failed to dynamically import templateSeeder", err));
}

export async function findUserByEmail(email) {
  const rows = await db.select().from(usersTable).where(eq(usersTable.email, email));
  return rows[0] || null;
}

export async function findUserById(userId) {
  const rows = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  return rows[0] || null;
}

export async function createUser({ name, email, password }) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const inserted = await db
    .insert(usersTable)
    .values({
      name,
      email,
      password: hashedPassword,
      salt,
      verified: false,
    })
    .returning();

  return inserted[0];
}

export async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function createEmailVerificationToken(userId) {
  return jwt.sign(
    { userId, type: "emailVerification" },
    process.env.EMAIL_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
}

export function createPasswordResetToken(userId) {
  return jwt.sign(
    { userId, type: "passwordReset" },
    process.env.RESET_PASSWORD_SECRET,
    { expiresIn: "15m" }
  );
}

export function sendVerificationEmail(email, verifyToken) {
  const verifyUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/verify-email?token=${verifyToken}`;

  return sendEmail({
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
  });
}

export function sendPasswordResetEmail(email, resetToken) {
  const resetLink = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

  return sendEmail({
    to: email,
    subject: "Reset Your Password",
    html: `
      <h2>Password Reset</h2>
      <p>Click below to reset your password:</p>
      <a href="${resetLink}" target="_blank">Reset Password</a>
      <p>This link expires in 15 minutes.</p>
    `,
  });
}

/**
 * Verifies an emailVerification JWT and returns its userId.
 * Throws with a `code` of "EXPIRED" or "INVALID" on failure.
 */
export function verifyEmailToken(token) {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET);
  } catch (error) {
    const err = new Error(error.name === "TokenExpiredError" ? "Verification link expired" : "Invalid or expired verification token");
    err.code = error.name === "TokenExpiredError" ? "EXPIRED" : "INVALID";
    throw err;
  }

  if (decoded.type !== "emailVerification") {
    const err = new Error("Invalid verification token");
    err.code = "INVALID";
    throw err;
  }

  return decoded.userId;
}

export async function markUserVerified(userId) {
  await db.update(usersTable).set({ verified: true }).where(eq(usersTable.id, userId));
}

/**
 * Verifies a passwordReset JWT and returns its userId, or null if invalid/expired.
 */
export function verifyPasswordResetToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    if (decoded.type !== "passwordReset") return null;
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function updateUserPassword(userId, newPassword) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await db
    .update(usersTable)
    .set({ password: hashedPassword, salt })
    .where(eq(usersTable.id, userId));
}
