import { api } from '../lib/api';
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
  Attachment,
  AddAttachmentInput,
  ApiResponse,
  PaginatedResponse,
  MessageResponse,
} from '../types/api.types';

export const transactionsService = {
  /**
   * Get all transactions with optional filtering and pagination
   */
  async getAll(filters: TransactionFilters = {}): Promise<PaginatedResponse<Transaction>> {
    const params: Record<string, string | number | undefined> = {};
    
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.type) params.type = filters.type;
    if (filters.status) params.status = filters.status;

    return api.get<PaginatedResponse<Transaction>>('/api/transactions', params);
  },

  /**
   * Get recent transactions for dashboard
   */
  async getRecent(limit: number = 5): Promise<ApiResponse<Transaction[]>> {
    return api.get<ApiResponse<Transaction[]>>('/api/transactions/recent', { limit });
  },

  /**
   * Get a single transaction by ID
   */
  async getById(id: string): Promise<ApiResponse<Transaction>> {
    return api.get<ApiResponse<Transaction>>(`/api/transactions/${id}`);
  },

  /**
   * Create a new transaction
   */
  async create(input: CreateTransactionInput): Promise<ApiResponse<Transaction>> {
    return api.post<ApiResponse<Transaction>>('/api/transactions', input);
  },

  /**
   * Update an existing transaction
   */
  async update(id: string, input: UpdateTransactionInput): Promise<ApiResponse<Transaction>> {
    return api.put<ApiResponse<Transaction>>(`/api/transactions/${id}`, input);
  },

  /**
   * Delete a transaction
   */
  async delete(id: string): Promise<MessageResponse> {
    return api.delete<MessageResponse>(`/api/transactions/${id}`);
  },

  /**
   * Add an attachment to a transaction
   */
  async addAttachment(transactionId: string, input: AddAttachmentInput): Promise<ApiResponse<Attachment>> {
    return api.post<ApiResponse<Attachment>>(`/api/transactions/${transactionId}/attachment`, input);
  },

  /**
   * Delete an attachment from a transaction
   */
  async deleteAttachment(transactionId: string, attachmentId: string): Promise<MessageResponse> {
    return api.delete<MessageResponse>(`/api/transactions/${transactionId}/attachment/${attachmentId}`);
  },
};
