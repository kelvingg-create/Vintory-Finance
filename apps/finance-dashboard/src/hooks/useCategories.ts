import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '../services/categories.service';
import type { CategoryType, CreateCategoryInput, UpdateCategoryInput } from '../types/api.types';

// Query keys for cache management
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (type?: CategoryType) => [...categoryKeys.lists(), { type }] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

/**
 * Query hook for fetching all categories
 */
export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: categoryKeys.list(type),
    queryFn: () => categoriesService.getAll(type),
    select: (data) => data.data,
  });
}

/**
 * Query hook for fetching a single category
 */
export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoriesService.getById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

/**
 * Mutation hook for creating a category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoriesService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

/**
 * Mutation hook for updating a category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      categoriesService.update(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
    },
  });
}

/**
 * Mutation hook for deleting a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

/**
 * Mutation hook for seeding default categories
 */
export function useSeedCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => categoriesService.seedDefaults(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}
