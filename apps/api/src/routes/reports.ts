import { Router, type Router as RouterType } from "express";
import { requireAuth } from "../middleware/auth.js";
import { reportsService } from "../services/reports.service.js";

const router: RouterType = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/reports/summary
 * Get KPI summary statistics (income, expense, balance)
 */
router.get("/summary", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const summary = await reportsService.getSummary(req.user!.id, {
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    });

    res.json({ data: summary });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

/**
 * GET /api/reports/cash-flow
 * Get cash flow data for charts (monthly income vs expense)
 */
router.get("/cash-flow", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const cashFlow = await reportsService.getCashFlow(req.user!.id, {
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    });

    res.json({ data: cashFlow });
  } catch (error) {
    console.error("Error fetching cash flow:", error);
    res.status(500).json({ error: "Failed to fetch cash flow data" });
  }
});

/**
 * GET /api/reports/comparison
 * Get comparison with previous period
 */
router.get("/comparison", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "startDate and endDate are required for comparison",
      });
    }

    const comparison = await reportsService.getComparison(
      req.user!.id,
      startDate as string,
      endDate as string
    );

    res.json({ data: comparison });
  } catch (error) {
    console.error("Error fetching comparison:", error);
    res.status(500).json({ error: "Failed to fetch comparison data" });
  }
});

/**
 * GET /api/reports/export
 * Export transactions as CSV file
 */
router.get("/export", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const csv = await reportsService.exportCsv(req.user!.id, {
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    });

    // Set headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="transactions_${new Date().toISOString().split("T")[0]}.csv"`
    );

    res.send(csv);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    res.status(500).json({ error: "Failed to export transactions" });
  }
});

export default router;
