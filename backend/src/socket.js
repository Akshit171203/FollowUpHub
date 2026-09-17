import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

let io;

/**
 * Initialize Socket.IO.
 *
 * Runs as a single instance (no load balancer / multiple processes), so
 * Socket.io's default in-memory adapter already handles io.to().emit()
 * correctly. A Redis adapter is only needed once there's more than one
 * process — add @socket.io/redis-adapter back then, not preemptively.
 *
 * @param {import("http").Server} httpServer
 */
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

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
