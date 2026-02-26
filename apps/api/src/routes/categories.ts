import { Router, type Router as RouterType } from "express";
import { requireAuth } from "../middleware/auth.js";
import { categoriesService, CategoryType } from "../services/categories.service.js";

const router: RouterType = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/categories
 * List all categories for the current user
 * Optional query: ?type=income|expense
 */
router.get("/", async (req, res) => {
  try {
    const { type } = req.query;

    let categories;
    if (type && (type === "income" || type === "expense")) {
      categories = await categoriesService.getByType(req.user!.id, type as CategoryType);
    } else {
      categories = await categoriesService.getAll(req.user!.id);
    }

    res.json({ data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

/**
 * GET /api/categories/:id
 * Get a single category by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const category = await categoriesService.getById(req.user!.id, req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ data: category });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

/**
 * POST /api/categories
 * Create a new category
 */
router.post("/", async (req, res) => {
  try {
    const { name, description, icon, color, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: "Name and type are required" });
    }

    if (type !== "income" && type !== "expense") {
      return res.status(400).json({ error: "Type must be 'income' or 'expense'" });
    }

    const category = await categoriesService.create(req.user!.id, {
      name,
      description,
      icon,
      color,
      type,
    });

    res.status(201).json({ data: category });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

/**
 * PUT /api/categories/:id
 * Update an existing category
 */
router.put("/:id", async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;

    const category = await categoriesService.update(req.user!.id, req.params.id, {
      name,
      description,
      icon,
      color,
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ data: category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

/**
 * DELETE /api/categories/:id
 * Delete a category
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await categoriesService.delete(req.user!.id, req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

/**
 * POST /api/categories/seed
 * Seed default categories for the current user
 */
router.post("/seed", async (req, res) => {
  try {
    await categoriesService.seedDefaults(req.user!.id);
    res.status(201).json({ message: "Default categories created successfully" });
  } catch (error) {
    console.error("Error seeding categories:", error);
    res.status(500).json({ error: "Failed to seed default categories" });
  }
});

export default router;
