// Re-export types from services for external use
export type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryType,
} from "../services/categories.service.js";

export type {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
  AddAttachmentInput,
  TransactionType,
  TransactionStatus,
} from "../services/transactions.service.js";

export type {
  DateRange,
  Summary,
  CashFlowData,
} from "../services/reports.service.js";

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
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
