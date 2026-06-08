import jwt from "jsonwebtoken";
import config from "../config/env.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "No token provided" });
  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch { return res.status(401).json({ error: "Invalid or expired token" }); }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: "Insufficient permissions" });
    next();
  };
}