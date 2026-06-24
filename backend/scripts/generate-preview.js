import { db, sqlite } from "../src/db/index.js";
import { leads, templates, deals } from "../src/db/schema.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

async function generatePreview() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("Usage: node generate-preview.js <lead_id> <template_id>");
    process.exit(1);
  }

  const [leadId, templateId] = args;

  try {
    // 1. Verify lead and template exist
    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    if (!lead) {
      console.error(`Lead not found: ${leadId}`);
      process.exit(1);
    }

    const [template] = await db.select().from(templates).where(eq(templates.id, templateId)).limit(1);
    if (!template) {
      console.error(`Template not found: ${templateId}`);
      process.exit(1);
    }

    // 2. Generate token
    const token = crypto.randomBytes(16).toString("hex");
    const previewUrl = `http://localhost:3000/preview/${token}`; // Port 3000 is the public frontend

    // 3. Create or Update Deal
    const [existingDeal] = await db.select().from(deals)
      .where(eq(deals.leadId, leadId))
      .limit(1);

    if (existingDeal) {
      await db.update(deals)
        .set({
          templateId,
          previewToken: token,
          previewUrl,
          status: "preview_sent", // Assuming generating it means we are about to send it
          updatedAt: new Date().toISOString()
        })
        .where(eq(deals.id, existingDeal.id));
      console.log(`Updated existing deal: ${existingDeal.id}`);
    } else {
      await db.insert(deals).values({
        leadId,
        templateId,
        companyName: lead.companyName,
        contactEmail: lead.email,
        contactPhone: lead.phone,
        status: "preview_sent",
        previewToken: token,
        previewUrl,
        priceZar: template.priceZar,
        depositAmount: template.depositZar,
      });
      console.log(`Created new deal for ${lead.companyName}`);
    }

    console.log("\n--- Preview Link Generated ---");
    console.log(`Company: ${lead.companyName}`);
    console.log(`Template: ${template.name}`);
    console.log(`URL: ${previewUrl}`);
    console.log("------------------------------\n");

  } catch (err) {
    console.error("Error generating preview:", err);
  } finally {
    sqlite.close();
  }
}

generatePreview();
