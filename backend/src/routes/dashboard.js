import { Router } from "express";
import { db } from "../db/index.js";
import { deals, leads, payments } from "../db/schema.js";
import { authenticate } from "../middleware/auth.js";
import { eq, sql, count } from "drizzle-orm";

const router = Router();
router.use(authenticate);

router.get("/stats", async (req, res) => {
  try {
    const [lc] = await db.select({ count: count() }).from(leads);
    const [ac] = await db.select({ count: count() }).from(deals).where(sql`status NOT IN ('completed','declined','cancelled')`);
    const [cc] = await db.select({ count: count() }).from(deals).where(eq(deals.status, "completed"));
    const [tp] = await db.select({ total: sql`COALESCE(SUM(total_paid),0)` }).from(deals).where(eq(deals.status, "completed"));
    res.json({ leadsThisWeek: lc.count, activeDeals: ac.count, completedDeals: cc.count, conversionRate: lc.count > 0 ? Math.round((cc.count/lc.count)*100) : 0, revenueMTD: tp.total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;