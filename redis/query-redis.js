import { redisClient } from "../config/connect-redis.js";

export const getDataFromRedus = async (req, res) => {
  try {
    const value = await redisClient.get("macbook");
    if (!value) {
      return res.status(404).json({
        message: "macbook not found",
      });
    }
    const ttl = await redisClient.ttl("macbook");
    res.json({
      source: "redis",
      macbook: {
        ...JSON.parse(value),
        TTL: ttl === -1 ? "never expire" : ttl,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Redis read failed" });
  }
};
