import jwt from "jsonwebtoken";

export const refeshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "No refresh token provided",
      });
    }

    jwt.verify(refreshToken, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        console.log("Refresh token verification error:", err.name);
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        switch (err.name) {
          case "TokenExpiredError":
            return res.status(401).json({
              error: "Unauthorized",
              message: "Refresh token expired",
              code: "REFRESH_TOKEN_EXPIRED",
            });
          case "JsonWebTokenError":
            return res.status(401).json({
              error: "Unauthorized",
              message: "Invalid refresh token",
              code: "INVALID_REFRESH_TOKEN",
            });
          default:
            return res.status(401).json({
              error: "Unauthorized",
              message: "Refresh token verification failed",
            });
        }
      }

      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.SECRET_KEY,
        { expiresIn: "15m" },
      );

      const newRefreshToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.SECRET_KEY,
        { expiresIn: "7d" },
      );

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000, // 15 phút
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });

      res.json({
        message: "Token refreshed successfully"
      });
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
