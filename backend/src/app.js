import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { rateLimit } from "./middlewares/rateLimiter.js";
import { pool } from "./config/db.js";
import { redisClient } from "./config/redis.js";

import userRoutes from "./modules/auth/routes/user.routes.js";
import oauthRoutes from "./modules/auth/routes/oauth.routes.js";
import adminRoutes from "./modules/auth/routes/admin.routes.js";
import followupRoutes from "./modules/followups/followup.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import templateRoutes from "./modules/templates/template.routes.js";
import eventRoutes from "./modules/events/event.routes.js";
import emailTemplateRoutes from "./modules/templates/email-template.routes.js";
import todoRoutes from "./modules/todos/todo.routes.js";
import jiraRoutes from "./modules/jira/jira.routes.js";

import swaggerUi from "swagger-ui-express";
import yamljs from "yamljs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = yamljs.load(path.join(__dirname, "../docs/openapi.yaml"));

const app = express();

// --- Security Middleware ---
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(compression());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());

// Global rate limiter — 200 requests per minute per IP for all routes
app.use(rateLimit({ keyPrefix: "global", limit: 200, windowSec: 60 }));

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/followups", followupRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/email-templates", emailTemplateRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/jira", jiraRoutes);

// Health check — verifies DB and Redis connectivity
app.get("/health", async (req, res) => {
  const checks = { server: true, database: false, redis: false };
  try {
    await pool.query("SELECT 1");
    checks.database = true;
  } catch (err) {
    checks.database = false;
  }
  try {
    if (redisClient.isOpen) {
      await redisClient.ping();
      checks.redis = true;
    }
  } catch (err) {
    checks.redis = false;
  }

  const allHealthy = checks.database && checks.redis;
  res.status(allHealthy ? 200 : 503).json({
    ok: allHealthy,
    message: allHealthy ? "FollowUpHub backend running" : "Some dependencies are unhealthy",
    checks,
  });
});

// 404 handler — must be after all routes
app.use(notFoundHandler);

// Global error handler — must be the LAST middleware
app.use(errorHandler);

export default app;
