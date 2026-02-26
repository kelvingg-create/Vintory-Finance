import { eq, and, gte, lte, desc, sql, count } from "drizzle-orm";
import { db } from "../lib/db.js";
import {
  transactions,
  transactionTypeEnum,
  transactionStatusEnum,
} from "../db/schema/transactions.js";
import { attachments } from "../db/schema/attachments.js";

export type TransactionType = (typeof transactionTypeEnum.enumValues)[number];
export type TransactionStatus = (typeof transactionStatusEnum.enumValues)[number];

export interface CreateTransactionInput {
  categoryId?: string;
  type: TransactionType;
  amount: string;
  transactionDate: string;
  description?: string;
  status?: TransactionStatus;
}

export interface UpdateTransactionInput {
  categoryId?: string | null;
  type?: TransactionType;
  amount?: string;
  transactionDate?: string;
  description?: string;
  status?: TransactionStatus;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  page?: number;
  limit?: number;
}

export interface AddAttachmentInput {
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  fileSize?: number;
}

export class TransactionsService {
  /**
   * Get all transactions for a user with optional filtering and pagination
   */
  async getAll(userId: string, filters: TransactionFilters = {}) {
    const { page = 1, limit = 10, startDate, endDate, categoryId, type, status } = filters;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [eq(transactions.userId, userId)];

    if (startDate) {
      conditions.push(gte(transactions.transactionDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(transactions.transactionDate, endDate));
    }
    if (categoryId) {
      conditions.push(eq(transactions.categoryId, categoryId));
    }
    if (type) {
      conditions.push(eq(transactions.type, type));
    }
    if (status) {
      conditions.push(eq(transactions.status, status));
    }

    const whereClause = and(...conditions);

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(transactions)
      .where(whereClause);

    // Get paginated results with category relation
    const results = await db.query.transactions.findMany({
      where: whereClause,
      with: {
        category: true,
        attachments: true,
      },
      orderBy: [desc(transactions.transactionDate), desc(transactions.createdAt)],
      limit,
      offset,
    });

    return {
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get recent transactions for dashboard
   */
  async getRecent(userId: string, limit = 5) {
    return db.query.transactions.findMany({
      where: eq(transactions.userId, userId),
      with: {
        category: true,
      },
      orderBy: [desc(transactions.transactionDate), desc(transactions.createdAt)],
      limit,
    });
  }

  /**
   * Get a single transaction by ID
   */
  async getById(userId: string, transactionId: string) {
    return db.query.transactions.findFirst({
      where: and(eq(transactions.id, transactionId), eq(transactions.userId, userId)),
      with: {
        category: true,
        attachments: true,
      },
    });
  }

  /**
   * Create a new transaction
   */
  async create(userId: string, input: CreateTransactionInput) {
    const [transaction] = await db
      .insert(transactions)
      .values({
        userId,
        categoryId: input.categoryId,
        type: input.type,
        amount: input.amount,
        transactionDate: input.transactionDate,
        description: input.description,
        status: input.status || "approved",
      })
      .returning();

    return transaction;
  }

  /**
   * Update an existing transaction
   */
  async update(userId: string, transactionId: string, input: UpdateTransactionInput) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.transactionDate !== undefined) updateData.transactionDate = input.transactionDate;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.status !== undefined) updateData.status = input.status;

    const [transaction] = await db
      .update(transactions)
      .set(updateData)
      .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
      .returning();

    return transaction;
  }

  /**
   * Delete a transaction (FIXED: Handles attachments cleanup)
   */
  async delete(userId: string, transactionId: string) {
    console.log(`[Service] Menghapus Transaksi ID: ${transactionId}`);

    // 1. Hapus dulu Attachment yang nyangkut (agar tidak error Foreign Key)
    await db
      .delete(attachments)
      .where(eq(attachments.transactionId, transactionId));

    // 2. Baru hapus Transaksinya
    const [deleted] = await db
      .delete(transactions)
      .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
      .returning();

    return deleted;
  }
  
  // Fungsi cadangan jika Route memanggil dengan nama deleteTransaction
  async deleteTransaction(userId: string, transactionId: string) {
    return this.delete(userId, transactionId);
  }

  /**
   * Add an attachment to a transaction
   */
  async addAttachment(userId: string, transactionId: string, input: AddAttachmentInput) {
    // First verify the transaction belongs to the user
    const transaction = await this.getById(userId, transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    const [attachment] = await db
      .insert(attachments)
      .values({
        transactionId,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
      })
      .returning();

    return attachment;
  }

  /**
   * Delete an attachment
   */
  async deleteAttachment(userId: string, transactionId: string, attachmentId: string) {
    // First verify the transaction belongs to the user
    const transaction = await this.getById(userId, transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    const [deleted] = await db
      .delete(attachments)
      .where(and(eq(attachments.id, attachmentId), eq(attachments.transactionId, transactionId)))
      .returning();

    return deleted;
  }
}

export const transactionsService = new TransactionsService();