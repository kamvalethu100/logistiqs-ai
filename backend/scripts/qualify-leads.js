import { db, sqlite } from "../src/db/index.js";
import { leads, templates } from "../src/db/schema.js";
import { eq, like, or } from "drizzle-orm";

async function qualifyLeads() {
  console.log("Starting Lead Qualification & Pipeline Automation...");

  try {
    // Fetch templates to have IDs ready
    const allTemplates = await db.select().from(templates);
    const templateMap = {
      freight: allTemplates.find(t => t.category === "freight" && t.tier === "professional")?.id || allTemplates.find(t => t.category === "freight")?.id,
      courier: allTemplates.find(t => t.category === "courier" && t.tier === "starter")?.id || allTemplates.find(t => t.category === "courier")?.id,
      warehousing: allTemplates.find(t => t.category === "warehousing" && t.tier === "enterprise")?.id || allTemplates.find(t => t.category === "warehousing")?.id,
    };

    // 1. Pull all unqualified leads (status "new")
    const newLeads = await db.select().from(leads).where(eq(leads.status, "new"));
    console.log(`Found ${newLeads.length} new leads to process.`);

    for (const lead of newLeads) {
      console.log(`Processing: ${lead.companyName}`);

      // 2. Enrichment Simulation & Scoring logic
      let score = 20; // Base score
      let category = "courier"; // Default category

      const nameLower = lead.companyName.toLowerCase();
      const notesLower = (lead.notes || "").toLowerCase();

      // Keywords for scoring and matching
      if (nameLower.includes("freight") || nameLower.includes("cargo") || notesLower.includes("shipping")) {
        score += 30;
        category = "freight";
      } else if (nameLower.includes("express") || nameLower.includes("courier") || nameLower.includes("delivery")) {
        score += 20;
        category = "courier";
      } else if (nameLower.includes("warehouse") || nameLower.includes("storage") || nameLower.includes("distrib")) {
        score += 25;
        category = "warehousing";
      }

      if (lead.websiteUrl) {
        score += 10;
      } else {
        score += 40; // No website is a GREAT target
      }

      if (lead.phone || lead.email) {
        score += 20;
      }

      score = Math.min(score, 100);

      // 3. Status Transition
      let newStatus = "new";
      if (score >= 70) {
        newStatus = "qualified";
      } else if (score >= 40) {
        newStatus = "contacted";
      }

      const matchedTemplateId = templateMap[category];

      // 4. Update lead record
      await db.update(leads)
        .set({
          score,
          status: newStatus,
          notes: (lead.notes ? lead.notes + "\n" : "") + `[Auto-Enriched] Category: ${category}. Recommended Template ID: ${matchedTemplateId}. Score: ${score}.`,
          updatedAt: new Date().toISOString()
        })
        .where(eq(leads.id, lead.id));

      console.log(`  -> Score: ${score}, Status: ${newStatus}, Category: ${category}, Match: ${matchedTemplateId}`);
    }

    console.log("Lead qualification complete!");
  } catch (err) {
    console.error("Error during qualification:", err);
  } finally {
    sqlite.close();
  }
}

qualifyLeads();
