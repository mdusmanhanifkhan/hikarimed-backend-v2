
import { prisma } from "../lib/prisma.js";

// Constants
const DEPARTMENT_NAME_MAX = 100;
const DEPARTMENT_SHORTCODE_MAX = 10;
const DEPARTMENT_LOCATION_MAX = 100;
const DEPARTMENT_DESCRIPTION_MAX = 500;
const DEPARTMENT_TIME_MAX = 10; // max string length for time, e.g., "09:00"

// Error messages
const ERROR_MESSAGES = {
  REQUIRED: "is required",
  MAX_LENGTH: "exceeds max length",
  INVALID_ID: "Invalid department ID",
  NOT_FOUND: "Department not found",
  DUPLICATE: "already exists",
  HAS_RELATIONS: "Cannot delete department with existing procedures",
  INTERNAL: "Internal server error",
};

// Helper to send structured errors
const sendError = (res, status, general_error, errors = {}) =>
  res.status(status).json({ status, general_error, errors });

// Helper for validation
const validateDepartmentInput = ({ name, shortCode, location, description, timeFrom, timeTo }) => {
  const errors = {};
  const missingFields = [];

  if (!name || typeof name !== "string" || name.trim() === "") missingFields.push("name");
  else if (name.length > DEPARTMENT_NAME_MAX) errors.name = `Name ${ERROR_MESSAGES.MAX_LENGTH} (${DEPARTMENT_NAME_MAX})`;

  if (!shortCode || typeof shortCode !== "string" || shortCode.trim() === "") missingFields.push("shortCode");
  else if (shortCode.length > DEPARTMENT_SHORTCODE_MAX) errors.shortCode = `Short Code ${ERROR_MESSAGES.MAX_LENGTH} (${DEPARTMENT_SHORTCODE_MAX})`;

  if (location && location.length > DEPARTMENT_LOCATION_MAX) errors.location = `Location ${ERROR_MESSAGES.MAX_LENGTH} (${DEPARTMENT_LOCATION_MAX})`;
  if (description && description.length > DEPARTMENT_DESCRIPTION_MAX) errors.description = `Description ${ERROR_MESSAGES.MAX_LENGTH} (${DEPARTMENT_DESCRIPTION_MAX})`;

  if (timeFrom && timeFrom.length > DEPARTMENT_TIME_MAX) errors.timeFrom = `Opening time ${ERROR_MESSAGES.MAX_LENGTH} (${DEPARTMENT_TIME_MAX})`;
  if (timeTo && timeTo.length > DEPARTMENT_TIME_MAX) errors.timeTo = `Closing time ${ERROR_MESSAGES.MAX_LENGTH} (${DEPARTMENT_TIME_MAX})`;

  return { errors, missingFields };
};

// Create Department
export const createDepartment = async (req, res) => {
  try {
    const { name, shortCode, location, description, timeFrom, timeTo, status } = req.body;

    const { errors, missingFields } = validateDepartmentInput({ name, shortCode, location, description, timeFrom, timeTo });

    if (missingFields.length > 0 || Object.keys(errors).length > 0) {
      const general_error = missingFields.length
        ? `Validation failed: ${missingFields.join(", ")} ${ERROR_MESSAGES.REQUIRED}`
        : "Validation failed";
      return sendError(res, 400, general_error, errors);
    }

    // Check duplicates
    const existing = await prisma.department.findFirst({
      where: { OR: [{ name }, { shortCode }] },
    });

    if (existing) {
      const dupErrors = {};
      if (existing.name === name) dupErrors.name = `Name ${ERROR_MESSAGES.DUPLICATE}`;
      if (existing.shortCode === shortCode) dupErrors.shortCode = `Short Code ${ERROR_MESSAGES.DUPLICATE}`;
      return sendError(res, 409, "Duplicate department", dupErrors);
    }

    const department = await prisma.department.create({
      data: { name, shortCode, location, description, timeFrom, timeTo, status: status ?? true },
    });

    return res.status(201).json({ status: 201, message: "Department created successfully", data: department });
  } catch (error) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL);
  }
};

// Get all departments (with optional search)
export const getDepartments = async (req, res) => {
  try {
    const { search } = req.query;

    // Always return only active departments (status = true)
    const where = {
      status: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { shortCode: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const departments = await prisma.department.findMany({
      where,
      orderBy: { id: "desc" },
    });

    if (!departments.length)
      return sendError(
        res,
        200,
        search ? `No active departments match "${search}"` : "No active departments found"
      );

    return res.status(200).json({
      status: 200,
      message: "Active departments retrieved successfully",
      data: departments,
    });
  } catch (error) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL);
  }
};

// Get all departments (active + inactive, with optional search)
export const getAllDepartments = async (req, res) => {
  try {
    const { search } = req.query;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { shortCode: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const departments = await prisma.department.findMany({
      where,
      orderBy: { id: "desc" },
    });

    if (!departments.length) {
      return sendError(
        res,
        200,
        search
          ? `No departments match "${search}"`
          : "No departments found"
      );
    }

    return res.status(200).json({
      status: 200,
      message: "Departments retrieved successfully",
      data: departments,
    });
  } catch (error) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL);
  }
};


// Get single department
export const getSingleDepartment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return sendError(res, 400, ERROR_MESSAGES.INVALID_ID);

    const department = await prisma.department.findUnique({ where: { id } });
    if (!department) return sendError(res, 404, ERROR_MESSAGES.NOT_FOUND);

    return res.status(200).json({ status: 200, message: "Department retrieved successfully", data: department });
  } catch (error) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL);
  }
};

// Update department
export const updateDepartment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return sendError(res, 400, ERROR_MESSAGES.INVALID_ID);

    const { name, shortCode, location, description, timeFrom, timeTo, status } = req.body;

    const { errors } = validateDepartmentInput({ name, shortCode, location, description, timeFrom, timeTo });
    if (Object.keys(errors).length > 0) return sendError(res, 400, "Validation failed", errors);

    const department = await prisma.department.findUnique({ where: { id } });
    if (!department) return sendError(res, 404, ERROR_MESSAGES.NOT_FOUND);

    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: { name, shortCode, location, description, timeFrom, timeTo, status },
    });

    return res.status(200).json({ status: 200, message: "Department updated successfully", data: updatedDepartment });
  } catch (error) {
    console.error("Error updating department:", error);
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL);
  }
};

// Delete department
export const deleteDepartment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return sendError(res, 400, ERROR_MESSAGES.INVALID_ID);

    const department = await prisma.department.findUnique({ where: { id } });
    if (!department) return sendError(res, 404, ERROR_MESSAGES.NOT_FOUND);

    const relatedProcedures = await prisma.procedure.findMany({ where: { departmentId: id } });
    if (relatedProcedures.length > 0) return sendError(res, 400, ERROR_MESSAGES.HAS_RELATIONS);

    await prisma.department.delete({ where: { id } });

    return res.status(200).json({ status: 200, message: "Department deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL);
  }
};

// export const getDepartmentDoctorProcedureTree = async (req, res) => {
//   try {
//     const fees = await prisma.doctorProcedureFee.findMany({
//       where: { status: true }, // only active fee links
//       include: {
//         doctor: true,    // include related doctor
//         procedure: true, // include related procedure
//         department: true // include related department
//       },
//       orderBy: { id: 'asc' }
//     });

//     // group by department -> doctor -> procedures
//     const tree = [];

//     fees.forEach((fee) => {
//       if (!fee.department || !fee.doctor || !fee.procedure) return;

//       // skip inactive doctors or procedures
//       if (!fee.doctor.status || !fee.procedure.status) return;

//       let dept = tree.find((d) => d.id === fee.department.id);
//       if (!dept) {
//         dept = { id: fee.department.id, name: fee.department.name, doctors: [] };
//         tree.push(dept);
//       }

//       let doc = dept.doctors.find((d) => d.id === fee.doctor.id);
//       if (!doc) {
//         doc = { id: fee.doctor.id, name: fee.doctor.name, procedures: [] };
//         dept.doctors.push(doc);
//       }

//       doc.procedures.push({
//         id: fee.procedure.id,
//         name: fee.procedure.name,
//         fee: Number(fee.procedurePrice) || 0,
//       });
//     });

//     return res.status(200).json({
//       message: "Department → Doctors → Procedures tree fetched successfully",
//       data: tree,
//     });

//   } catch (error) {
//     console.error("❌ Error fetching department tree:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
export const getDepartmentDoctorProcedureTree = async (req, res) => {
  try {
    const allowedDepartments = [
      "LAB",
      "X-RAY",
      "RADIOLOGY",
      "ULTRASOUND",
    ];

    const fees = await prisma.doctorProcedureFee.findMany({
      where: {
        status: true,
        department: {
          name: {
            in: allowedDepartments,
            mode: "insensitive", // case insensitive
          },
        },
      },
      include: {
        doctor: true,
        procedure: true,
        department: true,
      },
      orderBy: { id: "asc" },
    });

    const tree = [];

    fees.forEach((fee) => {
      if (!fee.department || !fee.doctor || !fee.procedure) return;
      if (!fee.doctor.status || !fee.procedure.status) return;

      let dept = tree.find((d) => d.id === fee.department.id);
      if (!dept) {
        dept = {
          id: fee.department.id,
          name: fee.department.name,
          doctors: [],
        };
        tree.push(dept);
      }

      let doc = dept.doctors.find((d) => d.id === fee.doctor.id);
      if (!doc) {
        doc = {
          id: fee.doctor.id,
          name: fee.doctor.name,
          procedures: [],
        };
        dept.doctors.push(doc);
      }

      doc.procedures.push({
        id: fee.procedure.id,
        name: fee.procedure.name,
        fee: Number(fee.procedurePrice) || 0,
      });
    });

    return res.status(200).json({
      success: true,
      data: tree,
    });
  } catch (error) {
    console.error("❌ Error fetching department tree:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getOtherDepartmentDoctorProcedureTree = async (req, res) => {
  try {
    const excludedDepartments = [
      "LAB",
      "X-RAY",
      "RADIOLOGY",
      "ULTRASOUND",
    ];

    const fees = await prisma.doctorProcedureFee.findMany({
      where: {
        status: true,
        department: {
          name: {
            notIn: excludedDepartments,
            mode: "insensitive",
          },
        },
      },
      include: {
        doctor: true,
        procedure: true,
        department: true,
      },
      orderBy: { id: "asc" },
    });

    const tree = [];

    fees.forEach((fee) => {
      if (!fee.department || !fee.doctor || !fee.procedure) return;
      if (!fee.doctor.status || !fee.procedure.status) return;

      let dept = tree.find((d) => d.id === fee.department.id);
      if (!dept) {
        dept = {
          id: fee.department.id,
          name: fee.department.name,
          doctors: [],
        };
        tree.push(dept);
      }

      let doc = dept.doctors.find((d) => d.id === fee.doctor.id);
      if (!doc) {
        doc = {
          id: fee.doctor.id,
          name: fee.doctor.name,
          procedures: [],
        };
        dept.doctors.push(doc);
      }

      doc.procedures.push({
        id: fee.procedure.id,
        name: fee.procedure.name,
        fee: Number(fee.procedurePrice) || 0,
      });
    });

    return res.status(200).json({
      success: true,
      data: tree,
    });

  } catch (error) {
    console.error("❌ Error fetching other department tree:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



import XLSX from "xlsx"

export const bulkUploadDepartments = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      })
    }

    // 📄 Read Excel
    const workbook = XLSX.read(req.file.buffer)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet)

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty",
      })
    }

    const departmentsToCreate = []
    const skipped = []

    for (const row of rows) {
      const name = row.name?.toString().trim()

      if (!name) {
        skipped.push({ row, reason: "Department name missing" })
        continue
      }

      // ✅ Normalize status
      let status = true
      if (row.status !== undefined) {
        const s = row.status.toString().toLowerCase()
        status = ["active", "true", "1", "yes"].includes(s)
      }

      departmentsToCreate.push({
        name,
        shortCode: row.shortCode?.toString().trim() || null,
        location: row.location?.toString().trim() || null,
        description: row.description?.toString().trim() || null,
        status,
        timeFrom: row.timeFrom?.toString().trim() || null,
        timeTo: row.timeTo?.toString().trim() || null,
      })
    }

    if (!departmentsToCreate.length) {
      return res.status(400).json({
        success: false,
        message: "No valid departments found in Excel",
      })
    }

    // 🚀 Bulk insert
    const result = await prisma.department.createMany({
      data: departmentsToCreate,
      skipDuplicates: true, // name & shortCode unique
    })

    return res.status(201).json({
      success: true,
      message: "Departments uploaded successfully",
      inserted: result.count,
      skipped: skipped.length,
      skippedRows: skipped,
    })
  } catch (error) {
    console.error("bulkUploadDepartments error:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload departments",
    })
  }
}
