import cron from "node-cron";
import { runReminderEngine, runTodoReminderEngine } from "../services/reminder.service.js";
import { opsflow } from "../services/opsflow.service.js";

export function startReminderJob() {
  console.log("[Cron] Reminder Job started (every minute) at", new Date().toISOString());

  const job = cron.schedule("* * * * *", async () => {
    const now = new Date();
    console.log(`[Cron] [${now.toISOString()}] Running reminder engine...`);
    try {
      await opsflow.trackJob({ id: "reminder-engine", title: "Reminder engine is failing" }, async () => {
        await runReminderEngine();
        await runTodoReminderEngine();
      });
    } catch (err) {
      console.error(`[Cron] [${now.toISOString()}] Reminder engine error:`, err);
    }
    console.log(`[Cron] [${now.toISOString()}] Reminder engine completed.`);
  });

  console.log("[Cron] Reminder job scheduled:", job ? "SUCCESS" : "FAILED");
  return job;
}
