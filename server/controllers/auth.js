import { User } from "../model/User.js";
import { RefreshToken } from "../model/RefreshToken.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getTokenFromCookies,
} from "../utils/token.js";
import bcrypt from "bcryptjs";
import { userService } from "../services/user.service.js";
import { userRepository } from "../repositories/user.repository.js";

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const userIp = req.ip || req.headers["x-forwarded-for"];
    const userAgent = req.headers["user-agent"];
    if (!username || !password) {
      return res.status(400).json({ message: "All input is required" });
    }
    const loginService = await userService.login(
      username,
      password,
      userIp,
      userAgent,
    );
    if (!loginService) {
      const error = new Error("Failed to login");
      error.statusCode = 400;
      return next(error);
    }
    res.cookie("accessToken", loginService.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", loginService.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      username: loginService.userExist.username,
      role: loginService.userExist.role,
      name: loginService.userExist.name,
      id: loginService.userExist._id,
      bookmarks: loginService.userExist.bookmarks,
    });
  } catch (error) {
    return next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    let { name, username, password, role } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ message: "All input is required" });
    }
    if (username.length < 3 || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Username must be at least 6 characters" });
    }
    const user = await userService.register(name, username, password, role);
    if (!user) {
      const error = new Error("Failed to register");
      error.statusCode = 400;
      return next(error);
    }
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const tokenFromCookie = getTokenFromCookies(req);
    if (!tokenFromCookie || tokenFromCookie.status !== 200) {
      const error = new Error(
        tokenFromCookie?.message || "No refresh token provided",
      );
      error.statusCode = tokenFromCookie?.status || 401;
      return next(error);
    }
    const targetUserId =
      tokenFromCookie.decoded?.userId || tokenFromCookie.decoded?.id;

    if (!targetUserId) {
      const error = new Error("Invalid token payload structure");
      error.statusCode = 400;
      return next(error);
    }
    const currentIP = req.ip || req.headers["x-forwarded-for"];
    const currentUserAgent = req.headers["user-agent"];
    
    const user = await userService.refresh(
      targetUserId,
      tokenFromCookie.token,
      currentIP,
      currentUserAgent,
    );

    res.cookie("accessToken", loginService.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", loginService.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ message: "Token rotated" });
  } catch (error) {
    error.statusCode = 403;
    error.message = "Invalid or expired refresh token";
    return next(error);
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken && typeof refreshToken === "string") {
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Logout failed" });
  }
};

// export const getUser = async (req, res) => {
//     try {
//         const { id } =  req.params
//         console.log(id);

//         const fetchUser = await User.findById(id)
//         if(!fetchUser){
//             return res.status(404).json({message: 'user not found'})
//         }
//         console.log(fetchUser)
//         res.status(200).json({username: fetchUser.username})
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({error})
//     }
// }
