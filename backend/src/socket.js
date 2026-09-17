import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

let io;

/**
 * Initialize Socket.IO with Redis Adapter
 * @param {import("http").Server} httpServer
 */
export async function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  // Setup Redis Adapter
  try {
    const pubClient = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));
    console.log("Socket.IO Redis Adapter connected");
  } catch (err) {
    console.warn("Redis Adapter failed to connect (Sockets will be local only):", err.message);
  }

  // Auth Middleware — token is passed via the socket.io-client `auth` option, not a cookie
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication error: No token"));
      }

      const decoded = jwt.verify(token, process.env.LOGIN_SECRET_KEY);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Connection Handler
  io.on("connection", (socket) => {
    // console.log(`User connected: ${socket.userId} (${socket.id})`);
    
    // Join room named by userId for easy targeting
    socket.join(socket.userId);

    socket.on("disconnect", () => {
      // console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO not initialized!");
  }
  return io;
}
