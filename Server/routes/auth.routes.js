import express from "express";
import {
  register,
  login,
  verifyEmail,
  resetPassword,
  getMe,
  forgotPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

// Register a new user
authRouter.post("/register", register);

// Login a user
authRouter.post("/login", login);

// Verify email
authRouter.post("/verify-email", verifyEmail);

// Get user profile
authRouter.get("/me", protect, getMe);

// forgot password
authRouter.post("/forgot-password", forgotPassword);

// Reset password
authRouter.post("/reset-password/:token", resetPassword);

export default authRouter;
