import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
configDotenv();
export const isAuth = async (req, res, next) => {
  try {
    if (req.method === "OPTIONS") {
      return next();
    }
    const token = req.cookies?.accessToken;
    
    if (!token) {
      const error = new Error("No token Provided");
      error.statusCode = 401;
      return next(error);
    }
  
    const verify = await jwt.verify(token, process.env.ACCESS_SECRET);

    req.user = verify;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "token Expired" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
};
