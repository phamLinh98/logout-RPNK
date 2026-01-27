import crypto from "crypto";
import { googleClient } from "./google.js";
import { redis } from "./redis.js";

app.post("/auth/google", async (req, res) => {
  try {
    const { idToken } = req.body;

    // 1️⃣ Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;

    // 2️⃣ Find or create user (Postgres)
    let user = await pool.query("SELECT * FROM account WHERE google_id = $1", [
      googleId,
    ]);

    if (user.rows.length === 0) {
      user = await pool.query(
        `INSERT INTO account (email, username, google_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [email, name, googleId],
      );
    }

    const userData = user.rows[0];

    // 3️⃣ Create session
    const sid = crypto.randomUUID();

    await redis.set(
      `session:${sid}`,
      JSON.stringify({
        userId: userData.id,
        email: userData.email,
        role: "user",
      }),
      "EX",
      24 * 60 * 60,
    );

    // 4️⃣ Set cookie
    res.cookie("sid", sid, {
      httpOnly: true,
      secure: true, // prod
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login Google thành công" });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Google login failed" });
  }
});
