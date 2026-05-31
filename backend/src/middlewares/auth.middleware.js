import { db } from "../config/db.js";
import { usersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function authenticateUser(req, res, next) {
  try {
    // Check Authorization header first (for Safari/mobile), fall back to cookie
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
    if (!token) {
      token = req.cookies?.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.LOGIN_SECRET_KEY);
    const userId = decoded.userId;

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (user.length === 0) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user[0];
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
}

export const ensureAuthenticated = function (req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

export const restrictToRole = function (role) {
  return function (req, res, next) {
    if (req.user.role !== role) {
      return res
        .status(401)
        .json({ error: "You are not authorized to access this resource" });
    }
    return next();
  };
};
