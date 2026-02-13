import { prisma } from "../lib/prisma.js";

// Constants
const NAME_MAX = 100;
const IDCARD_MAX = 20;
const PHONE_MAX = 20;
const EMAIL_MAX = 100;
const ADDRESS_MAX = 255;
const SPECIALIZATION_MAX = 100;
const QUALIFICATION_MAX = 100;
const SUBSPEC_MAX = 100;
const LANGUAGES_MAX = 100;
const AVAILABLE_DAYS_MAX = 50;
const TIMING_MAX = 10;

// Helper for structured error response
const sendError = (res, status, general_error, errors = {}) => {
  return res.status(status).json({ status, general_error, errors });
};

// Validation helper for doctor
const validateDoctorInput = (doctor) => {
  const errors = {};
  const missingFields = [];

  const requiredFields = [
    "name",
    "gender",
    "age",
    "idCard",
    "phoneNumber",
    "email",
    "joinDate",
    "employmentType",
    "maxPatients",
  ];
  requiredFields.forEach((field) => {
    if (!doctor[field]) missingFields.push(field);
  });

  if (doctor.name && doctor.name.length > NAME_MAX)
    errors.name = `Name exceeds max length (${NAME_MAX})`;
  if (doctor.idCard && doctor.idCard.length > IDCARD_MAX)
    errors.idCard = `ID Card exceeds max length (${IDCARD_MAX})`;
  if (doctor.phoneNumber && doctor.phoneNumber.length > PHONE_MAX)
    errors.phoneNumber = `Phone number exceeds max length (${PHONE_MAX})`;
  if (doctor.email && doctor.email.length > EMAIL_MAX)
    errors.email = `Email exceeds max length (${EMAIL_MAX})`;
  if (doctor.address && doctor.address.length > ADDRESS_MAX)
    errors.address = `Address exceeds max length (${ADDRESS_MAX})`;
  if (
    doctor.specialization &&
    doctor.specialization.length > SPECIALIZATION_MAX
  )
    errors.specialization = `Specialization exceeds max length (${SPECIALIZATION_MAX})`;
  if (doctor.qualification && doctor.qualification.length > QUALIFICATION_MAX)
    errors.qualification = `Qualification exceeds max length (${QUALIFICATION_MAX})`;
  if (doctor.subSpecialities && doctor.subSpecialities.length > SUBSPEC_MAX)
    errors.subSpecialities = `SubSpecialities exceeds max length (${SUBSPEC_MAX})`;
  if (doctor.languages && doctor.languages.length > LANGUAGES_MAX)
    errors.languages = `Languages exceeds max length (${LANGUAGES_MAX})`;
  if (doctor.availableDays && doctor.availableDays.length > AVAILABLE_DAYS_MAX)
    errors.availableDays = `Available days exceeds max length (${AVAILABLE_DAYS_MAX})`;
  if (doctor.timingFrom && doctor.timingFrom.length > TIMING_MAX)
    errors.timingFrom = `TimingFrom exceeds max length (${TIMING_MAX})`;
  if (doctor.timingTo && doctor.timingTo.length > TIMING_MAX)
    errors.timingTo = `TimingTo exceeds max length (${TIMING_MAX})`;

  return { errors, missingFields };
};

// Create Doctor
export const createDoctor = async (req, res) => {
  try {
    const {
      name,
      guardianName,
      gender,
      dateOfBirth,
      age,
      idCard,
      phoneNumber,
      email,
      address,
      specialization,
      qualification,
      subSpecialities,
      experience,
      languages,
      joinDate,
      employmentType,
      availableDays,
      timingFrom,
      timingTo,
      shiftType,
      maxPatients,
      departmentIds,
    } = req.body;

    const { errors, missingFields } = validateDoctorInput(req.body);
    if (missingFields.length > 0)
      return sendError(
        res,
        400,
        `Validation failed: ${missingFields.join(", ")} ${
          missingFields.length > 1 ? "are required" : "is required"
        }`,
        errors,
      );

    const existing = await prisma.doctor.findFirst({
      where: { OR: [{ idCard }, { phoneNumber }, { email }] },
    });
    if (existing) {
      const dupErrors = {};
      if (existing.idCard === idCard)
        dupErrors.idCard = "ID Card already exists";
      if (existing.phoneNumber === phoneNumber)
        dupErrors.phoneNumber = "Phone number already exists";
      if (existing.email === email) dupErrors.email = "Email already exists";
      return sendError(res, 409, "Duplicate doctor", dupErrors);
    }

    // Create doctor
    const doctor = await prisma.doctor.create({
      data: {
        name,
        guardianName,
        gender,
        dateOfBirth,
        age,
        idCard,
        phoneNumber,
        email,
        address,
        specialization,
        qualification,
        subSpecialities,
        experience,
        languages,
        joinDate,
        employmentType,
        availableDays,
        timingFrom,
        timingTo,
        shiftType,
        maxPatients,
        departmentLinks: departmentIds?.length
          ? {
              create: departmentIds.map((deptId) => ({
                departmentId: Number(deptId),
              })),
            }
          : undefined,
      },
      include: { departmentLinks: true },
    });

    return res.status(201).json({
      status: 201,
      message: "Doctor created successfully",
      data: doctor,
    });
  } catch (error) {
    return sendError(
      res,
      500,
      "An internal server error occurred while creating the doctor.",
    );
  }
};

// Get all doctors with optional search
export const getDoctors = async (req, res) => {
  try {
    const { search } = req.query;

    // Only active doctors
    const where = {
      status: true, // ✅ Only active
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { specialization: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        departmentLinks: { include: { department: true } },
        feeLinks: { include: { feePolicy: true, procedure: true } },
      },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      status: 200,
      message: doctors.length
        ? "Doctors retrieved successfully"
        : search
          ? `No doctors match "${search}"`
          : "No doctors found",
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    return sendError(
      res,
      500,
      "Failed to retrieve doctors due to a server error.",
    );
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const { search } = req.query;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { specialization: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        departmentLinks: { include: { department: true } },
        feeLinks: { include: { feePolicy: true, procedure: true } },
      },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      status: 200,
      message: doctors.length
        ? "Doctors retrieved successfully"
        : search
          ? `No doctors match "${search}"`
          : "No doctors found",
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    return sendError(
      res,
      500,
      "Failed to retrieve doctors due to a server error.",
    );
  }
};

// Get single doctor
export const getDoctorById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) return sendError(res, 400, "Invalid doctor ID");

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        departmentLinks: { include: { department: true } },
        feeLinks: { include: { feePolicy: true, procedure: true } },
      },
    });
    if (!doctor) return sendError(res, 404, "Doctor not found");

    return res.status(200).json({
      status: 200,
      message: "Doctor retrieved successfully",
      data: doctor,
    });
  } catch (error) {
    return sendError(res, 500, "Internal server error");
  }
};

// Update doctor
export const updateDoctor = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return sendError(res, 400, "Invalid doctor ID");

    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) return sendError(res, 404, "Doctor not found");

    const {
      status,
      name,
      gender,
      age,
      idCard,
      phoneNumber,
      email,
      address,
      specialization,
      qualification,
      subSpecialities,
      experience,
      languages,
      joinDate,
      employmentType,
      availableDays,
      timingFrom,
      timingTo,
      shiftType,
      maxPatients,
      departmentIds,
    } = req.body;

    const { errors } = validateDoctorInput(req.body);
    if (Object.keys(errors).length > 0)
      return sendError(res, 400, "Validation failed", errors);

    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        status,
        name,
        gender,
        age,
        idCard,
        phoneNumber,
        email,
        address,
        specialization,
        qualification,
        subSpecialities,
        experience,
        languages,
        joinDate,
        employmentType,
        availableDays,
        timingFrom,
        timingTo,
        shiftType,
        maxPatients,
        departmentLinks: departmentIds?.length
          ? {
              deleteMany: {},
              create: departmentIds.map((deptId) => ({
                departmentId: Number(deptId),
              })),
            }
          : undefined,
      },
      include: { departmentLinks: true },
    });

    return res.status(200).json({
      status: 200,
      message: "Doctor updated successfully",
      data: updatedDoctor,
    });
  } catch (error) {
    return sendError(
      res,
      500,
      "An internal server error occurred while updating the doctor.",
    );
  }
};

// Delete doctor
export const deleteDoctor = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return sendError(res, 400, "Invalid doctor ID");

    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) return sendError(res, 404, "Doctor not found");

    await prisma.doctor.delete({ where: { id } });

    return res
      .status(200)
      .json({ status: 200, message: "Doctor deleted successfully" });
  } catch (error) {
    return sendError(
      res,
      500,
      "An internal server error occurred while deleting the doctor.",
    );
  }
};

import XLSX from "xlsx";

export const bulkUploadDoctors = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
    }

    const workbook = XLSX.read(req.file.buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty",
      });
    }

    const doctorsToCreate = [];
    const skipped = [];

    for (const row of rows) {
      const name = row.name?.toString().trim();
      const idCard = row.idCard?.toString().trim();
      const phoneNumber = row.phoneNumber?.toString().trim();
      const email = row.email?.toString().trim();

      if (!name || !idCard || !phoneNumber || !email) {
        skipped.push({
          row,
          reason: "Name, IDCard, Phone or Email missing",
        });
        continue;
      }

      // ✅ Normalize status
      let status = true;
      if (row.status !== undefined) {
        const s = row.status.toString().toLowerCase();
        status = ["active", "true", "1", "yes"].includes(s);
      }

      doctorsToCreate.push({
        id: row.id,
        name,
        guardianName: row.guardianName?.toString() || null,
        gender: row.gender?.toString() || null,
        age: Number(row.age || 0),
        idCard,
        phoneNumber,
        email,
        address: row.address?.toString() || null,
        specialization: row.specialization?.toString() || null,
        qualification: row.qualification?.toString() || null,
        subSpecialities: row.subSpecialities?.toString() || null,
        experience: Number(row.experience || 0),
        languages: row.languages?.toString() || null,
        joinDate: row.joinDate?.toString() || null,
        employmentType: row.employmentType?.toString() || null,
        shiftType: row.shiftType?.toString() || null,
        timingFrom: row.timingFrom?.toString() || null,
        timingTo: row.timingTo?.toString() || null,
        availableDays: row.availableDays
          ? row.availableDays
              .toString()
              .split(",")
              .map((d) => d.trim())
          : [],
        maxPatients: Number(row.maxPatients || 0),
        status,
      });
    }

    if (!doctorsToCreate.length) {
      return res.status(400).json({
        success: false,
        message: "No valid doctors found in Excel",
      });
    }

    const result = await prisma.doctor.createMany({
      data: doctorsToCreate,
      skipDuplicates: true, // idCard, phoneNumber, email
    });

    return res.status(201).json({
      success: true,
      message: "Doctors uploaded successfully",
      inserted: result.count,
      skipped: skipped.length,
      skippedRows: skipped,
    });
  } catch (error) {
    console.error("bulkUploadDoctors error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload doctors",
    });
  }
};
