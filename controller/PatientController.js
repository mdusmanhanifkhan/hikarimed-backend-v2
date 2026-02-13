import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.ts";
import xlsx from "xlsx";

// Constants
const NAME_MAX = 100;
const IDCARD_MAX = 20;
const PHONE_MAX = 20;
const ADDRESS_MAX = 255;

// Helper for structured error response
const sendError = (res, status, general_error, errors = {}) => {
  return res.status(status).json({ status, general_error, errors });
};

// Validation helper for Patient
const validatePatientInput = (patient) => {
  const errors = {};
  const missingFields = [];

  const requiredFields = ["name", "gender", "age"];
  requiredFields.forEach((field) => {
    if (!patient[field]) missingFields.push(field);
  });

  if (patient.name && patient.name.length > NAME_MAX)
    errors.name = `Name exceeds max length (${NAME_MAX})`;
  if (patient.cnicNumber && patient.cnicNumber.length > IDCARD_MAX)
    errors.cnicNumber = `CNIC exceeds max length (${IDCARD_MAX})`;
  if (patient.phoneNumber && patient.phoneNumber.length > PHONE_MAX)
    errors.phoneNumber = `Phone number exceeds max length (${PHONE_MAX})`;
  if (patient.address && patient.address.length > ADDRESS_MAX)
    errors.address = `Address exceeds max length (${ADDRESS_MAX})`;

  return { errors, missingFields };
};

export async function generateSequentialPatientId(tx) {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const prefix = Number(`${year}${month}00000`);
  const prefixEnd = Number(`${year}${month}99999`);

  const last = await tx.patient.findFirst({
    where: {
      patientId: {
        gte: prefix,
        lte: prefixEnd,
      },
    },
    orderBy: { patientId: "desc" },
    select: { patientId: true },
  });

  if (last && last.patientId >= prefixEnd) {
    throw new Error("Monthly patientId limit reached");
  }

  return last ? last.patientId + 1 : prefix + 1;
}

// ✅ Create patient
export const createPatient = async (req, res) => {
  try {
    const {
      name,
      guardianName,
      gender,
      age,
      maritalStatus,
      bloodGroup,
      phoneNumber,
      cnicNumber,
      address,
      createdByUserId,
      organizationId, // <-- new
    } = req.body;

    const { errors, missingFields } = validatePatientInput(req.body);
    if (missingFields.length > 0) {
      return sendError(
        res,
        400,
        `Validation failed: ${missingFields.join(", ")}`,
        errors,
      );
    }

    // Validate organization exists if provided
    if (organizationId) {
      const orgExists = await prisma.organization.findUnique({
        where: { id: Number(organizationId) },
      });
      if (!orgExists) return sendError(res, 400, "Invalid organizationId");
    }

    const patient = await prisma.$transaction(
      async (tx) => {
        const patientId = await generateSequentialPatientId(tx);

        return tx.patient.create({
          data: {
            patientId,
            name,
            guardianName,
            gender,
            age: Number(age),
            maritalStatus,
            bloodGroup,
            phoneNumber,
            cnicNumber,
            address,
            createdByUserId,
            organizationId: organizationId ? Number(organizationId) : null,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return res.status(201).json({
      status: 201,
      message: "Patient created successfully",
      data: patient,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return sendError(res, 409, "Patient ID conflict, please retry");
    }
    console.error(error);
    return sendError(res, 500, "Internal server error");
  }
};

// ✅ Create patient with backdate
export const createPatientBackDate = async (req, res) => {
  try {
    const {
      name,
      guardianName,
      gender,
      age,
      maritalStatus,
      bloodGroup,
      phoneNumber,
      cnicNumber,
      address,
      createdByUserId,
      createdAt,
      organizationId,
    } = req.body;

    const { errors, missingFields } = validatePatientInput(req.body);
    if (missingFields.length > 0) {
      return sendError(
        res,
        400,
        `Validation failed: ${missingFields.join(", ")}`,
        errors,
      );
    }

    if (organizationId) {
      const orgExists = await prisma.organization.findUnique({
        where: { id: Number(organizationId) },
      });
      if (!orgExists) return sendError(res, 400, "Invalid organizationId");
    }

    const patient = await prisma.$transaction(
      async (tx) => {
        const patientId = await generateSequentialPatientId(tx);

        return tx.patient.create({
          data: {
            patientId,
            name,
            guardianName,
            gender,
            age: Number(age),
            maritalStatus,
            bloodGroup,
            phoneNumber,
            cnicNumber,
            address,
            createdByUserId,
            createdAt,
            organizationId: organizationId ? Number(organizationId) : null,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return res.status(201).json({
      status: 201,
      message: "Patient created successfully",
      data: patient,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return sendError(res, 409, "Patient ID conflict, please retry");
    }
    console.error(error);
    return sendError(res, 500, "Internal server error");
  }
};

// ✅ Get all patients with organization info
export const getPatients = async (req, res) => {
  try {
    const { search } = req.query;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { guardianName: { contains: search, mode: "insensitive" } },
            { cnicNumber: { contains: search, mode: "insensitive" } },
            { phoneNumber: { contains: search, mode: "insensitive" } },
            { patientId: { equals: Number(search) || 0 } },
          ],
        }
      : {};

    const patients = await prisma.patient.findMany({
      where,
      include: {
        organization: true, // <-- include org
        welfareRecord: true,
      },
      orderBy: { patientId: "desc" },
    });

    if (!patients.length)
      return sendError(
        res,
        404,
        search ? `No patients match "${search}"` : "No patients found",
      );

    const today = new Date();
    const formatted = patients.map((p) => {
      const welfare = p.welfareRecord;
      const isActive =
        welfare &&
        (!welfare.startDate || new Date(welfare.startDate) <= today) &&
        (!welfare.endDate || new Date(welfare.endDate) >= today);

      return {
        ...p,
        isWelfare: !!welfare,
        welfareCategory: welfare?.welfareCategory || null,
        discountType: welfare?.discountType || null,
        discountApplicable: isActive ? welfare.discountPercentage : 0,
        discountStatus: isActive ? "Active" : welfare ? "Expired" : "None",
        organization: p.organization || null,
      };
    });

    return res.status(200).json({
      status: 200,
      message: "Patients retrieved successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return sendError(res, 500, "Internal server error");
  }
};

// ✅ Get patient by ID
export const getPatientById = async (req, res) => {
  try {
    const patientId = Number(req.params.id);
    if (isNaN(patientId)) return sendError(res, 400, "Invalid patient ID");

    const patient = await prisma.patient.findUnique({
      where: { patientId },
      include: { welfareRecord: true, organization: true },
    });

    if (!patient) return sendError(res, 404, "Patient not found");

    const today = new Date();
    const welfare = patient.welfareRecord;
    const isActive =
      welfare &&
      (!welfare.startDate || new Date(welfare.startDate) <= today) &&
      (!welfare.endDate || new Date(welfare.endDate) >= today);

    return res.status(200).json({
      status: 200,
      message: "Patient retrieved successfully",
      data: {
        ...patient,
        isWelfare: !!welfare,
        welfareCategory: welfare?.welfareCategory || null,
        discountType: welfare?.discountType || null,
        discountApplicable: isActive ? welfare.discountPercentage : 0,
        discountStatus: isActive ? "Active" : welfare ? "Expired" : "None",
      },
    });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return sendError(res, 500, "Internal server error");
  }
};

// ✅ Update patient (include org)
export const updatePatient = async (req, res) => {
  try {
    const patientId = Number(req.params.id);
    if (isNaN(patientId)) return sendError(res, 400, "Invalid patient ID");

    const {
      name,
      guardianName,
      gender,
      age,
      maritalStatus,
      bloodGroup,
      phoneNumber,
      cnicNumber,
      address,
      organizationId,
    } = req.body;

    const { errors } = validatePatientInput(req.body);
    if (Object.keys(errors).length > 0)
      return sendError(res, 400, "Validation failed", errors);

    // Validate org if provided
    if (organizationId) {
      const orgExists = await prisma.organization.findUnique({
        where: { id: Number(organizationId) },
      });
      if (!orgExists) return sendError(res, 400, "Invalid organizationId");
    }

    const updatedPatient = await prisma.patient.update({
      where: { patientId },
      data: {
        name,
        guardianName,
        gender,
        age: Number(age),
        maritalStatus,
        bloodGroup,
        phoneNumber,
        cnicNumber,
        address,
        organizationId: organizationId ? Number(organizationId) : null,
      },
    });

    return res.status(200).json({
      status: 200,
      message: "Patient updated successfully",
      data: updatedPatient,
    });
  } catch (error) {
    console.error("Error updating patient:", error);
    return sendError(res, 500, "Internal server error");
  }
};

// ✅ Delete patient
export const deletePatient = async (req, res) => {
  try {
    const patientId = Number(req.params.id);
    if (isNaN(patientId)) return sendError(res, 400, "Invalid patient ID");

    await prisma.patient.delete({ where: { patientId } });

    return res
      .status(200)
      .json({ status: 200, message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return sendError(res, 500, "Internal server error");
  }
};

// ✅ Search patients (include org)
export const searchPatients = async (req, res) => {
  try {
    const { name, patientId, cnic, phone, page, limit } = req.query;

    const currentPage = page && Number(page) > 0 ? Number(page) : 1;
    const pageSize = limit && Number(limit) > 0 ? Number(limit) : 20;
    const skip = (currentPage - 1) * pageSize;

    const filters = { OR: [] };
    if (name)
      filters.OR.push({ name: { contains: name, mode: "insensitive" } });
    if (patientId && !isNaN(Number(patientId)))
      filters.OR.push({ patientId: Number(patientId) });
    if (cnic)
      filters.OR.push({ cnicNumber: { contains: cnic, mode: "insensitive" } });
    if (phone)
      filters.OR.push({
        phoneNumber: { contains: phone, mode: "insensitive" },
      });

    const whereCondition = filters.OR.length ? filters : undefined;

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where: whereCondition,
        include: { welfareRecord: true, organization: true },
        skip,
        take: pageSize,
        orderBy: { patientId: "desc" },
      }),
      prisma.patient.count({ where: whereCondition }),
    ]);

    const today = new Date();
    const formatted = patients.map((p) => {
      const welfare = p.welfareRecord;
      const isActive =
        welfare &&
        (!welfare.startDate || new Date(welfare.startDate) <= today) &&
        (!welfare.endDate || new Date(welfare.endDate) >= today);

      return {
        ...p,
        isWelfare: !!welfare,
        welfareCategory: welfare ? welfare.welfareCategory : null,
        discountType: welfare ? welfare.discountType : null,
        discountApplicable: isActive ? welfare.discountPercentage : 0,
        discountStatus: isActive ? "Active" : welfare ? "Expired" : "None",
        organization: p.organization || null,
      };
    });

    return res.status(200).json({
      status: 200,
      message: formatted.length
        ? "Patients found successfully"
        : "No patients found",
      data: formatted,
      pagination: {
        total,
        page: currentPage,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasMore: skip + formatted.length < total,
      },
    });
  } catch (error) {
    console.error("Error searching patients:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

export const searchPatientsByInput = async (req, res) => {
  try {
    const { query } = req.query; 

    if (!query) {
      return res.status(400).json({
        status: 400,
        message: "Please provide MRID or Name to search",
      });
    }

    let whereCondition;

    if (!isNaN(Number(query))) {
      // ✅ Exact MRID search
      whereCondition = { patientId: Number(query) };
    } else {
      // ✅ Name search (case-insensitive, partial match)
      whereCondition = {
        name: { contains: query, mode: "insensitive" },
      };
    }

    const patients = await prisma.patient.findMany({
      where: whereCondition,
      include: { welfareRecord: true, organization: true },
      orderBy: { patientId: "desc" },
    });

    const today = new Date();
    const formatted = patients.map((p) => {
      const welfare = p.welfareRecord;
      const isActive =
        welfare &&
        (!welfare.startDate || new Date(welfare.startDate) <= today) &&
        (!welfare.endDate || new Date(welfare.endDate) >= today);

      return {
        ...p,
        isWelfare: !!welfare,
        welfareCategory: welfare ? welfare.welfareCategory : null,
        discountType: welfare ? welfare.discountType : null,
        discountApplicable: isActive ? welfare.discountPercentage : 0,
        discountStatus: isActive ? "Active" : welfare ? "Expired" : "None",
        organization: p.organization || null,
      };
    });

    return res.status(200).json({
      status: 200,
      message: formatted.length
        ? "Patients found successfully"
        : "No patients found",
      data: formatted,
    });
  } catch (error) {
    console.error("Error searching patients:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};


export const bulkUploadPatients = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
    }

    const userId = req.user?.id || null;

    // 📄 Read excel
    const workbook = xlsx.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = xlsx.utils.sheet_to_json(sheet);
    console.log(rows);
    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty",
      });
    }

    // 🔍 Get last patientId
    const lastPatient = await prisma.patient.findFirst({
      orderBy: { patientId: "desc" },
      select: { patientId: true },
    });

    let nextPatientId = lastPatient ? lastPatient.patientId + 1 : 1;

    const patientsToCreate = [];
    const skipped = [];

    for (const row of rows) {
      // ❌ Required validation
      if (!row.name || !row.phoneNumber) {
        skipped.push({ row, reason: "Name or phone missing" });
        continue;
      }

      const patientId = row.patientId ? Number(row.patientId) : nextPatientId++;
      console.log(row);
      patientsToCreate.push({
        patientId,
        name: String(row.name),
        guardianName: String(row.guardianName || ""),
        gender: String(row.gender || ""),
        age: Number(row.age || 0),
        maritalStatus: String(row.maritalStatus || ""),
        bloodGroup: String(row.bloodGroup || ""),
        cnicNumber: String(row.cnicNumber || ""),
        phoneNumber: String(row.phoneNumber),
        address: String(row.address || ""),
        createdByUserId: userId,
      });
    }

    if (!patientsToCreate.length) {
      return res.status(400).json({
        success: false,
        message: "No valid patients found in Excel",
      });
    }

    // 🚀 Bulk insert (skip duplicates)
    const result = await prisma.patient.createMany({
      data: patientsToCreate,
      skipDuplicates: true,
    });

    return res.status(201).json({
      success: true,
      message: "Patients uploaded successfully",
      inserted: result.count,
      skipped: skipped.length,
      skippedRows: skipped,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
