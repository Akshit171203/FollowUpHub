import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const url = rawUrl.replace(/\/api\/?$/, "");
  
    socket = io(url, {
      withCredentials: true,
      autoConnect: false, 
      transports: ["websocket"], // Force WS to avoid polling noise and CORS complexities
    });

    socket.on("connect", () => {
      console.log("✅ [Socket] Connected! ID:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ [Socket] Connection Error:", err.message);
    });
    
    socket.on("disconnect", (reason) => {
        console.log("⚠️ [Socket] Disconnected:", reason);
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null; // Reset singleton to ensure fresh connection on re-login
  }
};
