import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsService } from '../services/transactions.service';
import type {
  TransactionFilters,
  CreateTransactionInput,
  UpdateTransactionInput,
  AddAttachmentInput,
} from '../types/api.types';

// Query keys for cache management
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: TransactionFilters) => [...transactionKeys.lists(), filters] as const,
  recent: (limit?: number) => [...transactionKeys.all, 'recent', limit] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};

/**
 * Query hook for fetching paginated transactions
 */
export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => transactionsService.getAll(filters),
  });
}

/**
 * Query hook for fetching recent transactions
 */
export function useRecentTransactions(limit: number = 5) {
  return useQuery({
    queryKey: transactionKeys.recent(limit),
    queryFn: () => transactionsService.getRecent(limit),
    select: (data) => data.data,
  });
}

/**
 * Query hook for fetching a single transaction
 */
export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionsService.getById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

/**
 * Mutation hook for creating a transaction
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTransactionInput) => transactionsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}

/**
 * Mutation hook for updating a transaction
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTransactionInput }) =>
      transactionsService.update(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}

/**
 * Mutation hook for deleting a transaction
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}

/**
 * Mutation hook for adding an attachment
 */
export function useAddAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, input }: { transactionId: string; input: AddAttachmentInput }) =>
      transactionsService.addAttachment(transactionId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(variables.transactionId) });
    },
  });
}

/**
 * Mutation hook for deleting an attachment
 */
export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, attachmentId }: { transactionId: string; attachmentId: string }) =>
      transactionsService.deleteAttachment(transactionId, attachmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(variables.transactionId) });
    },
  });
}
