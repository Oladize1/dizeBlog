import { User } from "../model/User.js";
import { RefreshToken } from "../model/RefreshToken.js";
export const userRepository = {
  findUser: async (username) => {
    return await User.findOne({ username });
  },
  refreshToken: async (token) => {
    return await RefreshToken.findOneAndDelete({ token });
  },
  createRefreshToken: async (
    token,
    userId,
    expiresAt,
    ip,
    lastUsedAt,
    userAgent,
  ) => {
    return await RefreshToken.create({
      token,
      user: userId,
      expiresAt,
      ip,
      lastUsedAt,
      userAgent,
    });
  },
  createUser: async (name, username, password, role) => {
    return await User.create({ name, username, password, role });
  },
  findUserById: async (userId) => {
    return await User.findById(userId);
  },
  removeAllToken: async (userId) => {
    return await RefreshToken.deleteMany({ user: userId });
  },
  replaceIp: async (id, ip) => {
    await RefreshToken.findByIdAndUpdate(id, { ip });
    return ip
  },
};
