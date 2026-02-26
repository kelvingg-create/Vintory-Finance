import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db } from "../lib/db.js";
import { transactions } from "../db/schema/transactions.js";

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
}

export interface CashFlowData {
  month: string;
  income: number;
  expense: number;
}

export class ReportsService {
  /**
   * Get summary statistics (KPIs) for a user
   */
  async getSummary(userId: string, dateRange: DateRange = {}): Promise<Summary> {
    const { startDate, endDate } = dateRange;

    const conditions = [eq(transactions.userId, userId)];

    if (startDate) {
      conditions.push(gte(transactions.transactionDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(transactions.transactionDate, endDate));
    }

    const whereClause = and(...conditions);

    const result = await db
      .select({
        totalIncome: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' AND ${transactions.status} = 'approved' THEN ${transactions.amount} ELSE 0 END), 0)`,
        totalExpense: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' AND ${transactions.status} = 'approved' THEN ${transactions.amount} ELSE 0 END), 0)`,
        transactionCount: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(whereClause);

    const { totalIncome, totalExpense, transactionCount } = result[0];

    const income = parseFloat(totalIncome) || 0;
    const expense = parseFloat(totalExpense) || 0;

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
      transactionCount,
    };
  }

  /**
   * Get cash flow data for charts (monthly breakdown)
   */
  async getCashFlow(userId: string, dateRange: DateRange = {}): Promise<CashFlowData[]> {
    const { startDate, endDate } = dateRange;

    const conditions = [
      eq(transactions.userId, userId),
      eq(transactions.status, "approved"),
    ];

    if (startDate) {
      conditions.push(gte(transactions.transactionDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(transactions.transactionDate, endDate));
    }

    const result = await db
      .select({
        month: sql<string>`TO_CHAR(${transactions.transactionDate}, 'YYYY-MM')`,
        income: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
        expense: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
      })
      .from(transactions)
      .where(and(...conditions))
      .groupBy(sql`TO_CHAR(${transactions.transactionDate}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${transactions.transactionDate}, 'YYYY-MM')`);

    return result.map((row) => ({
      month: row.month,
      income: parseFloat(row.income) || 0,
      expense: parseFloat(row.expense) || 0,
    }));
  }

  /**
   * Export transactions as CSV
   */
  async exportCsv(userId: string, dateRange: DateRange = {}): Promise<string> {
    const { startDate, endDate } = dateRange;

    const conditions = [eq(transactions.userId, userId)];

    if (startDate) {
      conditions.push(gte(transactions.transactionDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(transactions.transactionDate, endDate));
    }

    const data = await db.query.transactions.findMany({
      where: and(...conditions),
      with: {
        category: true,
      },
      orderBy: (transactions, { desc }) => [desc(transactions.transactionDate)],
    });

    // CSV header
    const headers = ["Date", "Type", "Category", "Description", "Amount", "Status"];
    const rows = data.map((tx) => [
      tx.transactionDate,
      tx.type,
      tx.category?.name || "",
      tx.description || "",
      tx.type === "income" ? `+${tx.amount}` : `-${tx.amount}`,
      tx.status,
    ]);

    // Build CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return csvContent;
  }

  /**
   * Get comparison with previous period
   */
  async getComparison(userId: string, currentStart: string, currentEnd: string) {
    const current = await this.getSummary(userId, {
      startDate: currentStart,
      endDate: currentEnd,
    });

    // Calculate previous period (same duration)
    const startDate = new Date(currentStart);
    const endDate = new Date(currentEnd);
    const duration = endDate.getTime() - startDate.getTime();

    const prevEnd = new Date(startDate.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duration);

    const previous = await this.getSummary(userId, {
      startDate: prevStart.toISOString().split("T")[0],
      endDate: prevEnd.toISOString().split("T")[0],
    });

    // Calculate percentage changes
    const calcChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    return {
      current,
      previous,
      changes: {
        incomeChange: calcChange(current.totalIncome, previous.totalIncome),
        expenseChange: calcChange(current.totalExpense, previous.totalExpense),
        balanceChange: calcChange(current.netBalance, previous.netBalance),
      },
    };
  }
}

export const reportsService = new ReportsService();
