import express from "express";
import { db } from "../db/index.js";
import { deals, leads, templates } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { authenticate } from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const allDeals = await db.query.deals.findMany({
      orderBy: [desc(deals.createdAt)],
    });
    res.json(allDeals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { leadId, templateId } = req.body;
    
    const lead = await db.query.leads.findFirst({ where: eq(leads.id, leadId) });
    const template = await db.query.templates.findFirst({ where: eq(templates.id, templateId) });
    
    if (!lead || !template) {
      return res.status(400).json({ error: "Invalid lead or template" });
    }

    const id = uuidv4().replace(/-/g, "");
    const previewToken = crypto.randomBytes(16).toString("hex");

    await db.insert(deals).values({
      id,
      leadId,
      templateId,
      companyName: lead.companyName,
      contactEmail: lead.email,
      contactPhone: lead.phone,
      priceZar: template.priceZar,
      depositAmount: template.depositZar,
      previewToken,
      status: "matched",
    });

    const newDeal = await db.query.deals.findFirst({
      where: eq(deals.id, id),
    });
    res.status(201).json(newDeal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const deal = await db.query.deals.findFirst({
      where: eq(deals.id, req.params.id),
    });
    if (!deal) return res.status(404).json({ error: "Deal not found" });
    res.json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", authenticate, async (req, res) => {
  try {
    await db.update(deals)
      .set({ ...req.body, updatedAt: new Date().toISOString() })
      .where(eq(deals.id, req.params.id));
    const updated = await db.query.deals.findFirst({
      where: eq(deals.id, req.params.id),
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
