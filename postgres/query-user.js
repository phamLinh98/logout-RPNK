import { pool } from "../config/connect-posgres.js";

export const getUser = async (req, res) => {
  try {
//     const cacheKey = "users";

//     const cached = await redisClient.get(cacheKey);
//     if (cached) {
//       return res.json({
//         source: "redis",
//         data: JSON.parse(cached),
//       });
//     }

    const result = await pool.query('SELECT * FROM "user"');

    //await redisClient.set(cacheKey, JSON.stringify(result.rows), { EX: 60 });

    res.json({
      source: "postgres",
      data: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
