import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.error("❌ Redis error", err));

(async () => {
  await redisClient.connect();
  await redisClient.set("macbook", JSON.stringify({ userid: "123" }));
  await redisClient.persist("macbook");
})();
