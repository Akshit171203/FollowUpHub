import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./modules/auth/routes/user.routes.js";
import oauthRoutes from "./modules/auth/routes/oauth.routes.js";
import adminRoutes from "./modules/auth/routes/admin.routes.js";
import followupRoutes from "./modules/followups/followup.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import templateRoutes from "./modules/templates/template.routes.js";
import eventRoutes from "./modules/events/event.routes.js";


const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/followups", followupRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/events", eventRoutes);

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "FollowUpHub backend running" });
});

export default app;
