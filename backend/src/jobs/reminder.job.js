import cron from "node-cron";
import { runReminderEngine } from "../services/reminder.service.js";

export function startReminderJob() {
  console.log("✅ Reminder Cron Job started (runs every minute)");

  cron.schedule("* * * * *", async () => {
    console.log("⏰ Running reminder engine...");
    await runReminderEngine();
  });
}
