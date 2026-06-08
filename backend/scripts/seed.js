import { db } from "../src/db/index.js";
import { 
  adminUsers, 
  templates, 
  leads 
} from "../src/db/schema.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

async function main() {
  console.log("Seeding database...");

  // 1. Admin User
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await db.insert(adminUsers).values({
    id: uuidv4().replace(/-/g, ""),
    username: "admin",
    email: "admin@logistiqs.ai",
    passwordHash: hashedPassword,
    role: "superadmin",
  }).onConflictDoNothing();

  // 2. Templates
  const templateData = [
    // Freight
    { name: "Freight Starter", slug: "freight-starter", category: "freight", tier: "starter", priceZar: 4999, depositZar: 2499.5 },
    { name: "Freight Professional", slug: "freight-pro", category: "freight", tier: "professional", priceZar: 9999, depositZar: 4999.5 },
    { name: "Freight Enterprise", slug: "freight-enterprise", category: "freight", tier: "enterprise", priceZar: 24999, depositZar: 12499.5 },
    // Courier
    { name: "Courier Starter", slug: "courier-starter", category: "courier", tier: "starter", priceZar: 4999, depositZar: 2499.5 },
    { name: "Courier Professional", slug: "courier-pro", category: "courier", tier: "professional", priceZar: 9999, depositZar: 4999.5 },
    { name: "Courier Enterprise", slug: "courier-enterprise", category: "courier", tier: "enterprise", priceZar: 24999, depositZar: 12499.5 },
    // Warehousing
    { name: "Warehousing Starter", slug: "warehousing-starter", category: "warehousing", tier: "starter", priceZar: 4999, depositZar: 2499.5 },
    { name: "Warehousing Professional", slug: "warehousing-pro", category: "warehousing", tier: "professional", priceZar: 9999, depositZar: 4999.5 },
    { name: "Warehousing Enterprise", slug: "warehousing-enterprise", category: "warehousing", tier: "enterprise", priceZar: 24999, depositZar: 12499.5 },
  ];

  for (const t of templateData) {
    await db.insert(templates).values({
      id: uuidv4().replace(/-/g, ""),
      ...t,
      features: JSON.stringify(["Feature 1", "Feature 2", "Feature 3"]),
    }).onConflictDoNothing();
  }

  // 3. Sample Leads
  const leadData = [
    { companyName: "Johannesburg Freight Co", city: "Johannesburg", province: "Gauteng", source: "google_maps", score: 85 },
    { companyName: "Cape Town Couriers", city: "Cape Town", province: "Western Cape", source: "google_search", score: 70 },
    { companyName: "Durban Storage Solutions", city: "Durban", province: "KwaZulu-Natal", source: "referral", score: 90 },
    { companyName: "Pretoria Logistics", city: "Pretoria", province: "Gauteng", source: "manual", score: 60 },
    { companyName: "Port Elizabeth Transport", city: "Port Elizabeth", province: "Eastern Cape", source: "google_maps", score: 75 },
    { companyName: "Bloemfontein Warehousing", city: "Bloemfontein", province: "Free State", source: "google_search", score: 50 },
    { companyName: "Nelspruit Cargo", city: "Nelspruit", province: "Mpumalanga", source: "manual", score: 40 },
    { companyName: "Polokwane Delivery", city: "Polokwane", province: "Limpopo", source: "google_maps", score: 65 },
    { companyName: "Kimberley Freight", city: "Kimberley", province: "Northern Cape", source: "referral", score: 80 },
    { companyName: "Rustenburg Logistics", city: "Rustenburg", province: "North West", source: "google_search", score: 55 },
  ];

  for (const l of leadData) {
    await db.insert(leads).values({
      id: uuidv4().replace(/-/g, ""),
      ...l,
      status: "new",
    });
  }

  console.log("Database seeded successfully.");
}

main().catch(console.error);
