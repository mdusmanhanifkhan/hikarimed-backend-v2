import { prisma } from "../../lib/prisma.js";


// Create Medicine Form
export const createDosageForm = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Form name is required" });

    const existing = await prisma.dosageForm.findUnique({ where: { name } });
    if (existing) return res.status(409).json({ success: false, message: "Form already exists" });

    const form = await prisma.dosageForm.create({
      data: { name, description, status: status ?? true },
    });

    res.status(201).json({ success: true, data: form });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get All Forms
export const getDosageForms = async (req, res) => {
  try {
    const forms = await prisma.dosageForm.findMany({ orderBy: { name: "asc" } });
    res.json({ success: true, data: forms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch forms" });
  }
};

// Update, Delete, Get by ID same as Category (replace prisma.medicineCategory → prisma.medicineForm)
