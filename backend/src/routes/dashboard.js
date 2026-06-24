import { Router } from "express";
import { db } from "../db/index.js";
import { deals, leads, payments } from "../db/schema.js";
import { authenticate } from "../middleware/auth.js";
import { eq, sql, count, sum, and, gte } from "drizzle-orm";

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

router.get("/daily-report", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const startOfToday = `${today}T00:00:00.000Z`;

    // Today's metrics
    const [leadsToday] = await db.select({ value: count() }).from(leads)
      .where(gte(leads.discoveredAt, startOfToday));
    
    const [qualifiedToday] = await db.select({ value: count() }).from(leads)
      .where(and(eq(leads.status, "qualified"), gte(leads.updatedAt, startOfToday)));

    const [previewsSentToday] = await db.select({ value: count() }).from(deals)
      .where(and(eq(deals.status, "preview_sent"), gte(deals.updatedAt, startOfToday)));

    const [depositsReceivedToday] = await db.select({ value: count() }).from(payments)
      .where(and(eq(payments.type, "deposit"), eq(payments.verified, 1), gte(payments.verifiedAt, startOfToday)));

    const [dealsClosedToday] = await db.select({ value: count() }).from(deals)
      .where(and(eq(deals.status, "completed"), gte(deals.updatedAt, startOfToday)));

    // Pipeline
    const pipelineStages = await db.select({ status: deals.status, count: count() })
      .from(deals)
      .groupBy(deals.status);

    const activePipeline = pipelineStages.reduce((acc, curr) => {
      acc[curr.status] = curr.count;
      return acc;
    }, {});

    // Revenue
    const [projectedRevenue] = await db.select({ value: sum(deals.priceZar) })
      .from(deals)
      .where(sql`status NOT IN ('completed', 'declined', 'cancelled')`);

    // Conversion Rate (preview_sent -> deposit_received)
    const [sentCount] = await db.select({ value: count() }).from(deals).where(sql`status IN ('preview_sent', 'preview_opened', 'deposit_pending', 'deposit_received', 'in_progress', 'completed')`);
    const [receivedCount] = await db.select({ value: count() }).from(deals).where(sql`status IN ('deposit_received', 'in_progress', 'completed')`);
    
    const conversionRate = sentCount.value > 0 
      ? ((receivedCount.value / sentCount.value) * 100).toFixed(2)
      : 0;

    res.json({
      today: {
        leads: leadsToday.value,
        qualified: qualifiedToday.value,
        previews_sent: previewsSentToday.value,
        deposits_received: depositsReceivedToday.value,
        deals_closed: dealsClosedToday.value
      },
      active_pipeline: activePipeline,
      projected_revenue: projectedRevenue.value || 0,
      conversion_rate: conversionRate
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
