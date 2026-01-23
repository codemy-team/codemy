import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

interface JWTPayload {
  sub: string;
  email: string;
  role: string;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

const getTokenFromHeader = (req: Request): string | null => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length).trim();
};

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = getTokenFromHeader(req);
  if (!token) {
    res.status(401).json({ error: { message: "Unauthorized" } });
    return;
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret) as JWTPayload;
    req.user = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: { message: "Invalid token" } });
  }
};

export const requireRole =
  (role: string) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ error: { message: "Forbidden" } });
      return;
    }
    next();
  };
