import { Router } from "express";
import { db } from "../db/index.js";
import { sites } from "../db/schema.js";
import { authenticate } from "../middleware/auth.js";
import { eq, desc } from "drizzle-orm";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  try { const r = await db.select().from(sites).orderBy(desc(sites.createdAt)).limit(100); res.json(r); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch("/:id", async (req, res) => {
  try {
    const [site] = await db.update(sites).set({ ...req.body, updatedAt: "datetime('now')" }).where(eq(sites.id, req.params.id)).returning();
    res.json(site);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;