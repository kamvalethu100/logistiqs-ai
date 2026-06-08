import express from "express";
import { db } from "../db/index.js";
import { sites } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const allSites = await db.query.sites.findMany();
    res.json(allSites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const site = await db.query.sites.findFirst({
      where: eq(sites.id, req.params.id),
    });
    if (!site) return res.status(404).json({ error: "Site not found" });
    res.json(site);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
