import cron from "node-cron";
import { runAiDigestJob } from "../services/ai-digest.service.js";

export function startAiDigestJob() {
  console.log("[Cron] AI Digest Job started (daily at 8am) at", new Date().toISOString());

  const job = cron.schedule("0 8 * * *", async () => {
    const now = new Date();
    console.log(`[Cron] [${now.toISOString()}] Running AI digest job...`);
    try {
      await runAiDigestJob();
    } catch (err) {
      console.error(`[Cron] [${now.toISOString()}] AI digest job error:`, err);
    }
    console.log(`[Cron] [${now.toISOString()}] AI digest job completed.`);
  });

  console.log("[Cron] AI Digest job scheduled:", job ? "SUCCESS" : "FAILED");
  return job;
}
