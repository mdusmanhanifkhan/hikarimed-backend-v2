import { prisma } from "../lib/prisma.js";

// Create Permission
export const createPermission = async (req, res) => {
  try {
    const { name, description } = req.body;
    const permission = await prisma.permission.create({ data: { name, description } });
    res.json(permission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// List Permissions
export const listPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({ include: { roles: true } });
    res.json(permissions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Permission by ID
export const getPermission = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await prisma.permission.findUnique({
      where: { id: parseInt(id) },
      include: { roles: { include: { role: true } } },
    });
    if (!permission) return res.status(404).json({ error: "Permission not found" });
    res.json(permission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update Permission
export const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const permission = await prisma.permission.update({
      where: { id: parseInt(id) },
      data: { name, description },
    });

    res.json(permission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Permission
export const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.permission.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Permission deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};