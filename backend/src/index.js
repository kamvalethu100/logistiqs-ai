import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config/env.js";

import authRoutes from "./routes/auth.js";
import leadsRoutes from "./routes/leads.js";
import dealsRoutes from "./routes/deals.js";
import templatesRoutes from "./routes/templates.js";
import paymentsRoutes from "./routes/payments.js";
import sitesRoutes from "./routes/sites.js";
import previewRoutes from "./routes/preview.js";
import dashboardRoutes from "./routes/dashboard.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/leads", leadsRoutes);
app.use("/api/v1/deals", dealsRoutes);
app.use("/api/v1/templates", templatesRoutes);
app.use("/api/v1/payments", paymentsRoutes);
app.use("/api/v1/sites", sitesRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// Public Preview endpoint
app.use("/preview", previewRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Start
app.listen(config.port, "0.0.0.0", () => {
  console.log(`Logistiqs AI API running on http://0.0.0.0:${config.port}`);
});

export default app;