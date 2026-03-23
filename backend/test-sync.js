import { db } from "./src/config/db.js";
import { usersTable } from "./src/db/schema.js";
import { isNotNull } from "drizzle-orm";
import { syncUserJiraTickets } from "./src/services/jira.service.js";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  try {
    const users = await db.select().from(usersTable).where(isNotNull(usersTable.jiraApiToken));
    if (users.length === 0) return;
    const user = users[0];
    
    console.log("Testing sync for user:", user.email, "domain:", user.jiraDomain);
    const result = await syncUserJiraTickets(user);
    console.log("Result:", result);
  } catch (err) {
    console.error("Fatal:", err);
  }
  process.exit(0);
}
run();
