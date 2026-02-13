
import { prisma } from "../lib/prisma.js";


// Constants
const PROCEDURE_NAME_MAX = 100;
const PROCEDURE_SHORTCODE_MAX = 10;
const PROCEDURE_DESCRIPTION_MAX = 500;

const ERROR_MESSAGES = {
  REQUIRED: "is required",
  MAX_LENGTH: "exceeds max length",
  INVALID_ID: "Invalid procedure ID",
  NOT_FOUND: "Procedure not found",
  DEPARTMENT_NOT_FOUND: "Department not found",
  INTERNAL: "Internal server error",
};

// Helper for sending structured error responses
const sendError = (res, status, general_error, errors = {}) => {
  return res.status(status).json({ status, general_error, errors });
};

// Validation helper
const validateProcedureInput = ({ name, shortCode, description }) => {
  const errors = {};
  const missingFields = [];

  if (!name || typeof name !== "string" || name.trim() === "") missingFields.push("name");
  else if (name.length > PROCEDURE_NAME_MAX) errors.name = `Name ${ERROR_MESSAGES.MAX_LENGTH} (${PROCEDURE_NAME_MAX})`;

  if (!shortCode || typeof shortCode !== "string" || shortCode.trim() === "") missingFields.push("shortCode");
  else if (shortCode.length > PROCEDURE_SHORTCODE_MAX) errors.shortCode = `Short Code ${ERROR_MESSAGES.MAX_LENGTH} (${PROCEDURE_SHORTCODE_MAX})`;

  if (description && description.length > PROCEDURE_DESCRIPTION_MAX) errors.description = `Description ${ERROR_MESSAGES.MAX_LENGTH} (${PROCEDURE_DESCRIPTION_MAX})`;

  return { errors, missingFields };
};

// Create Procedure
export const createProcedure = async (req, res) => {
  try {
    const { name, shortCode, description, departmentId, status } = req.body;

    const { errors, missingFields } = validateProcedureInput({ name, shortCode, description });

    if (!departmentId) missingFields.push("departmentId");

    if (missingFields.length > 0 || Object.keys(errors).length > 0) {
      const general_error = missingFields.length
        ? `Validation failed: ${missingFields.join(", ")} ${ERROR_MESSAGES.REQUIRED}`
        : "Validation failed";
      return sendError(res, 400, general_error, errors);
    }

    // Check if department exists
    const department = await prisma.department.findUnique({ where: { id: Number(departmentId) } });
    if (!department) return sendError(res, 404, ERROR_MESSAGES.DEPARTMENT_NOT_FOUND);

    const procedure = await prisma.procedure.create({
      data: { name, shortCode, description, departmentId: Number(departmentId), status: status ?? true },
    });

    return res.status(201).json({ status: 201, message: "Procedure created successfully", data: procedure });
  } catch (error) {
    console.error("Error creating procedure:", error);
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL);
  }
};

// Get All Procedures with optional search
export const getProcedures = async (req, res) => {
  try {
    const { search, status } = req.query;

    // --------------------------
    // 🛑 Validate Query Params
    // --------------------------
    if (status && !["true", "false", "all"].includes(status)) {
      return sendError(res, 400, "Invalid status value. Use true, false, or all.");
    }

    // --------------------------
    // 🔍 Build Prisma Filter
    // --------------------------
    const where = {};

    if (status !== undefined && status !== "all") {
      where.status = status === "true";
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortCode: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // --------------------------
    // 📌 Fetch Data from Prisma
    // --------------------------
    const procedures = await prisma.procedure.findMany({
      where,
      include: { department: true },
      orderBy: { createdAt: "desc" },
    });

    // --------------------------
    // 📌 Always Return 200 (Even Empty)
    // --------------------------
    return res.status(200).json({
      success: true,
      message: "Procedures retrieved successfully",
      count: procedures.length,
      data: procedures,
    });

  } catch (error) {
    // --------------------------
    // ❗ Prisma Error Handling
    // --------------------------
    console.error("Error fetching procedures:", error);

    if (error.code === "P2023") {
      // Prisma invalid ID / invalid filter
      return sendError(res, 400, "Invalid query parameters.");
    }

    if (error.code === "P2002") {
      return sendError(res, 409, "Database constraint violation.");
    }

    // --------------------------
    // 🛑 Fallback (Unknown Error)
    // --------------------------
    return sendError(res, 500, "An unexpected error occurred while fetching procedures.");
  }
};

// export const getProcedures = async (req, res) => {
//   try {
//     const { search, status } = req.query;

//     if (status && !["true", "false", "all"].includes(status)) {
//       return sendError(res, 400, "Invalid status value. Use true, false, or all.");
//     }

//     const { page, limit, skip } = getPagination(req.query);

   
//     const where = {};

//     if (status !== undefined && status !== "all") {
//       where.status = status === "true";
//     }

//     if (search) {
//       where.OR = [
//         { name: { contains: search, mode: "insensitive" } },
//         { shortCode: { contains: search, mode: "insensitive" } },
//         { description: { contains: search, mode: "insensitive" } },
//       ];
//     }

//     const [procedures, total] = await Promise.all([
//       prisma.procedure.findMany({
//         where,
//         include: { department: true },
//         orderBy: { createdAt: "desc" },
//         skip,
//         take: limit,
//       }),
//       prisma.procedure.count({ where }),
//     ]);

//     return res.status(200).json({
//       success: true,
//       message: "Procedures retrieved successfully",
//       data: procedures,
//       pagination: buildPaginationResponse(
//         total,
//         page,
//         limit,
//         procedures.length
//       ),
//     });

//   } catch (error) {
//     console.error("Error fetching procedures:", error);
//     return sendError(res, 500, "An unexpected error occurred while fetching procedures.");
//   }
// };

export const getActiveProcedures = async (req, res) => {
  try {
    const { search } = req.query;

    // ✅ Always fetch only active procedures
    const where = {
      status: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { shortCode: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const procedures = await prisma.procedure.findMany({
      where,
      include: { department: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Active procedures retrieved successfully",
      count: procedures.length,
      data: procedures,
    });

  } catch (error) {
    console.error("Error fetching procedures:", error);

    if (error.code === "P2023") {
      return sendError(res, 400, "Invalid query parameters.");
    }

    if (error.code === "P2002") {
      return sendError(res, 409, "Database constraint violation.");
    }

    return sendError(res, 500, "An unexpected error occurred while fetching procedures.");
  }
};

export const getProcedureById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return sendError(res, 400, ERROR_MESSAGES.INVALID_ID);

    const procedure = await prisma.procedure.findUnique({
      where: { id },
      include: { department: true },
    });
    if (!procedure) return sendError(res, 404, ERROR_MESSAGES.NOT_FOUND);

    return res.status(200).json({ status: 200, message: "Procedure retrieved successfully", data: procedure });
  } catch (error) {
    console.error("Error fetching procedure:", error);
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL);
  }
};

// Update Procedure
export const updateProcedure = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return sendError(res, 400, ERROR_MESSAGES.INVALID_ID);

    const { name, shortCode, description, departmentId, status } = req.body;
    const { errors } = validateProcedureInput({ name, shortCode, description });
    if (Object.keys(errors).length > 0) return sendError(res, 400, "Validation failed", errors);

    const procedure = await prisma.procedure.findUnique({ where: { id } });
    if (!procedure) return sendError(res, 404, ERROR_MESSAGES.NOT_FOUND);

    if (departmentId) {
      const department = await prisma.department.findUnique({ where: { id: Number(departmentId) } });
      if (!department) return sendError(res, 404, ERROR_MESSAGES.DEPARTMENT_NOT_FOUND);
    }

    const updatedProcedure = await prisma.procedure.update({
      where: { id },
      data: {
        name: name ?? procedure.name,
        shortCode: shortCode ?? procedure.shortCode,
        description: description ?? procedure.description,
        departmentId: departmentId ? Number(departmentId) : procedure.departmentId,
        status: status ?? procedure.status,
      },
    });

    return res.status(200).json({ status: 200, message: "Procedure updated successfully", data: updatedProcedure });
  } catch (error) {
    console.error("Error updating procedure:", error);
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL);
  }
};

// Delete Procedure
export const deleteProcedure = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return sendError(res, 400, ERROR_MESSAGES.INVALID_ID);

    const procedure = await prisma.procedure.findUnique({ where: { id } });
    if (!procedure) return sendError(res, 404, ERROR_MESSAGES.NOT_FOUND);

    await prisma.procedure.delete({ where: { id } });

    return res.status(200).json({ status: 200, message: "Procedure deleted successfully" });
  } catch (error) {
    console.error("Error deleting procedure:", error);
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL);
  }
};

// Search Procedure
export const searchProcedures = async (req, res) => {
  try {
    const query = req.query.query?.toString().trim() || "";

    // if query is empty, return all procedures
    const where = query
      ? { name: { contains: query, mode: "insensitive" } }
      : {};

    const procedures = await prisma.procedure.findMany({
      where,
      include: { department: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      status: 200,
      message: query
        ? `Procedures matching "${query}" retrieved successfully`
        : "All procedures retrieved successfully",
      data: procedures,
    });
  } catch (error) {
    console.error("Error searching procedures:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

import XLSX from "xlsx"

export const bulkUploadProcedures = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      })
    }

    const workbook = XLSX.read(req.file.buffer)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet)

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty",
      })
    }

    // 🔍 Load departments once
    const departments = await prisma.department.findMany({
      select: { id: true, name: true },
    })

    const deptByName = new Map(
      departments.map((d) => [d.name.toLowerCase(), d.id])
    )

    const proceduresToCreate = []
    const skipped = []

    for (const row of rows) {
      const name = row.name?.toString().trim()

      if (!name) {
        skipped.push({ row, reason: "Procedure name missing" })
        continue
      }

      // 🏥 Resolve department
      let departmentId = null

      if (row.departmentId) {
        departmentId = Number(row.departmentId)
      } else if (row.departmentName) {
        departmentId =
          deptByName.get(row.departmentName.toString().toLowerCase()) || null
      }

      if (!departmentId) {
        skipped.push({ row, reason: "Department not found" })
        continue
      }

      // ✅ Normalize status
      let status = true
      if (row.status !== undefined) {
        const s = row.status.toString().toLowerCase()
        status = ["active", "true", "1", "yes"].includes(s)
      }

      proceduresToCreate.push({
        id:row.id,
        name,
        shortCode: row.shortCode?.toString().trim() || null,
        description: row.description?.toString().trim() || null,
        status,
        departmentId,
      })
    }

    if (!proceduresToCreate.length) {
      return res.status(400).json({
        success: false,
        message: "No valid procedures found in Excel",
      })
    }

    const result = await prisma.procedure.createMany({
      data: proceduresToCreate,
      skipDuplicates: true, // respects @@unique([departmentId, name])
    })

    return res.status(201).json({
      success: true,
      message: "Procedures uploaded successfully",
      inserted: result.count,
      skipped: skipped.length,
      skippedRows: skipped,
    })
  } catch (error) {
    console.error("bulkUploadProcedures error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload procedures",
    })
  }
}
