import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectRedis } from "./config/redis.js";
import { startReminderJob } from "./jobs/reminder.job.js";

const PORT = process.env.PORT || 5000;

connectRedis()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
      startReminderJob();

    });
  })
  .catch((err) => {
    console.error("Redis connection failed:", err);
    process.exit(1);
  });
