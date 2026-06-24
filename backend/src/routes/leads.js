import { Router } from "express";
import { db } from "../db/index.js";
import { leads } from "../db/schema.js";
import { authenticate } from "../middleware/auth.js";
import { eq, desc, gte, lt, and, or, like } from "drizzle-orm";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const { score_min, score_max, status } = req.query;
    let query = db.select().from(leads);
    const conditions = [];

    if (score_min) conditions.push(gte(leads.score, parseInt(score_min)));
    if (score_max) conditions.push(lt(leads.score, parseInt(score_max)));
    if (status) conditions.push(eq(leads.status, status));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const r = await query.orderBy(desc(leads.discoveredAt)).limit(100);
    res.json(r);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [lead] = await db.select().from(leads).where(eq(leads.id, req.params.id)).limit(1);
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { companyName, websiteUrl, phone, email, city, province, source, score, notes, status } = req.body;
    const [lead] = await db.insert(leads).values({
      companyName,
      websiteUrl,
      phone,
      email,
      city,
      province,
      source,
      score: score || 0,
      notes,
      status: status || "new"
    }).returning();
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["new", "contacted", "qualified", "converted", "lost"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status transition" });
    }

    const [lead] = await db.update(leads)
      .set({ ...req.body, updatedAt: new Date().toISOString() })
      .where(eq(leads.id, req.params.id))
      .returning();
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk Import API
router.post("/import", async (req, res) => {
  try {
    const leadsData = Array.isArray(req.body) ? req.body : [req.body];
    const results = { imported: 0, skipped: 0, errors: [] };

    for (const lead of leadsData) {
      if (!lead.companyName) {
        results.errors.push({ lead, error: "Missing companyName" });
        continue;
      }

      // Simple deduplication based on company name
      const [existing] = await db.select().from(leads).where(eq(leads.companyName, lead.companyName)).limit(1);
      if (existing) {
        results.skipped++;
        continue;
      }

      await db.insert(leads).values({
        companyName: lead.companyName,
        websiteUrl: lead.websiteUrl,
        phone: lead.phone,
        email: lead.email,
        city: lead.city,
        province: lead.province,
        source: lead.source || "import",
        score: lead.score || 0,
        notes: lead.notes,
        status: lead.status || "new"
      });
      results.imported++;
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
