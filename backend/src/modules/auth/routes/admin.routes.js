import express from "express";
import { db } from "../../../config/db.js";
import { usersTable } from "../../../db/schema.js";
import { ensureAuthenticated, restrictToRole } from "../../../middlewares/auth.middleware.js";
const router = express.Router();

//Get route for admin to see all the users
router.get("/", ensureAuthenticated, restrictToRole("ADMIN"), async (req, res) => {
  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
    })
    .from(usersTable);

  return res.json({
    message: "All users retrieved",
    users,
  });
});

export default router;
