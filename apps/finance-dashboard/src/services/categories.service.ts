import { api } from '../lib/api';
import type {
  Category,
  CategoryType,
  CreateCategoryInput,
  UpdateCategoryInput,
  ApiResponse,
  MessageResponse,
} from '../types/api.types';

export const categoriesService = {
  /**
   * Get all categories, optionally filtered by type
   */
  async getAll(type?: CategoryType): Promise<ApiResponse<Category[]>> {
    const params = type ? { type } : undefined;
    return api.get<ApiResponse<Category[]>>('/api/categories', params);
  },

  /**
   * Get a single category by ID
   */
  async getById(id: string): Promise<ApiResponse<Category>> {
    return api.get<ApiResponse<Category>>(`/api/categories/${id}`);
  },

  /**
   * Create a new category
   */
  async create(input: CreateCategoryInput): Promise<ApiResponse<Category>> {
    return api.post<ApiResponse<Category>>('/api/categories', input);
  },

  /**
   * Update an existing category
   */
  async update(id: string, input: UpdateCategoryInput): Promise<ApiResponse<Category>> {
    return api.put<ApiResponse<Category>>(`/api/categories/${id}`, input);
  },

  /**
   * Delete a category
   */
  async delete(id: string): Promise<MessageResponse> {
    return api.delete<MessageResponse>(`/api/categories/${id}`);
  },

  /**
   * Seed default categories for the current user
   */
  async seedDefaults(): Promise<MessageResponse> {
    return api.post<MessageResponse>('/api/categories/seed');
  },
};
