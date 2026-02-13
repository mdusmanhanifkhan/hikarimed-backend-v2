import XLSX from "xlsx";
import { buildPaginationResponse, getPagination } from "../utils/pagination.js";

import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.ts";

export const createMedicalRecord = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not found",
      });
    }

    const { patientId, discount = 0, notes, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one medical record item is required",
      });
    }

    const patient = await prisma.patient.findUnique({
      where: { patientId: Number(patientId) },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: `Patient with id ${patientId} not found`,
      });
    }

    const medicalRecord = await prisma.$transaction(async (tx) => {

      /* =====================================
         1️⃣ RECEIPT NUMBER (YYMM0001)
      ====================================== */

      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const prefix = `${year}${month}`;

      const receiptCounter = await tx.receiptCounter.upsert({
        where: { prefix },
        update: { lastValue: { increment: 1 } },
        create: { prefix, lastValue: 1 },
      });

      const receiptNo = `${prefix}${String(
        receiptCounter.lastValue
      ).padStart(4, "0")}`;


      /* =====================================
         2️⃣ DOCTOR TOKEN (Per Doctor / Per Day)
      ====================================== */

      // Take first doctor from items
      const firstDoctorItem = items.find((i) => i.doctorId);
      const doctorId = firstDoctorItem
        ? Number(firstDoctorItem.doctorId)
        : null;

      let tokenNumber = null;
      let tokenDate = null;

      if (doctorId) {

        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize date

        const tokenCounter = await tx.doctorTokenCounter.upsert({
          where: {
            doctorId_tokenDate: {
              doctorId,
              tokenDate: today,
            },
          },
          update: {
            lastValue: { increment: 1 },
          },
          create: {
            doctorId,
            tokenDate: today,
            lastValue: 1,
          },
        });

        tokenNumber = tokenCounter.lastValue;
        tokenDate = today;
      }


      /* =====================================
         3️⃣ PREPARE ITEMS
      ====================================== */

      const preparedItems = items.map((item) => {
        const fee = new Prisma.Decimal(item.fee || 0);
        const itemDiscount = Number(item.discount || 0);

        return {
          fee,
          discount: itemDiscount,
          finalFee: fee.minus(itemDiscount),
          notes: item.notes || null,
          department: { connect: { id: Number(item.departmentId) } },
          procedure: { connect: { id: Number(item.procedureId) } },
          doctor: item.doctorId
            ? { connect: { id: Number(item.doctorId) } }
            : undefined,
        };
      });

      const totalFee = preparedItems.reduce(
        (sum, i) => sum.plus(i.fee),
        new Prisma.Decimal(0)
      );

      const finalFee = preparedItems
        .reduce((sum, i) => sum.plus(i.finalFee), new Prisma.Decimal(0))
        .minus(discount);


      /* =====================================
         4️⃣ CREATE RECORD
      ====================================== */

      return tx.medicalRecord.create({
        data: {
          patientId: patient.id,
          receiptNo,
          doctorId,
          tokenNumber,
          tokenDate,
          totalFee,
          discount: Number(discount),
          finalFee,
          notes: notes || null,
          userId,
          items: {
            create: preparedItems,
          },
        },
        include: {
          patient: true,
          items: {
            include: {
              department: true,
              doctor: true,
              procedure: true,
            },
          },
        },
      });
    });

    return res.status(201).json({
      success: true,
      data: medicalRecord,
    });

  } catch (error) {
    console.error("createMedicalRecord error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// export const createMedicalRecordPatients = async (req, res) => {
//   try {
//     const userId = req.user?.id;

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized: user not found",
//       });
//     }

//     const { patientId, recordDate, discount = 0, notes, items } = req.body;

//     if (!items || !Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one medical record item is required",
//       });
//     }

//     let finalRecordDate = new Date();
//     if (recordDate) {
//       const parsedDate = new Date(recordDate);
//       if (isNaN(parsedDate.getTime())) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid recordDate format",
//         });
//       }
//       finalRecordDate = parsedDate;
//     }

//     const patient = await prisma.patient.findUnique({
//       where: { patientId: Number(patientId) },
//     });

//     if (!patient) {
//       return res.status(404).json({
//         success: false,
//         message: `Patient with id ${patientId} not found`,
//       });
//     }

//     // 🔥 TRANSACTION START
//     const medicalRecord = await prisma.$transaction(async (tx) => {
//       /* ==============================
//          1️⃣ GENERATE RECEIPT NUMBER
//       =============================== */

//       const now = new Date();
//       const year = now.getFullYear().toString().slice(-2);
//       const month = String(now.getMonth() + 1).padStart(2, "0");
//       const prefix = `${year}${month}`; // e.g. 2602

//       const receiptCounter = await tx.receiptCounter.upsert({
//         where: { prefix },
//         update: { lastValue: { increment: 1 } },
//         create: { prefix, lastValue: 1 },
//       });

//       const receiptNo = `${prefix}${String(receiptCounter.lastValue).padStart(
//         4,
//         "0",
//       )}`;

//       /* ==============================
//          2️⃣ GENERATE DOCTOR TOKEN
//       =============================== */

//       let doctorId = null;

//       // Take first doctor from items (if exists)
//       const firstDoctorItem = items.find((i) => i.doctorId);
//       if (firstDoctorItem) {
//         doctorId = Number(firstDoctorItem.doctorId);
//       }

//       let tokenNumber = null;
//       let tokenDate = null;

//       if (doctorId) {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0); // normalize date

//         const tokenCounter = await tx.doctorTokenCounter.upsert({
//           where: {
//             doctorId_tokenDate: {
//               doctorId,
//               tokenDate: today,
//             },
//           },
//           update: {
//             lastValue: { increment: 1 },
//           },
//           create: {
//             doctorId,
//             tokenDate: today,
//             lastValue: 1,
//           },
//         });

//         tokenNumber = tokenCounter.lastValue;
//         tokenDate = today;
//       }

//       /* ==============================
//          3️⃣ PREPARE ITEMS
//       =============================== */

//       const preparedItems = items.map((item) => {
//         const fee = Number(item.fee || 0);
//         const itemDiscount = Number(item.discount || 0);

//         return {
//           fee,
//           discount: itemDiscount,
//           finalFee: fee - itemDiscount,
//           notes: item.notes || null,
//           department: { connect: { id: Number(item.departmentId) } },
//           procedure: { connect: { id: Number(item.procedureId) } },
//           doctor: item.doctorId
//             ? { connect: { id: Number(item.doctorId) } }
//             : undefined,
//         };
//       });

//       const totalFee = preparedItems.reduce((sum, i) => sum + i.fee, 0);
//       const itemsFinalFee = preparedItems.reduce(
//         (sum, i) => sum + i.finalFee,
//         0,
//       );

//       const finalFee = itemsFinalFee - Number(discount);

//       /* ==============================
//          4️⃣ CREATE MEDICAL RECORD
//       =============================== */

//       const createdRecord = await tx.medicalRecord.create({
//         data: {
//           patientId: patient.id,
//           receiptNo,
//           tokenNumber,
//           tokenDate,
//           doctorId,
//           recordDate: finalRecordDate,
//           totalFee,
//           discount: Number(discount),
//           finalFee,
//           notes: notes || null,
//           userId,
//           items: {
//             create: preparedItems,
//           },
//         },
//         include: {
//           patient: true,
//           items: {
//             include: {
//               department: true,
//               doctor: true,
//               procedure: true,
//             },
//           },
//         },
//       });

//       return createdRecord;
//     });

//     return res.status(201).json({
//       success: true,
//       data: medicalRecord,
//     });
//   } catch (error) {
//     console.error("createMedicalRecordPatients error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Server error",
//     });
//   }
// };

export const getMedicalRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { patientId: Number(patientId) },
      include: {
        MedicalRecord: {
          orderBy: { recordDate: "desc" },

          select: {
            totalFee: true,
            discount: true,
            finalFee: true,
            tokenNumber: true,
            notes: true,
            createdAt: true,
            recordDate: true,

            user: { select: { id: true, name: true } },
            items: {
              select: {
                fee: true,
                finalFee: true,
                discount: true,
                notes: true,
                department: { select: { id: true, name: true } },
                doctor: { select: { id: true, name: true } },
                procedure: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: `Patient with id ${patientId} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      patient: {
        ...patient,
        totalVisits: patient.MedicalRecord.length,
      },
    });
  } catch (error) {
    console.error("getMedicalRecordsByPatient error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const getMedicalRecords = async (req, res) => {
  try {
    const { search, name } = req.query;

    const { page, limit, skip } = getPagination(req.query);

    const where = {
      MedicalRecord: { some: {} },
    };

    if (search) where.patientId = Number(search);
    if (name) where.name = { contains: name, mode: "insensitive" };

    const totalPatients = await prisma.patient.count({ where });

    const patientsWithVisits = await prisma.patient.findMany({
      where,
      select: {
        id: true,
        patientId: true,
        name: true,
        guardianName: true,
        gender: true,
        age: true,
        cnicNumber: true,
        phoneNumber: true,
        MedicalRecord: {
          select: {
            id: true,
            recordDate: true,
            totalFee: true,
            discount: true,
            finalFee: true,
            tokenNumber: true,
            notes: true,
          },
          orderBy: { recordDate: "desc" },
        },
      },
      orderBy: { patientId: "desc" },
      skip,
      take: limit,
    });

    const data = patientsWithVisits.map((p) => ({
      ...p,
      totalVisits: p.MedicalRecord.length,
    }));

    const pagination = buildPaginationResponse(
      totalPatients,
      page,
      limit,
      data.length,
    );

    res.status(200).json({
      success: true,
      ...pagination,
      data,
    });
  } catch (err) {
    console.error("getMedicalRecords error:", err);
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

export const exportMedicalRecordsExcel = async (req, res) => {
  try {
    const { from, to } = req.query;

    const where = {};
    if (from && to) {
      where.recordDate = {
        gte: new Date(from),
        lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
      };
    }

    // ✅ Fetch medical records
    const records = await prisma.medicalRecord.findMany({
      where,
      include: {
        patient: true,
        user: true, // receptionist / creator
        items: {
          include: {
            department: true,
            doctor: true,
            procedure: true,
          },
        },
      },
      orderBy: { recordDate: "asc" },
    });

    // ✅ Flatten data for Excel
    const rows = [];

    records.forEach((record) => {
      // If record has no items, still export one row
      if (record.items.length === 0) {
        rows.push({
          Date: record.recordDate.toISOString().split("T")[0],
          PatientID: record.patient.patientId,
          PatientName: record.patient.name,
          Department: record.department?.name || "",
          Doctor: record.doctor?.name || "",
          Procedure: record.procedure?.name || "",
          Fee: Number(record.totalFee),
          Discount: Number(record.discount),
          FinalFee: Number(record.finalFee),
          CreatedBy: record.user?.name || "",
        });
      }

      // If record has items
      record.items.forEach((item) => {
        rows.push({
          Date: record.recordDate.toISOString().split("T")[0],
          PatientID: record.patient.patientId,
          PatientName: record.patient.name,
          Department: item.department?.name || "",
          Doctor: item.doctor?.name || "",
          Procedure: item.procedure?.name || "",
          Fee: Number(item.fee),
          Discount: Number(item.discount),
          FinalFee: Number(item.finalFee),
          CreatedBy: record.user?.name || "",
        });
      });
    });

    // ✅ Create Excel
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Medical Records");

    // ✅ Response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=medical-records.xlsx`,
    );

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return res.send(buffer);
  } catch (error) {
    console.error("exportMedicalRecordsExcel error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// export const bulkUploadMedicalRecords = async (req, res) => {
//   try {
//     if (!req.file || !req.file.buffer) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     let inserted = 0;
//     let skipped = 0;

//     for (let i = 0; i < rows.length; i++) {
//       const row = rows[i];

//       try {
//         // Validate required fields
//         if (!row.patientId || !row.userId) {
//           console.warn(`Row ${i + 1} skipped: missing required fields`);
//           skipped++;
//           continue;
//         }

//         // Create medical record
//         await prisma.medicalRecord.create({
//           data: {
//             id: Number(row.id),
//             patientId: Number(row.patientId),
//             recordDate: row.recordDate ? new Date(row.recordDate) : new Date(),
//             totalFee: row.totalFee ?? 0,
//             discount: row.discount ?? 0,
//             finalFee: row.finalFee ?? 0,
//             notes: row.notes ?? "",
//             createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
//             userId: Number(row.userId),
//             departmentId: row.departmentId ? Number(row.departmentId) : null,
//             procedureId: row.procedureId ? Number(row.procedureId) : null,
//             doctorId: row.doctorId ? Number(row.doctorId) : null,
//             tokenDate: row.tokenDate ? new Date(row.tokenDate) : null,
//             tokenNumber: row.tokenNumber ?? null,
//           },
//         });

//         inserted++;
//       } catch (err) {
//         console.error(`Row ${i + 1} failed:`, err.message);
//         skipped++;
//       }
//     }

//     res.status(200).json({
//       message: "Bulk upload completed",
//       inserted,
//       skipped,
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// };

// ===== Helpers (MUST be above controller) =====

const parseExcelDate = (value) => {
  if (!value) return null;

  // Excel serial date (number)
  if (typeof value === "number") {
    return new Date(Math.round((value - 25569) * 86400 * 1000));
  }

  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

const parseOptionalInt = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

export const bulkUploadMedicalRecords = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      defval: null,
      raw: false,
    });

    let inserted = 0;
    const skipped = [];

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];

      try {
        if (!raw.patientId) {
          skipped.push({ row: i + 1, reason: "patientId missing" });
          continue;
        }

        const tokenDate = parseExcelDate(raw.tokenDate);
        const tokenNumber = parseOptionalInt(raw.tokenNumber);

        await prisma.medicalRecord.create({
          data: {
            patientId: Number(raw.patientId),

            tokenDate,
            tokenNumber,

            recordDate: parseExcelDate(raw.recordDate) || new Date(),

            totalFee: Number(raw.totalFee || 0),
            discount: Number(raw.discount || 0),
            finalFee: Number(raw.finalFee || 0),

            notes: raw.notes || null,
            createdAt: raw.createdAt || null,
            userId: Number(raw.userId || userId),

            departmentId: parseOptionalInt(raw.departmentId),
            procedureId: parseOptionalInt(raw.procedureId),
            doctorId: parseOptionalInt(raw.doctorId),
          },
        });

        inserted++;
      } catch (err) {
        skipped.push({
          row: i + 1,
          reason: err.message,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Medical records uploaded successfully",
      inserted,
      skipped: skipped.length,
      skippedRows: skipped,
    });
  } catch (error) {
    console.error("Bulk upload medical records error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
