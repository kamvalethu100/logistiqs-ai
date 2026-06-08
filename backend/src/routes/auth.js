import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { adminUsers } from "../db/schema.js";
import config from "../config/env.js";
import { eq } from "drizzle-orm";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
    await db.update(adminUsers).set({ lastLoginAt: "datetime('now')" }).where(eq(adminUsers.id, user.id));
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, req.user.id)).limit(1);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;