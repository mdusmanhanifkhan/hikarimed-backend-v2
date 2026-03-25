import { prisma } from "../../lib/prisma.js";


// ---------------------------
// CREATE CATEGORY
// ---------------------------
export const createCategory = async (req, res) => {
  try {
    const { name, isActive } = req.body;

    if (!name) return res.status(400).json({ success: false, message: "Category name is required" });

    // Check duplicate top-level category
    const existing = await prisma.category.findFirst({
      where: { name, parentId: null },
    });
    if (existing) return res.status(409).json({ success: false, message: "Parent category already exists" });

    const category = await prisma.category.create({
      data: { name, parentId: null, level: 1, isActive: isActive ?? true },
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// ---------------------------
// CREATE SUB-CATEGORY
// ---------------------------
export const createSubcategory = async (req, res) => {
  try {
    const { name, parentId, isActive } = req.body;

    if (!name) return res.status(400).json({ success: false, message: "Category name is required" });
    if (!parentId) return res.status(400).json({ success: false, message: "Parent category is required" });

    const parent = await prisma.category.findUnique({ where: { id: Number(parentId) } });
    if (!parent) return res.status(400).json({ success: false, message: "Parent category not found" });

    // Check duplicate under same parent
    const existing = await prisma.category.findFirst({
      where: { name, parentId: Number(parentId) },
    });
    if (existing) return res.status(409).json({ success: false, message: "Subcategory already exists under this parent" });

    const category = await prisma.category.create({
      data: {
        name,
        parentId: parent.id,
        level: (parent.level || 1) + 1,
        isActive: isActive ?? true,
      },
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ---------------------------
// GET ALL CATEGORIES (HIERARCHY)
// ---------------------------
export const getCategories = async (req, res) => {
  try {
    // Fetch all categories with children recursively
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      include: { children: true },
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

export const getCategoryTree = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null }, // top-level categories
      include: {
        children: {
          include: {
            children: true, // for sub-subcategories if needed
          },
        },
      },
    });

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ---------------------------
// GET CATEGORY BY ID
// ---------------------------
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: { children: true },
    });

    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    res.json({ success: true, data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ---------------------------
// UPDATE CATEGORY
// ---------------------------
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId, isActive } = req.body;

    // If parentId is provided, check it exists
    let level = 1;
    if (parentId) {
      const parent = await prisma.category.findUnique({ where: { id: Number(parentId) } });
      if (!parent) return res.status(400).json({ success: false, message: "Parent category not found" });
      level = (parent.level || 1) + 1;
    }

    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        name,
        parentId: parentId ?? null,
        level,
        isActive,
      },
    });

    res.json({ success: true, data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ---------------------------
// DELETE CATEGORY
// ---------------------------
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: Check if category has children
    const children = await prisma.category.findFirst({ where: { parentId: Number(id) } });
    if (children) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with subcategories. Delete children first.",
      });
    }

    await prisma.category.delete({ where: { id: Number(id) } });

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};