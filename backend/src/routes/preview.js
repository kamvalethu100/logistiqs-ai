import express from "express";
import { db } from "../db/index.js";
import { deals, previewSessions } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.get("/:token", async (req, res) => {
  try {
    const deal = await db.query.deals.findFirst({
      where: eq(deals.previewToken, req.params.token),
    });

    if (!deal) return res.status(404).json({ error: "Preview not found" });

    // Track session
    await db.insert(previewSessions).values({
      id: uuidv4().replace(/-/g, ""),
      dealId: deal.id,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Update deal status if it's the first time
    if (deal.status === "preview_sent") {
      await db.update(deals)
        .set({ 
          status: "preview_opened",
          previewOpenedAt: new Date().toISOString()
        })
        .where(eq(deals.id, deal.id));
    }

    // In a real app, we'd render the template here.
    // For now, we'll return the deal info which the frontend will use to render.
    res.json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
