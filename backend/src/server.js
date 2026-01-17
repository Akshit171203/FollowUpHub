import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { createServer } from "http";
import { connectRedis } from "./config/redis.js";
import { startReminderJob } from "./jobs/reminder.job.js";
import { initSocket } from "./socket.js";

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

connectRedis()
  .then(async () => {
    // Initialize Socket.IO
    await initSocket(httpServer);
    
    httpServer.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
      startReminderJob();
    });
  })
  .catch((err) => {
    console.error("Redis connection failed:", err);
    process.exit(1);
  });
