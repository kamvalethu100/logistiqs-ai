import express from "express";
import { db } from "../db/index.js";
import { payments, deals } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { authenticate } from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "./uploads/payments/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.get("/", authenticate, async (req, res) => {
  try {
    const allPayments = await db.query.payments.findMany({
      orderBy: [desc(payments.createdAt)],
    });
    res.json(allPayments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/upload", upload.single("proof"), async (req, res) => {
  try {
    const { dealId, amountZar, type } = req.body;
    const id = uuidv4().replace(/-/g, "");

    await db.insert(payments).values({
      id,
      dealId,
      amountZar: parseFloat(amountZar),
      type,
      proofFile: req.file ? req.file.path : null,
      proofUploadedAt: new Date().toISOString(),
    });

    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/verify", authenticate, async (req, res) => {
  try {
    const payment = await db.query.payments.findFirst({
      where: eq(payments.id, req.params.id),
    });
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    await db.update(payments)
      .set({ 
        verified: 1, 
        verifiedAt: new Date().toISOString(),
        verifiedBy: req.user.id
      })
      .where(eq(payments.id, req.params.id));

    // If it's a deposit, update deal status
    if (payment.type === "deposit") {
      await db.update(deals)
        .set({ 
          status: "deposit_received",
          depositPaidAt: new Date().toISOString(),
          totalPaid: payment.amountZar
        })
        .where(eq(deals.id, payment.dealId));
    }

    res.json({ message: "Payment verified" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
