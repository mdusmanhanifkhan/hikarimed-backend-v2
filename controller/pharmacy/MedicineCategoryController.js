import { prisma } from "../../lib/prisma.js";

// Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name) return res.status(400).json({ success: false, message: "Category name is required" });

    const existing = await prisma.medicineCategory.findUnique({ where: { name } });
    if (existing) return res.status(409).json({ success: false, message: "Category already exists" });

    const category = await prisma.medicineCategory.create({
      data: { name, description, status: status ?? true },
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get All Categories
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.medicineCategory.findMany({ orderBy: { name: "asc" } });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

// Get Category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.medicineCategory.findUnique({ where: { id: Number(id) } });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const category = await prisma.medicineCategory.update({
      where: { id: Number(id) },
      data: { name, description, status },
    });

    res.json({ success: true, data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.medicineCategory.delete({ where: { id: Number(id) } });
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
