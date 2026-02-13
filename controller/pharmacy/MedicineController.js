import { prisma } from "../../lib/prisma.js";
import {
  buildPaginationResponse,
  getPagination,
} from "../../utils/pagination.js";

// Create Medicine
export const createMedicine = async (req, res) => {
  try {
    const {
      name,
      genericNameId,
      companyId,
      categoryId,
      dosageFormId,
      unitId,
      description,
      isActive,
    } = req.body;

    console.log(name , categoryId , dosageFormId)

    if (!name || !categoryId || !dosageFormId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, Category and Form are required",
        });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        genericNameId,
        companyId,
        categoryId,
        dosageFormId,
        unitId,
        description,
        isActive: isActive ?? true,
      },
      include: { category: true, dosageForm: true },
    });

    res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getMedicines = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    // First, get total count
    const total = await prisma.medicine.count();

    // Then, get paginated medicines
    const medicines = await prisma.medicine.findMany({
      skip,
      take: limit,
      include: {
        category: true,
        dosageForm: true, 
        genericName:true,
        unit:true
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: medicines,
      ...buildPaginationResponse(total, page, limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch medicines" });
  }
};


// Get by ID, Update, Delete → same pattern, include category & medicineForm
