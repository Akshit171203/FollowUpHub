import { db } from "./src/config/db.js";
import { jiraSyncLogs } from "./src/db/schema.js";
import { desc } from "drizzle-orm";

async function run() {
  const logs = await db.select().from(jiraSyncLogs).orderBy(desc(jiraSyncLogs.createdAt)).limit(5);
  console.log("LAST 5 JIRA LOGS:", logs);
  process.exit(0);
}
run();
