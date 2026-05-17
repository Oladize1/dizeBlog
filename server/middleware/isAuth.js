import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
configDotenv();
export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    console.log(token)
    if (!token) {
      const error = new Error("No token Provided");
      error.statusCode = 401;
      return next(error);
    }
  
    const verify = await jwt.verify(token, process.env.ACCESS_SECRET);

    if (!verify) {
      const error = new Error("UnAutorized User");
      error.statusCode = 403;
      return next(error);
    }

    req.user = verify;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
