import { redisClient } from "../config/redis.js";

export const rateLimit = ({ keyPrefix, limit, windowSec, keyFn }) => {
  return async (req, res, next) => {
    try {
      const identifier = keyFn ? keyFn(req) : (req.ip || req.connection.remoteAddress || "unknown");
      const key = `${keyPrefix}:${identifier}`;

      const current = await redisClient.get(key);

      if (current && parseInt(current) >= limit) {
        return res.status(429).json({
          message: `Too many requests. Please try again after ${windowSec} seconds.`,
        });
      }

      if (!current) {
        await redisClient.set(key, 1, { EX: windowSec });
      } else {
        await redisClient.incr(key);
      }

      next();
    } catch (err) {
      console.error("Rate limiter error:", err);
      next();
    }
  };
};
