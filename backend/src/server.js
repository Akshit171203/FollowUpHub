import dotenv from "dotenv";
dotenv.config();

import dns from "dns";
// Force Node to prefer IPv4 over IPv6 to fix SMTP connection issues on Render
dns.setDefaultResultOrder("ipv4first");

import app from "./app.js";
import { createServer } from "http";
import { connectRedis, redisClient } from "./config/redis.js";
import { pool } from "./config/db.js";
import { startReminderJob } from "./jobs/reminder.job.js";
import { startJiraSyncJob } from "./jobs/jira-sync.job.js";
import { initSocket } from "./socket.js";

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// Track cron jobs for cleanup
let reminderJob = null;
let jiraSyncJob = null;

connectRedis()
  .then(async () => {
    // Initialize Socket.IO
    await initSocket(httpServer);
    
    httpServer.listen(PORT, () => {
      console.log(`Server running on ${PORT} [${process.env.NODE_ENV || "development"}]`);
      reminderJob = startReminderJob();
      jiraSyncJob = startJiraSyncJob();
    });
  })
  .catch((err) => {
    console.error("Redis connection failed:", err);
    process.exit(1);
  });

// ===========================================================================
// GRACEFUL SHUTDOWN
// ===========================================================================

let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n[Shutdown] Received ${signal}. Starting graceful shutdown...`);

  // 1. Stop accepting new connections
  httpServer.close(() => {
    console.log("[Shutdown] HTTP server closed — no new connections");
  });

  // Give in-flight requests up to 10 seconds to complete
  const forceExitTimeout = setTimeout(() => {
    console.error("[Shutdown] Timed out waiting for cleanup. Forcing exit.");
    process.exit(1);
  }, 10000);

  try {
    // 2. Stop cron jobs
    if (reminderJob && typeof reminderJob.stop === "function") {
      reminderJob.stop();
      console.log("[Shutdown] Reminder cron stopped");
    }
    if (jiraSyncJob && typeof jiraSyncJob.stop === "function") {
      jiraSyncJob.stop();
      console.log("[Shutdown] Jira sync cron stopped");
    }

    // 3. Close Redis
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      console.log("[Shutdown] Redis disconnected");
    }

    // 4. Close database pool
    await pool.end();
    console.log("[Shutdown] Database pool closed");

    clearTimeout(forceExitTimeout);
    console.log("[Shutdown] Cleanup complete. Exiting.");
    process.exit(0);
  } catch (err) {
    console.error("[Shutdown] Error during cleanup:", err);
    clearTimeout(forceExitTimeout);
    process.exit(1);
  }
}

// Listen for termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Catch uncaught exceptions and unhandled rejections in production
process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught Exception:", err);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] Unhandled Rejection:", reason);
  gracefulShutdown("unhandledRejection");
});
