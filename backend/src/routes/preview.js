import { Router } from "express";
import { db } from "../db/index.js";
import { deals, previewSessions } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/:token", async (req, res) => {
  try {
    const [deal] = await db.select().from(deals).where(eq(deals.previewToken, req.params.token)).limit(1);
    if (!deal) return res.status(404).json({ error: "Preview not found" });
    await db.insert(previewSessions).values({ dealId: deal.id, ipAddress: req.ip, userAgent: req.headers["user-agent"] || "" });
    if (!deal.previewOpenedAt) await db.update(deals).set({ previewOpenedAt: "datetime('now')", status: "preview_opened" }).where(eq(deals.id, deal.id));
    res.redirect(`${process.env.BASE_URL || "http://localhost:5173"}/preview/${req.params.token}`);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/:token/interest", async (req, res) => {
  try {
    const [deal] = await db.select().from(deals).where(eq(deals.previewToken, req.params.token)).limit(1);
    if (!deal) return res.status(404).json({ error: "Preview not found" });
    await db.update(deals).set({ notes: `Lead interested: ${JSON.stringify(req.body)}`, status: "deposit_pending" }).where(eq(deals.id, deal.id));
    res.json({ message: "Interest recorded" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;