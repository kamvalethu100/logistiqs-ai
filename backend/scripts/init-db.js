import { db, sqlite } from "../src/db/index.js";

// Create all tables using raw SQL (SQLite dialect)
const createTables = `
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
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
  status TEXT DEFAULT 'new' CHECK(status IN ('new','contacted','qualified','disqualified','converted')),
  discovered_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK(category IN ('freight','courier','warehousing')),
  description TEXT,
  tier TEXT DEFAULT 'starter' CHECK(tier IN ('starter','professional','enterprise')),
  price_zar REAL NOT NULL,
  deposit_zar REAL NOT NULL,
  features TEXT,
  preview_url TEXT,
  thumbnail_url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  lead_id TEXT NOT NULL REFERENCES leads(id),
  template_id TEXT NOT NULL REFERENCES templates(id),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'matched' CHECK(status IN ('matched','preview_sent','preview_opened','deposit_pending','deposit_received','in_progress','completed','declined','cancelled')),
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
);

CREATE TABLE IF NOT EXISTS preview_sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  deal_id TEXT NOT NULL REFERENCES deals(id),
  ip_address TEXT,
  user_agent TEXT,
  viewed_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  deal_id TEXT NOT NULL REFERENCES deals(id),
  amount_zar REAL NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('deposit','balance','maintenance')),
  method TEXT DEFAULT 'eft' CHECK(method IN ('eft','cash','card')),
  proof_file TEXT,
  proof_uploaded_at TEXT,
  verified INTEGER DEFAULT 0,
  verified_by TEXT,
  verified_at TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  deal_id TEXT NOT NULL REFERENCES deals(id),
  template_id TEXT NOT NULL REFERENCES templates(id),
  company_name TEXT NOT NULL,
  domain_url TEXT,
  hosting_start TEXT,
  hosting_end TEXT,
  status TEXT DEFAULT 'building' CHECK(status IN ('building','staging','live','suspended','cancelled')),
  maintenance_plan INTEGER DEFAULT 0,
  last_backup_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK(role IN ('admin','superadmin')),
  is_active INTEGER DEFAULT 1,
  last_login_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES admin_users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`;

try {
  console.log("Initializing database schema...");
  sqlite.exec(createTables);
  console.log("All tables created successfully!");
} catch (err) {
  console.error("Error creating tables:", err);
} finally {
  sqlite.close();
}