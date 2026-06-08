// Drizzle schema for Logistiqs AI
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ---- Leads ----
export const leads = sqliteTable("leads", {
  id: text("id").primaryKey().$default(() => crypto.randomUUID().replace(/-/g, "")),
  companyName: text("company_name").notNull(),
  websiteUrl: text("website_url"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  province: text("province"),
  score: integer("score").default(0),
  source: text("source"),
  notes: text("notes"),
  status: text("status").default("new"),
  discoveredAt: text("discovered_at").default("datetime('now')"),
  updatedAt: text("updated_at").default("datetime('now')"),
});

// ---- Templates ----
export const templates = sqliteTable("templates", {
  id: text("id").primaryKey().$default(() => crypto.randomUUID().replace(/-/g, "")),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  description: text("description"),
  tier: text("tier").default("starter"),
  priceZar: real("price_zar").notNull(),
  depositZar: real("deposit_zar").notNull(),
  features: text("features"),
  previewUrl: text("preview_url"),
  thumbnailUrl: text("thumbnail_url"),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at").default("datetime('now')"),
  updatedAt: text("updated_at").default("datetime('now')"),
});

// ---- Deals ----
export const deals = sqliteTable("deals", {
  id: text("id").primaryKey().$default(() => crypto.randomUUID().replace(/-/g, "")),
  leadId: text("lead_id").notNull().references(() => leads.id),
  templateId: text("template_id").notNull().references(() => templates.id),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  status: text("status").default("matched"),
  previewToken: text("preview_token").unique(),
  previewUrl: text("preview_url"),
  previewSentAt: text("preview_sent_at"),
  previewOpenedAt: text("preview_opened_at"),
  priceZar: real("price_zar").notNull(),
  depositAmount: real("deposit_amount").notNull(),
  depositPaidAt: text("deposit_paid_at"),
  depositProof: text("deposit_proof"),
  balanceZar: real("balance_zar"),
  balancePaidAt: text("balance_paid_at"),
  totalPaid: real("total_paid").default(0),
  assignedTo: text("assigned_to"),
  notes: text("notes"),
  followUpAt: text("follow_up_at"),
  matchedAt: text("matched_at").default("datetime('now')"),
  updatedAt: text("updated_at").default("datetime('now')"),
  createdAt: text("created_at").default("datetime('now')"),
});

// ---- Preview Sessions ----
export const previewSessions = sqliteTable("preview_sessions", {
  id: text("id").primaryKey().$default(() => crypto.randomUUID().replace(/-/g, "")),
  dealId: text("deal_id").notNull().references(() => deals.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  viewedAt: text("viewed_at").default("datetime('now')"),
});

// ---- Payments ----
export const payments = sqliteTable("payments", {
  id: text("id").primaryKey().$default(() => crypto.randomUUID().replace(/-/g, "")),
  dealId: text("deal_id").notNull().references(() => deals.id),
  amountZar: real("amount_zar").notNull(),
  type: text("type").notNull(),
  method: text("method").default("eft"),
  proofFile: text("proof_file"),
  proofUploadedAt: text("proof_uploaded_at"),
  verified: integer("verified").default(0),
  verifiedBy: text("verified_by"),
  verifiedAt: text("verified_at"),
  notes: text("notes"),
  createdAt: text("created_at").default("datetime('now')"),
});

// ---- Sites ----
export const sites = sqliteTable("sites", {
  id: text("id").primaryKey().$default(() => crypto.randomUUID().replace(/-/g, "")),
  dealId: text("deal_id").notNull().references(() => deals.id),
  templateId: text("template_id").notNull().references(() => templates.id),
  companyName: text("company_name").notNull(),
  domainUrl: text("domain_url"),
  hostingStart: text("hosting_start"),
  hostingEnd: text("hosting_end"),
  status: text("status").default("building"),
  maintenancePlan: integer("maintenance_plan").default(0),
  lastBackupAt: text("last_backup_at"),
  createdAt: text("created_at").default("datetime('now')"),
  updatedAt: text("updated_at").default("datetime('now')"),
});

// ---- Admin Users ----
export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey().$default(() => crypto.randomUUID().replace(/-/g, "")),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("admin"),
  isActive: integer("is_active").default(1),
  lastLoginAt: text("last_login_at"),
  createdAt: text("created_at").default("datetime('now')"),
});

// ---- Activity Log ----
export const activityLog = sqliteTable("activity_log", {
  id: text("id").primaryKey().$default(() => crypto.randomUUID().replace(/-/g, "")),
  userId: text("user_id").references(() => adminUsers.id),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: text("created_at").default("datetime('now')"),
});

export const schema = {
  leads,
  templates,
  deals,
  previewSessions,
  payments,
  sites,
  adminUsers,
  activityLog,
};