import { db } from "../src/db/index.js";
import { 
  leads, 
  templates, 
  deals, 
  previewSessions, 
  payments, 
  sites, 
  adminUsers, 
  activityLog 
} from "../src/db/schema.js";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Initializing database...");
  
  // Drizzle doesn't have a built-in "create tables from schema" for SQLite in better-sqlite3 
  // without using drizzle-kit push or migrations. 
  // Since we are told to use better-sqlite3 + Drizzle, and it's a simple setup, 
  // I will use raw SQL to create tables based on the schema.
  
  const tables = [
    `CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      website_url TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      province TEXT,
      score INTEGER DEFAULT 0,
      source TEXT,
      notes TEXT,
      status TEXT DEFAULT 'new',
      discovered_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      description TEXT,
      tier TEXT DEFAULT 'starter',
      price_zar REAL NOT NULL,
      deposit_zar REAL NOT NULL,
      features TEXT,
      preview_url TEXT,
      thumbnail_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS deals (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL REFERENCES leads(id),
      template_id TEXT NOT NULL REFERENCES templates(id),
      company_name TEXT NOT NULL,
      contact_name TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      status TEXT DEFAULT 'matched',
      preview_token TEXT UNIQUE,
      preview_url TEXT,
      preview_sent_at TEXT,
      preview_opened_at TEXT,
      price_zar REAL NOT NULL,
      deposit_amount REAL NOT NULL,
      deposit_paid_at TEXT,
      deposit_proof TEXT,
      balance_zar REAL,
      balance_paid_at TEXT,
      total_paid REAL DEFAULT 0,
      assigned_to TEXT,
      notes TEXT,
      follow_up_at TEXT,
      matched_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS preview_sessions (
      id TEXT PRIMARY KEY,
      deal_id TEXT NOT NULL REFERENCES deals(id),
      ip_address TEXT,
      user_agent TEXT,
      viewed_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      deal_id TEXT NOT NULL REFERENCES deals(id),
      amount_zar REAL NOT NULL,
      type TEXT NOT NULL,
      method TEXT DEFAULT 'eft',
      proof_file TEXT,
      proof_uploaded_at TEXT,
      verified INTEGER DEFAULT 0,
      verified_by TEXT,
      verified_at TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      deal_id TEXT NOT NULL REFERENCES deals(id),
      template_id TEXT NOT NULL REFERENCES templates(id),
      company_name TEXT NOT NULL,
      domain_url TEXT,
      hosting_start TEXT,
      hosting_end TEXT,
      status TEXT DEFAULT 'building',
      maintenance_plan INTEGER DEFAULT 0,
      last_backup_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      is_active INTEGER DEFAULT 1,
      last_login_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES admin_users(id),
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`
  ];

  for (const table of tables) {
    db.run(sql.raw(table));
  }

  console.log("Database initialized successfully.");
}

main().catch(console.error);
