export default {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "logistiqs-dev-secret-change-in-production",
  jwtExpiresIn: "24h",
  dbPath: process.env.DATABASE_URL || "./data/logistiqs.db",
  baseUrl: process.env.BASE_URL || "http://localhost:3001",
  uploadDir: process.env.UPLOAD_DIR || "./uploads",
  sitesDir: process.env.SITES_DIR || "./sites",
  smtp: { host: process.env.SMTP_HOST || "", port: parseInt(process.env.SMTP_PORT || "587", 10), user: process.env.SMTP_USER || "", pass: process.env.SMTP_PASS || "", from: process.env.FROM_EMAIL || "noreply@logistiqs.ai" },
  admin: { username: process.env.ADMIN_USERNAME || "admin", email: process.env.ADMIN_EMAIL || "admin@logistiqs.ai", password: process.env.ADMIN_PASSWORD || "admin123" },
};