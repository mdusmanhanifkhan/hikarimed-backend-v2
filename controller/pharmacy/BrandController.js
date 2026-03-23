import { prisma } from "../../lib/prisma.js";

// Create a new Brand
export const createBrand = async (req, res) => {
  try {
    const { name, code, phone, email, remarks, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Brand Name is required",
      });
    }

    // Check if brand already exists by name or code
    const existingBrand = await prisma.brand.findFirst({
      where: {
        OR: [
          { name },
          code ? { code } : undefined,
        ].filter(Boolean),
      },
    });

    if (existingBrand) {
      return res.status(409).json({
        success: false,
        message: "Brand already exists",
      });
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        code,
        phone,
        email,
        remarks,
        isActive: isActive ?? true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: brand,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get all Brands
export const getBrands = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get Brand by ID
export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findUnique({
      where: { id: Number(id) },
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: brand,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Update a Brand
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, phone, email, remarks, isActive } = req.body;

    const brand = await prisma.brand.update({
      where: { id: Number(id) },
      data: {
        name,
        code,
        phone,
        email,
        remarks,
        isActive,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete a Brand
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.brand.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};