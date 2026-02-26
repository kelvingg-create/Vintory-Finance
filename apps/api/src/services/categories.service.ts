import { eq, and } from "drizzle-orm";
import { db } from "../lib/db.js";
import { categories, categoryTypeEnum } from "../db/schema/categories.js";

export type CategoryType = (typeof categoryTypeEnum.enumValues)[number];

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

export class CategoriesService {
  /**
   * Get all categories for a user
   */
  async getAll(userId: string) {
    return db.query.categories.findMany({
      where: eq(categories.userId, userId),
      orderBy: (categories, { asc }) => [asc(categories.name)],
    });
  }

  /**
   * Get categories by type (income or expense)
   */
  async getByType(userId: string, type: CategoryType) {
    return db.query.categories.findMany({
      where: and(eq(categories.userId, userId), eq(categories.type, type)),
      orderBy: (categories, { asc }) => [asc(categories.name)],
    });
  }

  /**
   * Get a single category by ID
   */
  async getById(userId: string, categoryId: string) {
    return db.query.categories.findFirst({
      where: and(eq(categories.id, categoryId), eq(categories.userId, userId)),
    });
  }

  /**
   * Create a new category
   */
  async create(userId: string, input: CreateCategoryInput) {
    const [category] = await db
      .insert(categories)
      .values({
        userId,
        name: input.name,
        description: input.description,
        icon: input.icon,
        color: input.color,
        type: input.type,
      })
      .returning();

    return category;
  }

  /**
   * Update an existing category
   */
  async update(userId: string, categoryId: string, input: UpdateCategoryInput) {
    const [category] = await db
      .update(categories)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .returning();

    return category;
  }

  /**
   * Delete a category
   */
  async delete(userId: string, categoryId: string) {
    const [deleted] = await db
      .delete(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .returning();

    return deleted;
  }

  /**
   * Seed default categories for a new user
   */
  async seedDefaults(userId: string) {
    const defaultCategories = [
      // Income categories
      { name: "Salary", description: "Monthly recurring", icon: "payments", color: "emerald", type: "income" as const },
      { name: "Freelance", description: "Project based", icon: "work", color: "blue", type: "income" as const },
      { name: "Dividends", description: "Investments", icon: "monetization_on", color: "purple", type: "income" as const },
      { name: "Refunds", description: "Returns & Adjustments", icon: "undo", color: "yellow", type: "income" as const },
      // Expense categories
      { name: "Rent", description: "Housing", icon: "home", color: "rose", type: "expense" as const },
      { name: "Groceries", description: "Food & Supplies", icon: "shopping_cart", color: "orange", type: "expense" as const },
      { name: "Utilities", description: "Bills & Services", icon: "bolt", color: "cyan", type: "expense" as const },
      { name: "Entertainment", description: "Leisure", icon: "movie", color: "pink", type: "expense" as const },
      { name: "Travel", description: "Vacation & Trips", icon: "flight", color: "indigo", type: "expense" as const },
    ];

    await db.insert(categories).values(
      defaultCategories.map((cat) => ({
        userId,
        ...cat,
      }))
    );
  }
}

export const categoriesService = new CategoriesService();
