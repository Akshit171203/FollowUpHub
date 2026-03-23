import { db } from "./src/config/db.js";
import { usersTable } from "./src/db/schema.js";
import { eq, isNotNull } from "drizzle-orm";

async function run() {
  const users = await db.select().from(usersTable).where(isNotNull(usersTable.jiraApiToken));
  for (const user of users) {
    if (user.jiraDomain && user.jiraDomain.includes('/')) {
      const cleanDomain = user.jiraDomain.replace(/^https?:\/\//, '').split('/')[0];
      console.log(`Fixing domain from ${user.jiraDomain} to ${cleanDomain}`);
      await db.update(usersTable).set({ jiraDomain: cleanDomain }).where(eq(usersTable.id, user.id));
    }
  }
  process.exit(0);
}
run();
