// ============================================
// Common Types
// ============================================

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MessageResponse {
  message: string;
}

// ============================================
// Category Types
// ============================================

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  type: CategoryType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  type: CategoryType;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
}

// ============================================
// Transaction Types
// ============================================

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'pending' | 'approved' | 'rejected';

export interface Attachment {
  id: string;
  transactionId: string;
  fileName: string;
  fileUrl: string;
  mimeType: string | null;
  fileSize: number | null;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string | null;
  type: TransactionType;
  amount: string;
  transactionDate: string;
  description: string | null;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  attachments?: Attachment[];
}

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

// ============================================
// Report Types
// ============================================

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

export interface ComparisonData {
  current: Summary;
  previous: Summary;
  changes: {
    incomeChange: number;
    expenseChange: number;
    balanceChange: number;
  };
}
