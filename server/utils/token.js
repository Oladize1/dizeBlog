import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
configDotenv();
export const getTokenFrom = (req) => {
  const token = req.cookies;
  console.log("cookie", token);
  if (token) {
    return token.refreshToken;
  }
  return null;
};

export const generateAccessToken = (user) => {
  try {
    const accessToken = jwt.sign(
      { userId: user._id, userRole: user.role, userName: user.username },
      process.env.ACCESS_SECRET,
      { expiresIn: "15m" },
    );
    return accessToken;
  } catch (error) {
    throw new Error("failed to generate Access Token");
  }
};

export const generateRefreshToken = (user) => {
  try {
    const refreshToken = jwt.sign(
      { userId: user._id, userRole: user.role, userName: user.username },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" },
    );
    return refreshToken;
  } catch (error) {
    throw new Error("failed to generate Access Token");
  }
};
