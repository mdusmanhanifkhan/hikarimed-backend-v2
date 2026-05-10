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

      const receiptNo = `${prefix}${String(receiptCounter.lastValue).padStart(
        4,
        "0",
      )}`;

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
        const now = new Date();

        // ✅ Always normalize in UTC
        const tokenDateUTC = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
        );

        const tokenCounter = await tx.doctorTokenCounter.upsert({
          where: {
            doctorId_tokenDate: {
              doctorId,
              tokenDate: tokenDateUTC,
            },
          },
          update: {
            lastValue: { increment: 1 },
          },
          create: {
            doctorId,
            tokenDate: tokenDateUTC,
            lastValue: 1,
          },
        });

        tokenNumber = tokenCounter.lastValue;
        tokenDate = tokenDateUTC;
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
        new Prisma.Decimal(0),
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

    // Fetch medical records
    const records = await prisma.medicalRecord.findMany({
      where,
      include: {
        patient: true,
        user: true,
        items: {
          include: {
            department: true,
            doctor: true,
            procedure: true,
          },
        },
        // Include these to fetch names even when items are empty
        department: true,
        doctor: true,
        procedure: true,
      },
      orderBy: { recordDate: "asc" },
    });

    const rows = [];

    records.forEach((record) => {
      if (!record.items || record.items.length === 0) {
        // Use top-level department/doctor/procedure if items are empty
        rows.push({
          Date: record.recordDate.toISOString().split("T")[0],
          PatientID: record.patient?.patientId || "",
          PatientName: record.patient?.name || "",
          Gender: record.patient.gender || "",
          Age: record.patient.age || "",
          Department: record.department?.name || "",
          Doctor: record.doctor?.name || "",
          Procedure: record.procedure?.name || "",
          Fee: Number(record.totalFee || 0),
          Discount: Number(record.discount || 0),
          FinalFee: Number(record.finalFee || 0),
          CreatedBy: record.user?.name || "",
        });
      } else {
        record.items.forEach((item) => {
          rows.push({
            Date: record.recordDate.toISOString().split("T")[0],
            PatientID: record.patient?.patientId || "",
            PatientName: record.patient?.name || "",
            Department: item.department?.name || "",
            Doctor: item.doctor?.name || "",
            Procedure: item.procedure?.name || "",
            Fee: Number(item.fee || 0),
            Discount: Number(item.discount || 0),
            FinalFee: Number(item.finalFee || 0),
            CreatedBy: record.user?.name || "",
          });
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Medical Records");

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

export const bulkUploadMedicalRecords = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: "Excel file is required" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let inserted = 0;
    const skipped = [];

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];

      try {
        if (!raw.patientId) {
          skipped.push({ row: i + 1, reason: "patientId missing" });
          continue;
        }

        const tokenDate = raw.tokenDate ? new Date(raw.tokenDate) : null;

        const medicalRecord = await prisma.medicalRecord.create({
          data: {
            patientId: Number(raw.patientId),
            recordDate: raw.recordDate ? new Date(raw.recordDate) : new Date(),
            totalFee: Number(raw.totalFee || 0),
            discount: Number(raw.discount || 0),
            finalFee: Number(raw.finalFee || 0),
            notes: raw.notes || null,
            createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
            userId: Number(raw.userId || userId),
            tokenDate,
            tokenNumber: raw.tokenNumber ? Number(raw.tokenNumber) : null,
            departmentId: raw.departmentId ? Number(raw.departmentId) : null,
            procedureId: raw.procedureId ? Number(raw.procedureId) : null,
            doctorId: raw.doctorId ? Number(raw.doctorId) : null,
          },
        });

        inserted++;
      } catch (err) {
        skipped.push({ row: i + 1, reason: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: "Medical records uploaded successfully",
      inserted,
      skipped: skipped.length,
      skippedRows: skipped,
    });
  } catch (error) {
    console.error("Bulk upload MedicalRecords error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const getMedicalRecordByReceiptNo = async (
  req,
  res
) => {
  try {
    const { receiptNo } = req.params;

    const record = await prisma.medicalRecord.findUnique({
      where: {
        receiptNo,
      },
      include: {
        patient: true,
        department: true,
        doctor: true,
        procedure: true,

        items: {
          include: {
            department: true,
            doctor: true,
            procedure: true,
          },
        },
      },
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateMedicalRecordByReceiptNo = async (req, res) => {
  try {
    const { receiptNo } = req.params;

    const {
      totalFee,
      discount,
      finalFee,
      notes,
      items,
    } = req.body;

    // 1. Find record
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { receiptNo },
    });

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    // 2. Update ONLY main fields (NO patientId change here)
    const updatedRecord = await prisma.medicalRecord.update({
      where: { receiptNo },
      data: {
        totalFee: Number(totalFee),
        discount: Number(discount),
        finalFee: Number(finalFee),
        notes: notes || null,
      },
    });

    // 3. Replace items safely
    await prisma.medicalRecordItem.deleteMany({
      where: {
        medicalRecordId: existingRecord.id,
      },
    });

    if (Array.isArray(items) && items.length > 0) {
      await prisma.medicalRecordItem.createMany({
        data: items.map((item) => ({
          medicalRecordId: existingRecord.id,
          departmentId: Number(item.departmentId),
          doctorId: item.doctorId ? Number(item.doctorId) : null,
          procedureId: Number(item.procedureId),
          fee: Number(item.fee),
          discount: Number(item.discount || 0),
          finalFee:
            Number(item.fee) - Number(item.discount || 0),
          notes: item.notes || null,
        })),
      });
    }

    const fullRecord = await prisma.medicalRecord.findUnique({
      where: { receiptNo },
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

    return res.status(200).json({
      success: true,
      message: "Medical record updated successfully",
      data: fullRecord,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};