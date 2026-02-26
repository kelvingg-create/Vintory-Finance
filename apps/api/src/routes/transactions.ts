import { Router, type Router as RouterType } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  transactionsService,
  TransactionType,
  TransactionStatus,
} from "../services/transactions.service.js";

const router: RouterType = Router();

// Wajib Login untuk semua route di bawah ini
router.use(requireAuth);

/**
 * GET /api/transactions
 * Ambil daftar transaksi
 */
router.get("/", async (req, res) => {
  try {
    const { page, limit, startDate, endDate, categoryId, type, status } = req.query;

    const result = await transactionsService.getAll(req.user!.id, {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      categoryId: categoryId as string | undefined,
      type: type as TransactionType | undefined,
      status: status as TransactionStatus | undefined,
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

/**
 * GET /api/transactions/recent
 */
router.get("/recent", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const transactions = await transactionsService.getRecent(req.user!.id, limit);
    res.json({ data: transactions });
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    res.status(500).json({ error: "Failed to fetch recent transactions" });
  }
});

/**
 * GET /api/transactions/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const transaction = await transactionsService.getById(req.user!.id, req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json({ data: transaction });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
});

/**
 * POST /api/transactions
 */
router.post("/", async (req, res) => {
  try {
    const { categoryId, type, amount, transactionDate, description, status } = req.body;

    if (!type || !amount || !transactionDate) {
      return res.status(400).json({ error: "Type, amount, and transactionDate are required" });
    }

    const transaction = await transactionsService.create(req.user!.id, {
      categoryId,
      type,
      amount,
      transactionDate,
      description,
      status,
    });

    res.status(201).json({ data: transaction });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

/**
 * PUT /api/transactions/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const { categoryId, type, amount, transactionDate, description, status } = req.body;

    const transaction = await transactionsService.update(req.user!.id, req.params.id, {
      categoryId,
      type,
      amount,
      transactionDate,
      description,
      status,
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ data: transaction });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

// ==========================================
// FIX: FITUR HAPUS YANG AMAN & BERSIH
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    // Kita gunakan fungsi delete bawaan service yang sudah ada
    // Jika nanti error, berarti kita harus memperbaiki file Service-nya, bukan di sini.
    const deleted = await transactionsService.delete(req.user!.id, req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Catatan tidak ditemukan atau sudah terhapus" });
    }

    res.json({ message: "Berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Gagal menghapus data" });
  }
});
// ==========================================

/**
 * POST /api/transactions/:id/attachment
 */
router.post("/:id/attachment", async (req, res) => {
  try {
    const { fileName, fileUrl, mimeType, fileSize } = req.body;
    const attachment = await transactionsService.addAttachment(
      req.user!.id,
      req.params.id,
      { fileName, fileUrl, mimeType, fileSize }
    );
    res.status(201).json({ data: attachment });
  } catch (error) {
    console.error("Error adding attachment:", error);
    res.status(500).json({ error: "Failed to add attachment" });
  }
});

/**
 * DELETE /api/transactions/:id/attachment/:attachmentId
 */
router.delete("/:id/attachment/:attachmentId", async (req, res) => {
  try {
    const deleted = await transactionsService.deleteAttachment(
      req.user!.id,
      req.params.id,
      req.params.attachmentId
    );
    if (!deleted) return res.status(404).json({ error: "Attachment not found" });
    res.json({ message: "Attachment deleted successfully" });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    res.status(500).json({ error: "Failed to delete attachment" });
  }
});

export default router;