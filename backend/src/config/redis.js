import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

export const pubClient = redisClient.duplicate();
export const subClient = redisClient.duplicate();

redisClient.on("error", (err) => console.error("Redis error:", err));
pubClient.on("error", (err) => console.error("PubClient error:", err));
subClient.on("error", (err) => console.error("SubClient error:", err));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    await pubClient.connect();
    await subClient.connect();
    console.log("Redis connected successfully (including Pub/Sub clients)");
  }
};
