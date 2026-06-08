import { Router } from "express";
import { db } from "../db/index.js";
import { leads } from "../db/schema.js";
import { authenticate } from "../middleware/auth.js";
import { eq, desc } from "drizzle-orm";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  try { const r = await db.select().from(leads).orderBy(desc(leads.discoveredAt)).limit(100); res.json(r); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const [lead] = await db.select().from(leads).where(eq(leads.id, req.params.id)).limit(1);
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { companyName, websiteUrl, phone, email, city, province, source } = req.body;
    const [lead] = await db.insert(leads).values({ companyName, websiteUrl, phone, email, city, province, source }).returning();
    res.status(201).json(lead);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch("/:id", async (req, res) => {
  try {
    const [lead] = await db.update(leads).set({ ...req.body, updatedAt: "datetime('now')" }).where(eq(leads.id, req.params.id)).returning();
    res.json(lead);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;