import { db } from "../../../config/db.js";
import { usersTable } from "../../../db/schema.js";

export async function listAllUsers() {
  return db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
    })
    .from(usersTable);
}
