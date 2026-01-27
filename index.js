import "dotenv/config";
import express from "express";
import { createClient } from "redis";
import { pool } from "./config/connect-posgres.js";
import { getUser } from "./postgres/query-user.js";
import { redisClient } from "./config/connect-redis.js";
import { getDataFromRedus } from "./redis/query-redis.js";
import jwt from "jsonwebtoken";
import { verifyToken } from "./middleware/verifyToken.js";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cookieParser());

app.get("/users", verifyToken, getUser);
app.get("/redis/macbook", getDataFromRedus);
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      "SELECT * FROM account WHERE email = $1 AND password = $2",
      [email, password],
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.SECRET_KEY,
        { expiresIn: "15m" },
      );
      const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.SECRET_KEY,
        { expiresIn: "7d" },
      );

      // save to cookies
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        message: "Đăng nhập thành công",
        user: user["username"],
      });
    } else {
      res.status(401).json({ error: "Tài khoản hoặc mật khẩu không đúng" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Tài khoản không tồn tại" });
  }
});
app.post("/logout", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
  });

  res.json({ message: "Đăng xuất thành công" });
});

app.listen(port, () => {
  console.log(`🚀 App listening on port ${port}`);
});
