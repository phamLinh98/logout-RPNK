import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "No token provided",
    });
  }

  jwt.verify(accessToken, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      console.log("Token verification error:", err.name);
      switch (err.name) {
        case "TokenExpiredError":
          return res.status(401).json({
            error: "Unauthorized",
            message: "Token expired",
            code: "TOKEN_EXPIRED",
          });
        case "JsonWebTokenError":
          return res.status(401).json({
            error: "Unauthorized",
            message: "Invalid token",
            code: "INVALID_TOKEN",
          });
        default:
          return res.status(401).json({
            error: "Unauthorized",
            message: "Token verification failed",
          });
      }
    }

    req.user = user;
    next();
  });
};
