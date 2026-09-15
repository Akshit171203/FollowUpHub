import cron from "node-cron";
import { syncAllJiraUsers } from "../modules/jira/jira.service.js";

export function startJiraSyncJob() {
  console.log("[Cron] Jira Sync Job started (every 5 minutes) at", new Date().toISOString());

  // Run every 5 minutes
  const job = cron.schedule("*/5 * * * *", async () => {
    const now = new Date();
    console.log(`[Cron] [${now.toISOString()}] Running Jira Sync Engine...`);
    
    try {
      await syncAllJiraUsers();
    } catch (err) {
      console.error(`[Cron] [${now.toISOString()}] Jira Sync Engine error:`, err);
    }
    
    console.log(`[Cron] [${now.toISOString()}] Jira Sync Engine completed.`);
  });

  console.log("[Cron] Jira Sync job scheduled:", job ? "SUCCESS" : "FAILED");
  return job;
}
