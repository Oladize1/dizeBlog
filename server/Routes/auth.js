import express from "express";
import { login, register, refresh, logout } from "../controllers/auth.js";

import { isAuth } from "../middleware/isAuth.js";
export const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/logout", logout);
authRouter.post("/refresh", refresh);
// authRouter.get('/:id', getUser)
