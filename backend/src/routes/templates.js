import { Router } from "express";
import { db } from "../db/index.js";
import { templates } from "../db/schema.js";
import { authenticate } from "../middleware/auth.js";
import { eq } from "drizzle-orm";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  try { const r = await db.select().from(templates).where(eq(templates.isActive, 1)); res.json(r); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const [tpl] = await db.select().from(templates).where(eq(templates.id, req.params.id)).limit(1);
    if (!tpl) return res.status(404).json({ error: "Template not found" });
    res.json(tpl);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;