import { db } from "./src/config/db.js";
import { followups } from "./src/db/schema.js";
import { eq } from "drizzle-orm";

async function run() {
  const allFollowups = await db.select().from(followups).where(eq(followups.externalSource, "JIRA"));
  console.log("JIRA FOLLOWUPS:", allFollowups.map(f => ({
    id: f.id,
    title: f.title,
    externalId: f.externalId,
    status: f.status
  })));
  
  process.exit(0);
}
run();
