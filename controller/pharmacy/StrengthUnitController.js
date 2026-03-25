import { prisma } from "../../lib/prisma.js";

// --------------------
// STRENGTH UNIT CONTROLLER
// --------------------

// Create Strength Unit
export const createStrengthUnit = async (req, res) => {
  try {
    const { name, status } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const unit = await prisma.strengthUnit.create({
      data: { name, status: status ?? true },
    });

    res.status(201).json({ success: true, data: unit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get All Strength Units
export const getStrengthUnits = async (req, res) => {
  try {
    const units = await prisma.strengthUnit.findMany({
      orderBy: { id: "asc" },
    });
    res.json({ success: true, data: units });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch units" });
  }
};

// Update Strength Unit
export const updateStrengthUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const unit = await prisma.strengthUnit.update({
      where: { id: parseInt(id) },
      data: { name, status },
    });

    res.json({ success: true, data: unit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Delete Strength Unit
export const deleteStrengthUnit = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.strengthUnit.delete({ where: { id: parseInt(id) } });

    res.json({ success: true, message: "Strength unit deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getSingleStrengthUnit = async (req, res) => {
  try {
    const { id } = req.params;

    const unit = await prisma.strengthUnit.findUnique({
      where: { id: parseInt(id) },
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Strength unit not found",
      });
    }

    res.json({ success: true, data: unit });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch strength unit",
    });
  }
};

// --------------------
// PACKING TYPE CONTROLLER
// --------------------

// Create Packing Type
export const createPackingType = async (req, res) => {
  try {
    const { name, status } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const packing = await prisma.packingType.create({
      data: { name, status: status ?? true },
    });

    res.status(201).json({ success: true, data: packing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get All Packing Types
export const getPackingTypes = async (req, res) => {
  try {
    const packings = await prisma.packingType.findMany({ orderBy: { id: "asc" } });
    res.json({ success: true, data: packings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch packing types" });
  }
};

// Update Packing Type
export const updatePackingType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const packing = await prisma.packingType.update({
      where: { id: parseInt(id) },
      data: { name, status },
    });

    res.json({ success: true, data: packing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Delete Packing Type
export const deletePackingType = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.packingType.delete({ where: { id: parseInt(id) } });

    res.json({ success: true, message: "Packing type deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getSinglePackingType = async (req, res) => {
  try {
    const { id } = req.params;

    const packing = await prisma.packingType.findUnique({
      where: { id: parseInt(id) },
    });

    if (!packing) {
      return res.status(404).json({
        success: false,
        message: "Packing type not found",
      });
    }

    res.json({ success: true, data: packing });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch packing type",
    });
  }
};