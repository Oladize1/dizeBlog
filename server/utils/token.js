import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
configDotenv();
export const getTokenFromCookies = (req) => {
  const token = req.cookies?.refreshToken;
  if (!token) return {message: "No refresh token provided", status: 401}
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_SECRET)
  } catch (error) {
    return { message: "Invalid or Expired Token", status: 403 };
  }
  return {message: "token refreshed", status: 200, decoded, token}
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
