import express from "express";
import { db } from "../db/index.js";
import { leads, deals, payments } from "../db/schema.js";
import { count, sum, sql } from "drizzle-orm";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", authenticate, async (req, res) => {
  try {
    const leadsCount = await db.select({ value: count() }).from(leads);
    const dealsCount = await db.select({ value: count() }).from(deals);
    const totalRevenue = await db.select({ value: sum(deals.totalPaid) }).from(deals);
    
    // Simple conversion rate: completed deals / total deals
    const completedDeals = await db.select({ value: count() }).from(deals).where(sql`status = 'completed'`);
    const conversionRate = dealsCount[0].value > 0 
      ? (completedDeals[0].value / dealsCount[0].value) * 100 
      : 0;

    res.json({
      leads: leadsCount[0].value,
      deals: dealsCount[0].value,
      revenue: totalRevenue[0].value || 0,
      conversionRate: conversionRate.toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
