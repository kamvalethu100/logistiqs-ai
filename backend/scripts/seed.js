import bcrypt from "bcrypt";
import { db, sqlite } from "../src/db/index.js";
import { leads, templates, deals, payments, sites, adminUsers, activityLog, previewSessions } from "../src/db/schema.js";
import config from "../src/config/env.js";

async function seed() {
  console.log("Seeding database...");

  // 1. Admin user
  const hash = await bcrypt.hash(config.admin.password, 10);
  await db.insert(adminUsers).values({
    username: config.admin.username,
    email: config.admin.email,
    passwordHash: hash,
    role: "superadmin",
  }).onConflictDoNothing();
  console.log(`Admin user created: ${config.admin.username}`);

  // 2. Templates
  const templateData = [
    { name: "Freight Forwarder", slug: "freight", category: "freight", tier: "professional", priceZar: 9999, depositZar: 4999.50, description: "Modern freight forwarding website with tracking, quote forms, and route maps" },
    { name: "Courier Express", slug: "courier", category: "courier", tier: "starter", priceZar: 4999, depositZar: 2499.50, description: "Clean courier service site with delivery tracking and instant quoting" },
    { name: "Warehouse & Logistics", slug: "warehousing", category: "warehousing", tier: "enterprise", priceZar: 24999, depositZar: 12499.50, description: "Full-featured warehousing platform with inventory management integration" },
  ];

  for (const tpl of templateData) {
    await db.insert(templates).values(tpl).onConflictDoNothing();
  }
  console.log(`Templates seeded: ${templateData.length}`);

  console.log("Seed complete!");
}

seed().catch(console.error).finally(() => sqlite.close());