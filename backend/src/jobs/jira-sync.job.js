import cron from "node-cron";
import { syncAllJiraUsers } from "../services/jira.service.js";

export function startJiraSyncJob() {
  console.log(" Jira Sync Cron Job started (runs every 5 minutes) at", new Date().toISOString());

  // Run every 5 minutes
  const job = cron.schedule("*/5 * * * *", async () => {
    const now = new Date();
    console.log(` [${now.toISOString()}] Running Jira Sync Engine...`);
    
    try {
      await syncAllJiraUsers();
    } catch (err) {
      console.error(` [${now.toISOString()}] Jira Sync Engine error:`, err);
    }
    
    console.log(` [${now.toISOString()}] Jira Sync Engine completed.`);
  });

  console.log(" Jira Sync job scheduled:", job ? "SUCCESS" : "FAILED");
}
