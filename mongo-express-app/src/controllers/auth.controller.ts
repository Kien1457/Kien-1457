import * as jwt from "jsonwebtoken";
import * as authService from "../services/auth.services";
import { Request, Response } from "express";
import { User } from "../models/User";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ user });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Email already exists!") {
        return res.status(409).json({ error: error.message });
      }
    }
    res.status(500).json({ error: "Internal server error" });
  }
};
export const login = async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken } = await authService.login(req.body);
    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Invalid Email." ||
        error.message === "Invalid Password."
      ) {
        return res.status(401).json({ error: error.message });
      }
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  const token = req.body.refreshToken;
  if (!token) return res.status(400).json({ message: "Missing refresh token" });
  const newAccessToken = await authService.refreshToken(token);
  res.json({ accessToken: newAccessToken });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.body.refreshToken;
  if (!token) return res.status(400).json({ message: "Missing refresh token" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
  const user = await User.findById(decoded.id);
  if (user) {
    user.refreshToken = "";
    await user.save();
  }
  res.json({ message: "Logged Out Success!" });
};
