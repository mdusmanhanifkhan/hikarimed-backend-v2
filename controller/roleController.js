
import { prisma } from "../lib/prisma.js";


// Simple unified error response
const sendError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

// ---------------------------------------------------------
// CREATE ROLE
// ---------------------------------------------------------
export const createRole = async (req, res) => {
  try {
    const {
      name,
      description,
      canManageDepartments = false,
      canManageDoctors = false,
      canManagePatients = false,
      canManageWelfare = false,
      canManageProcedures = false,
      canManageFees = false,
      canViewReports = false,
    } = req.body;

    if (!name) return sendError(res, 400, "Role name is required");

    const exists = await prisma.role.findUnique({ where: { name } });
    if (exists) return sendError(res, 400, "Role already exists");

    const role = await prisma.role.create({
      data: {
        name,
        description,
        canManageDepartments,
        canManageDoctors,
        canManagePatients,
        canManageWelfare,
        canManageProcedures,
        canManageFees,
        canViewReports,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    console.error("Create Role Error:", error);
    return sendError(res, 500, "Internal Server Error");
  }
};

// ---------------------------------------------------------
// GET ALL ROLES
// ---------------------------------------------------------
export const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { id: "desc" },
    });

    return res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("Get Roles Error:", error);
    return sendError(res, 500, "Internal Server Error");
  }
};

// ---------------------------------------------------------
// GET SINGLE ROLE
// ---------------------------------------------------------
export const getRoleById = async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);

    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) return sendError(res, 404, "Role not found");

    return res.json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error("Get Role Error:", error);
    return sendError(res, 500, "Internal Server Error");
  }
};

// ---------------------------------------------------------
// UPDATE ROLE
// ---------------------------------------------------------
export const updateRole = async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);

    const existing = await prisma.role.findUnique({ where: { id: roleId } });
    if (!existing) return sendError(res, 404, "Role not found");

    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: req.body,
    });

    return res.json({
      success: true,
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (error) {
    console.error("Update Role Error:", error);
    return sendError(res, 500, "Internal Server Error");
  }
};

// ---------------------------------------------------------
// DELETE ROLE
// ---------------------------------------------------------
export const deleteRole = async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) return sendError(res, 404, "Role not found");

    await prisma.role.delete({ where: { id: roleId } });

    return res.json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.error("Delete Role Error:", error);
    return sendError(res, 500, "Internal Server Error");
  }
};
