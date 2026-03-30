import XLSX from "xlsx";
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

const DEPARTMENT_TYPE_VALUES = [
  "OPD",
  "Pharmacy",
  "Grocery",
  "Surgical",
  "General",
  "IT",
  "Business",
  "Other",
];
// Helper to send structured errors
const sendError = (res, status, general_error, errors = {}) =>
  res.status(status).json({ status, general_error, errors });

// Helper for validation
const validateDepartmentInput = ({
  name,
  type,
  shortCode,
  location,
  description,
  timeFrom,
  timeTo,
}) => {
  const errors = {};
  const missingFields = [];

  if (!name || typeof name !== "string" || name.trim() === "")
    missingFields.push("name");
  else if (name.length > DEPARTMENT_NAME_MAX)
    errors.name = `Name ${ERROR_MESSAGES.MAX_LENGTH} (${DEPARTMENT_NAME_MAX})`;

  if (!type || typeof type !== "string") missingFields.push("type");
  else if (!DEPARTMENT_TYPE_VALUES.includes(type))
    errors.type = `Invalid type. Allowed: ${DEPARTMENT_TYPE_VALUES.join(", ")}`;

  if (!shortCode || typeof shortCode !== "string" || shortCode.trim() === "")
    missingFields.push("shortCode");
  else if (shortCode.length > DEPARTMENT_SHORTCODE_MAX)
    errors.shortCode = `Short Code ${ERROR_MESSAGES.MAX_LENGTH} (${DEPARTMENT_SHORTCODE_MAX})`;

  if (location && location.length > DEPARTMENT_LOCATION_MAX)
    errors.location = `Location ${ERROR_MESSAGES.MAX_LENGTH} (${DEPARTMENT_LOCATION_MAX})`;
  if (description && description.length > DEPARTMENT_DESCRIPTION_MAX)
    errors.description = `Description ${ERROR_MESSAGES.MAX_LENGTH} (${DEPARTMENT_DESCRIPTION_MAX})`;

  if (timeFrom && timeFrom.length > DEPARTMENT_TIME_MAX)
    errors.timeFrom = `Opening time ${ERROR_MESSAGES.MAX_LENGTH} (${DEPARTMENT_TIME_MAX})`;
  if (timeTo && timeTo.length > DEPARTMENT_TIME_MAX)
    errors.timeTo = `Closing time ${ERROR_MESSAGES.MAX_LENGTH} (${DEPARTMENT_TIME_MAX})`;

  return { errors, missingFields };
};

// Create Department
export const createDepartment = async (req, res) => {
  try {
    const { name, type, shortCode, location, description, timeFrom, timeTo, status } =
      req.body;

    const { errors, missingFields } = validateDepartmentInput({
      name,
      type,
      shortCode,
      location,
      description,
      timeFrom,
      timeTo,
    });

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
      if (existing.name === name)
        dupErrors.name = `Name ${ERROR_MESSAGES.DUPLICATE}`;
      if (existing.shortCode === shortCode)
        dupErrors.shortCode = `Short Code ${ERROR_MESSAGES.DUPLICATE}`;
      return sendError(res, 409, "Duplicate department", dupErrors);
    }

    const department = await prisma.department.create({
      data: {
        name,
        type,
        shortCode,
        location,
        description,
        timeFrom,
        timeTo,
        status: status ?? true,
      },
    });

    return res
      .status(201)
      .json({
        status: 201,
        message: "Department created successfully",
        data: department,
      });
  } catch (error) {
    console.log(error)
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL);
  }
};

// Get all departments (with optional search)
export const getDepartments = async (req, res) => {
  try {
    const { search, type } = req.query;

    const where = {
      status: true, // only active

      // Optional type filter
      ...(type && { type }),

      // Optional search filter
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
      return res.status(200).json({
        status: 200,
        message: "No active departments found",
        data: [],
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Active departments retrieved successfully",
      data: departments,
    });

  } catch (error) {
    console.error("Error fetching departments:", error);
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL);
  }
};

// Get all departments (active + inactive, with optional search)
export const getAllDepartments = async (req, res) => {
  try {
    const { search, type, status } = req.query;

    const where = {
      ...(type && { type }),
      ...(status !== undefined && { status: status === "true" }),
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

    return res.status(200).json({
      success: true,
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
    if (isNaN(id))
      return sendError(res, 400, ERROR_MESSAGES.INVALID_ID);

    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department)
      return sendError(res, 404, ERROR_MESSAGES.NOT_FOUND);

    return res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL);
  }
};

// Update department
export const updateDepartment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id))
      return sendError(res, 400, ERROR_MESSAGES.INVALID_ID);

    const {
      name,
      type,
      shortCode,
      location,
      description,
      timeFrom,
      timeTo,
      status,
    } = req.body;

    if (type && !DEPARTMENT_TYPE_VALUES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Allowed values: ${DEPARTMENT_TYPE_VALUES.join(
          ", "
        )}`,
      });
    }

    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department)
      return sendError(res, 404, ERROR_MESSAGES.NOT_FOUND);

    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(shortCode && { shortCode }),
        ...(location !== undefined && { location }),
        ...(description !== undefined && { description }),
        ...(timeFrom !== undefined && { timeFrom }),
        ...(timeTo !== undefined && { timeTo }),
        ...(status !== undefined && { status }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: updatedDepartment,
    });
  } catch (error) {
    console.error("Error updating department:", error);
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL);
  }
};

// Delete department
export const deleteDepartment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id))
      return sendError(res, 400, ERROR_MESSAGES.INVALID_ID);

    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department)
      return sendError(res, 404, ERROR_MESSAGES.NOT_FOUND);

    const hasRelations = await prisma.department.findFirst({
      where: {
        id,
        OR: [
          { procedures: { some: {} } },
          { grns: { some: {} } },
          { categories: { some: {} } },
          { MedicalRecord: { some: {} } },
          { DoctorProcedureFee: { some: {} } },
        ],
      },
    });

    if (hasRelations) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete department because it is linked to other records",
      });
    }

    await prisma.department.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
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
// export const getDepartmentDoctorProcedureTree = async (req, res) => {
//   try {
//     const allowedDepartments = ["LAB", "X-RAY", "RADIOLOGY", "ULTRASOUND"];

//     const fees = await prisma.doctorProcedureFee.findMany({
//       where: {
//         status: true,
//         department: {
//           name: {
//             in: allowedDepartments,
//             mode: "insensitive", // case insensitive
//           },
//         },
//       },
//       include: {
//         doctor: true,
//         procedure: true,
//         department: true,
//       },
//       orderBy: { id: "asc" },
//     });

//     const tree = [];

//     fees.forEach((fee) => {
//       if (!fee.department || !fee.doctor || !fee.procedure) return;
//       if (!fee.doctor.status || !fee.procedure.status) return;

//       let dept = tree.find((d) => d.id === fee.department.id);
//       if (!dept) {
//         dept = {
//           id: fee.department.id,
//           name: fee.department.name,
//           doctors: [],
//         };
//         tree.push(dept);
//       }

//       let doc = dept.doctors.find((d) => d.id === fee.doctor.id);
//       if (!doc) {
//         doc = {
//           id: fee.doctor.id,
//           name: fee.doctor.name,
//           procedures: [],
//         };
//         dept.doctors.push(doc);
//       }

//       doc.procedures.push({
//         id: fee.procedure.id,
//         name: fee.procedure.name,
//         fee: Number(fee.procedurePrice) || 0,
//       });
//     });

//     return res.status(200).json({
//       success: true,
//       data: tree,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching department tree:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// export const getDepartmentDoctorProcedureTree = async (req, res) => {
//   try {
//     const fees = await prisma.doctorProcedureFee.findMany({
//       where: {
//         status: true,
//         department: {
//           type: "OPD",   // ✅ Only OPD departments
//           status: true,  // Only active departments
//         },
//       },
//       include: {
//         doctor: true,
//         procedure: true,
//         department: true,
//       },
//       orderBy: { id: "asc" },
//     });

//     const tree = [];

//     fees.forEach((fee) => {
//       if (!fee.department || !fee.doctor || !fee.procedure) return;
//       if (!fee.doctor.status || !fee.procedure.status) return;

//       let dept = tree.find((d) => d.id === fee.department.id);

//       if (!dept) {
//         dept = {
//           id: fee.department.id,
//           name: fee.department.name,
//           doctors: [],
//         };
//         tree.push(dept);
//       }

//       let doc = dept.doctors.find((d) => d.id === fee.doctor.id);

//       if (!doc) {
//         doc = {
//           id: fee.doctor.id,
//           name: fee.doctor.name,
//           procedures: [],
//         };
//         dept.doctors.push(doc);
//       }

//       doc.procedures.push({
//         id: fee.procedure.id,
//         name: fee.procedure.name,
//         fee: Number(fee.procedurePrice) || 0,
//       });
//     });

//     return res.status(200).json({
//       success: true,
//       data: tree,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching OPD department tree:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

export const getDepartmentDoctorProcedureTree = async (req, res) => {
  try {
    const fees = await prisma.doctorProcedureFee.findMany({
      where: {
        status: true,
        department: {
          status: true,
          name: {
            in: ["X-Ray", "LAB", "Radiology", "Ultrasound"], // ✅ filter
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

// export const getOtherDepartmentDoctorProcedureTree = async (req, res) => {
//   try {
//     const excludedDepartments = ["LAB", "X-RAY", "RADIOLOGY", "ULTRASOUND"];

//     const fees = await prisma.doctorProcedureFee.findMany({
//       where: {
//         status: true,
//         department: {
//           name: {
//             notIn: excludedDepartments,
//             mode: "insensitive",
//           },
//         },
//       },
//       include: {
//         doctor: true,
//         procedure: true,
//         department: true,
//       },
//       orderBy: { id: "asc" },
//     });

//     const tree = [];

//     fees.forEach((fee) => {
//       if (!fee.department || !fee.doctor || !fee.procedure) return;
//       if (!fee.doctor.status || !fee.procedure.status) return;

//       let dept = tree.find((d) => d.id === fee.department.id);
//       if (!dept) {
//         dept = {
//           id: fee.department.id,
//           name: fee.department.name,
//           doctors: [],
//         };
//         tree.push(dept);
//       }

//       let doc = dept.doctors.find((d) => d.id === fee.doctor.id);
//       if (!doc) {
//         doc = {
//           id: fee.doctor.id,
//           name: fee.doctor.name,
//           procedures: [],
//         };
//         dept.doctors.push(doc);
//       }

//       doc.procedures.push({
//         id: fee.procedure.id,
//         name: fee.procedure.name,
//         fee: Number(fee.procedurePrice) || 0,
//       });
//     });

//     return res.status(200).json({
//       success: true,
//       data: tree,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching other department tree:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };


// export const getOtherDepartmentDoctorProcedureTree = async (req, res) => {
//   try {
//     const fees = await prisma.doctorProcedureFee.findMany({
//       where: {
//         status: true,
//         department: {
//           NOT: { type: "OPD" },  // ✅ Exclude OPD
//           status: true,
//         },
//       },
//       include: {
//         doctor: true,
//         procedure: true,
//         department: true,
//       },
//       orderBy: { id: "asc" },
//     });

//     const tree = [];

//     fees.forEach((fee) => {
//       if (!fee.department || !fee.doctor || !fee.procedure) return;
//       if (!fee.doctor.status || !fee.procedure.status) return;

//       let dept = tree.find((d) => d.id === fee.department.id);

//       if (!dept) {
//         dept = {
//           id: fee.department.id,
//           name: fee.department.name,
//           doctors: [],
//         };
//         tree.push(dept);
//       }

//       let doc = dept.doctors.find((d) => d.id === fee.doctor.id);

//       if (!doc) {
//         doc = {
//           id: fee.doctor.id,
//           name: fee.doctor.name,
//           procedures: [],
//         };
//         dept.doctors.push(doc);
//       }

//       doc.procedures.push({
//         id: fee.procedure.id,
//         name: fee.procedure.name,
//         fee: Number(fee.procedurePrice) || 0,
//       });
//     });

//     return res.status(200).json({
//       success: true,
//       data: tree,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching non-OPD department tree:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

export const getOtherDepartmentDoctorProcedureTree = async (req, res) => {
  try {
    const excludedDepartments = ["X-Ray", "LAB", "Radiology", "Ultrasound","X-RAY"];

    const fees = await prisma.doctorProcedureFee.findMany({
      where: {
        status: true,
        department: {
          status: true,

          // ❗ Remove this line if you WANT to include OPD
          // type: { not: "OPD" },

          // ✅ Exclude specific departments
          name: {
            notIn: excludedDepartments,
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

    for (const fee of fees) {
      // सुरक्षा checks
      if (!fee.department || !fee.doctor || !fee.procedure) continue;
      if (!fee.doctor.status || !fee.procedure.status) continue;

      // 🔹 Department
      let dept = tree.find((d) => d.id === fee.department.id);
      if (!dept) {
        dept = {
          id: fee.department.id,
          name: fee.department.name,
          doctors: [],
        };
        tree.push(dept);
      }

      // 🔹 Doctor
      let doc = dept.doctors.find((d) => d.id === fee.doctor.id);
      if (!doc) {
        doc = {
          id: fee.doctor.id,
          name: fee.doctor.name,
          procedures: [],
        };
        dept.doctors.push(doc);
      }

      // 🔹 Procedure
      doc.procedures.push({
        id: fee.procedure.id,
        name: fee.procedure.name,
        fee: Number(fee.procedurePrice) || 0,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Filtered department-doctor-procedure tree fetched successfully",
      data: tree,
    });
  } catch (error) {
    console.error("❌ Error fetching department tree:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// export const bulkUploadDepartments = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Excel file is required",
//       });
//     }

//     // 📄 Read Excel
//     const workbook = XLSX.read(req.file.buffer);
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const rows = XLSX.utils.sheet_to_json(sheet);

//     if (!rows.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Excel file is empty",
//       });
//     }

//     const departmentsToCreate = [];
//     const skipped = [];

//     for (const row of rows) {
//       const name = row.name?.toString().trim();

//       if (!name) {
//         skipped.push({ row, reason: "Department name missing" });
//         continue;
//       }

//       // ✅ Normalize status
//       let status = true;
//       if (row.status !== undefined) {
//         const s = row.status.toString().toLowerCase();
//         status = ["active", "true", "1", "yes"].includes(s);
//       }

//       departmentsToCreate.push({
//         name,
//         shortCode: row.shortCode?.toString().trim() || null,
//         location: row.location?.toString().trim() || null,
//         description: row.description?.toString().trim() || null,
//         status,
//         timeFrom: row.timeFrom?.toString().trim() || null,
//         timeTo: row.timeTo?.toString().trim() || null,
//       });
//     }

//     if (!departmentsToCreate.length) {
//       return res.status(400).json({
//         success: false,
//         message: "No valid departments found in Excel",
//       });
//     }

//     // 🚀 Bulk insert
//     const result = await prisma.department.createMany({
//       data: departmentsToCreate,
//       skipDuplicates: true, // name & shortCode unique
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Departments uploaded successfully",
//       inserted: result.count,
//       skipped: skipped.length,
//       skippedRows: skipped,
//     });
//   } catch (error) {
//     console.error("bulkUploadDepartments error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to upload departments",
//     });
//   }
// };


export const bulkUploadDepartments = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
    }

    const workbook = XLSX.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty",
      });
    }

    const departmentsToCreate = [];
    const skipped = [];

    for (const row of rows) {
      const name = row.name?.toString().trim();

      if (!name) {
        skipped.push({ row, reason: "Department name missing" });
        continue;
      }

      let status = true;
      if (row.status !== undefined) {
        const s = row.status.toString().toLowerCase();
        status = ["active", "true", "1", "yes"].includes(s);
      }

      departmentsToCreate.push({
        name,
        type: "OPD", // ✅ Force OPD
        shortCode: row.shortCode?.toString().trim() || null,
        location: row.location?.toString().trim() || null,
        description: row.description?.toString().trim() || null,
        status,
        timeFrom: row.timeFrom?.toString().trim() || null,
        timeTo: row.timeTo?.toString().trim() || null,
      });
    }

    const result = await prisma.department.createMany({
      data: departmentsToCreate,
      skipDuplicates: true,
    });

    return res.status(201).json({
      success: true,
      message: "OPD Departments uploaded successfully",
      inserted: result.count,
      skipped: skipped.length,
      skippedRows: skipped,
    });

  } catch (error) {
    console.error("bulkUploadDepartments error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload departments",
    });
  }
};