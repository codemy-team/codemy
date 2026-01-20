import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const getTokenFromHeader = (req) => {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
        return null;
    }
    return header.slice("Bearer ".length).trim();
};

export const authenticate = (req, res, next) => {
    const token = getTokenFromHeader(req);
    if (!token) {
        return res.status(401).json({ error: { message: "Unauthorized" } });
    }
    try {
        const payload = jwt.verify(token, env.jwtSecret);
        req.user = {
            userId: payload.sub,
            email: payload.email,
            role: payload.role
        };
        return next();
    } catch (error) {
        return res.status(401).json({ error: { message: "Invalid token" } });
    }
};

export const requireRole = (role) => (req, res, next) => {
    if (!req.user || req.user.role !== role) {
        return res.status(403).json({ error: { message: "Forbidden" } });
    }
    return next();
};
