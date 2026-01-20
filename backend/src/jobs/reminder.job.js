import cron from "node-cron";
import { runReminderEngine, runTodoReminderEngine } from "../services/reminder.service.js";

export function startReminderJob() {
  console.log(" Reminder Cron Job started (runs every minute) at", new Date().toISOString());

  const job = cron.schedule("* * * * *", async () => {
    const now = new Date();
    console.log(` [${now.toISOString()}] Running reminder engine...`);
    await runReminderEngine();
    await runTodoReminderEngine();
    console.log(` [${now.toISOString()}] Reminder engine completed.`);
  });

  console.log(" Cron job scheduled:", job ? "SUCCESS" : "FAILED");
}
