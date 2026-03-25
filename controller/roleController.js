
// import { prisma } from "../lib/prisma.js";


// // Simple unified error response
// const sendError = (res, status, message) => {
//   return res.status(status).json({
//     success: false,
//     message,
//   });
// };

// // ---------------------------------------------------------
// // CREATE ROLE
// // ---------------------------------------------------------
// // export const createRole = async (req, res) => {
// //   try {
// //     const {
// //       name,
// //       description,
// //       canManageDepartments = false,
// //       canManageDoctors = false,
// //       canManagePatients = false,
// //       canManageWelfare = false,
// //       canManageProcedures = false,
// //       canManageFees = false,
// //       canViewReports = false,
// //     } = req.body;

// //     if (!name) return sendError(res, 400, "Role name is required");

// //     const exists = await prisma.role.findUnique({ where: { name } });
// //     if (exists) return sendError(res, 400, "Role already exists");

// //     const role = await prisma.role.create({
// //       data: {
// //         name,
// //         description,
// //         canManageDepartments,
// //         canManageDoctors,
// //         canManagePatients,
// //         canManageWelfare,
// //         canManageProcedures,
// //         canManageFees,
// //         canViewReports,
// //       },
// //     });

// //     return res.status(201).json({
// //       success: true,
// //       message: "Role created successfully",
// //       data: role,
// //     });
// //   } catch (error) {
// //     console.error("Create Role Error:", error);
// //     return sendError(res, 500, "Internal Server Error");
// //   }
// // };

// // ---------------------------------------------------------
// // GET ALL ROLES
// // ---------------------------------------------------------
// export const getRoles = async (req, res) => {
//   try {
//     const roles = await prisma.role.findMany({
//       orderBy: { id: "desc" },
//     });

//     return res.json({
//       success: true,
//       data: roles,
//     });
//   } catch (error) {
//     console.error("Get Roles Error:", error);
//     return sendError(res, 500, "Internal Server Error");
//   }
// };

// // ---------------------------------------------------------
// // GET SINGLE ROLE
// // ---------------------------------------------------------
// export const getRoleById = async (req, res) => {
//   try {
//     const roleId = parseInt(req.params.id);

//     const role = await prisma.role.findUnique({
//       where: { id: roleId },
//     });

//     if (!role) return sendError(res, 404, "Role not found");

//     return res.json({
//       success: true,
//       data: role,
//     });
//   } catch (error) {
//     console.error("Get Role Error:", error);
//     return sendError(res, 500, "Internal Server Error");
//   }
// };

// // ---------------------------------------------------------
// // UPDATE ROLE
// // ---------------------------------------------------------
// export const updateRole = async (req, res) => {
//   try {
//     const roleId = parseInt(req.params.id);

//     const existing = await prisma.role.findUnique({ where: { id: roleId } });
//     if (!existing) return sendError(res, 404, "Role not found");

//     const updatedRole = await prisma.role.update({
//       where: { id: roleId },
//       data: req.body,
//     });

//     return res.json({
//       success: true,
//       message: "Role updated successfully",
//       data: updatedRole,
//     });
//   } catch (error) {
//     console.error("Update Role Error:", error);
//     return sendError(res, 500, "Internal Server Error");
//   }
// };

// // ---------------------------------------------------------
// // DELETE ROLE
// // ---------------------------------------------------------
// export const deleteRole = async (req, res) => {
//   try {
//     const roleId = parseInt(req.params.id);

//     const role = await prisma.role.findUnique({ where: { id: roleId } });
//     if (!role) return sendError(res, 404, "Role not found");

//     await prisma.role.delete({ where: { id: roleId } });

//     return res.json({
//       success: true,
//       message: "Role deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete Role Error:", error);
//     return sendError(res, 500, "Internal Server Error");
//   }
// };



// export const createRole = async (req, res) => {
//   try {
//     const { name, description } = req.body;
//     const role = await prisma.role.create({
//       data: { name, description },
//     });
//     res.json(role);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// export const listRoles = async (req, res) => {
//   try {
//     const roles = await prisma.role.findMany({
//       include: { permissions: { include: { permission: true } }, users: true }
//     });
//     res.json(roles);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };



import { prisma } from "../lib/prisma.js";

// Create Role
export const createRole = async (req, res) => {
  try {
    const { name, description, permissionIds } = req.body;

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          create: permissionIds?.map((id) => ({ permissionId: id })),
        },
      },
      include: { permissions: { include: { permission: true } } },
    });

    res.json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// List Roles
export const listRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: { permissions: { include: { permission: true } }, users: true },
    });
    res.json(roles);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Role by ID
export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
      where: { id: parseInt(id) },
      include: { permissions: { include: { permission: true } }, users: true },
    });
    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update Role
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissionIds } = req.body;

    const role = await prisma.role.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        permissions: {
          deleteMany: {}, // Remove old permissions
          create: permissionIds?.map((pid) => ({ permissionId: pid })),
        },
      },
      include: { permissions: { include: { permission: true } } },
    });

    res.json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Role
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.role.delete({ where: { id: parseInt(id) } });

    res.json({ message: "Role deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};