import { prisma } from "../../lib/prisma.js";

// Create Generic Name
export const createGenericName = async (req, res) => {
  try {
    const { name, status } = req.body; // Destructure status from request
    if (!name) {
      return res.status(400).json({ success: false, message: "Generic name is required" });
    }

    const existing = await prisma.genericName.findUnique({ where: { name } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Generic name already exists" });
    }

    const generic = await prisma.genericName.create({
      data: { 
        name, 
        status: status !== undefined ? status : true // Default to true if not provided
      },
    });

    res.status(201).json({ success: true, data: generic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get All Generic Names
export const getGenericNames = async (req, res) => {
  try {
    const generics = await prisma.genericName.findMany({ 
      orderBy: { name: "asc" },
      include: { _count: { select: { medicines: true } } }
    });
    res.json({ success: true, data: generics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch generic names" });
  }
};

// Get Single Generic Name
export const getGenericNameById = async (req, res) => {
  try {
    const { id } = req.params;
    const generic = await prisma.genericName.findUnique({
      where: { id: parseInt(id) },
      include: { medicines: true }
    });

    if (!generic) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: generic });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching record" });
  }
};

// Update Generic Name
export const updateGenericName = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body; // Added status to update payload

    const updated = await prisma.genericName.update({
      where: { id: parseInt(id) },
      data: { 
        name,
        status // This will update name, status, or both
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

// Delete Generic Name
export const deleteGenericName = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.genericName.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};
