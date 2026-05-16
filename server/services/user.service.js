import { userRepository } from "../repositories/user.repository.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

export const userService = {
  login: async (username, password, userIp, userAgent) => {
    const userExist = await userRepository.findUser(username);
    if (!userExist) {
      const error = new Error("User does not exist");
      error.statusCode = 400;
      throw error;
    }
    const validPassword = await bcrypt.compare(password, userExist.password);
    if (!validPassword) {
      const error = new Error("Invalid Credentials");
      error.statusCode = 400;
      throw error;
    }
    const accessToken = generateAccessToken(userExist);
    const refreshToken = generateRefreshToken(userExist);
    const token = await userRepository.createRefreshToken(
      refreshToken,
      userExist._id,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userIp,
      Date.now(),
      userAgent,
    );
    return { accessToken, refreshToken, userExist };
  },
  register: async (name, username, password, role = "user", next) => {
    const existingUser = await userRepository.findUser(username);
    if (existingUser) {
      const error = new Error("username taken");
      error.statusCode = 400;
      return next(error);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.createUser(
      name,
      username,
      hashedPassword,
      role,
    );
    if (!user) {
      const error = new Error("Failed to register");
      error.statusCode = 400;
      return next(error);
    }
    return user;
  },

  refresh: async (userId, token, ip, userAgent, next) => {
    const storedToken = await userRepository.refreshToken(token);
    if (!storedToken) {
      const error = new Error("Token reuse detected");
      error.statusCode = 403;
      return next(error);
    }

    if (storedToken.userAgent !== userAgent) {
      await userRepository.removeAllToken(userId);
      const error = new Error("Security violation: Device mismatch");
      error.statusCode = 403;
      return next(error);
    }

    let newIp;

    if (storedToken.ip !== ip) {
      newIp = await userRepository.replaceIp(storedToken._id, ip);
    }
    const user = await userRepository.findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newRefreshToken = generateRefreshToken(user);

    const refreshToken = userRepository.createRefreshToken(
      newRefreshToken,
      userId,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      newIp ? newIp : storedToken.ip,
      Date.now(),
      userAgent,
    );
    const accessToken = generateAccessToken(user);
    return { accessToken, refreshToken };
  },
};
