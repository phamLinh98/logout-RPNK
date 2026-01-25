import "dotenv/config";
import express from "express";
import { createClient } from "redis";
import { pool } from "./config/connect-posgres.js";
import { getUser } from "./postgres/query-user.js";
import { redisClient } from "./config/connect-redis.js";
import { getDataFromRedus } from "./redis/query-redis.js";

const app = express();
const port = process.env.PORT || 3000;

app.get("/users", getUser);
app.get("/redis/macbook", getDataFromRedus);

app.listen(port, () => {
  console.log(`🚀 App listening on port ${port}`);
});
