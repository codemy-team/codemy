import { Router, Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "../services/auth.service.js";

const router = Router();

router.post(
  "/auth/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return next({
          status: 400,
          message: "Email and password are required",
        });
      }
      const user = await registerUser({ email, password });
      return res.status(201).json({ user });
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/auth/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return next({
          status: 400,
          message: "Email and password are required",
        });
      }
      const result = await loginUser({ email, password });
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  },
);

export default router;
