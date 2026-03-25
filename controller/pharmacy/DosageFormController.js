import { prisma } from "../../lib/prisma.js";

// ===============================
// CREATE DOSAGE FORM
// ===============================
export const createDosageForm = async (req, res) => {
  try {
    const { name, code, status } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Dosage form name is required",
      });
    }

    const existing = await prisma.dosageForm.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Dosage form already exists",
      });
    }

    const form = await prisma.dosageForm.create({
      data: {
        name: name.trim(),
        code: code?.trim(),
        status: status ?? true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Dosage form created successfully",
      data: form,
    });
  } catch (error) {
    console.error("Create Dosage Form Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ===============================
// GET ALL DOSAGE FORMS
// ===============================
export const getDosageForms = async (req, res) => {
  try {
    const forms = await prisma.dosageForm.findMany({
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      count: forms.length,
      data: forms,
    });
  } catch (error) {
    console.error("Fetch Dosage Forms Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dosage forms",
    });
  }
};

// ===============================
// GET DOSAGE FORM BY ID
// ===============================
export const getDosageFormById = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await prisma.dosageForm.findUnique({
      where: { id: Number(id) },
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Dosage form not found",
      });
    }

    res.json({
      success: true,
      data: form,
    });
  } catch (error) {
    console.error("Get Dosage Form Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dosage form",
    });
  }
};

// ===============================
// UPDATE DOSAGE FORM
// ===============================
export const updateDosageForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, status } = req.body;

    const existing = await prisma.dosageForm.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Dosage form not found",
      });
    }

    const updated = await prisma.dosageForm.update({
      where: { id: Number(id) },
      data: {
        name: name?.trim(),
        code: code?.trim(),
        status,
      },
    });

    res.json({
      success: true,
      message: "Dosage form updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Dosage Form Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update dosage form",
    });
  }
};

// ===============================
// DELETE DOSAGE FORM
// ===============================
export const deleteDosageForm = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.dosageForm.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Dosage form not found",
      });
    }

    // Optional: prevent delete if used
    const used = await prisma.product.findFirst({
      where: { dosageFormId: Number(id) },
    });

    if (used) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete. Dosage form is in use.",
      });
    }

    await prisma.dosageForm.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: "Dosage form deleted successfully",
    });
  } catch (error) {
    console.error("Delete Dosage Form Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete dosage form",
    });
  }
};