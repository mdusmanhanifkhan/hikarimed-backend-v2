import { prisma } from "../../lib/prisma.js";

// Print Patient Card
export const printPatientCard = async (req, res) => {
  try {
    const { patientId } = req.params;

    // ✅ Get user ID from authenticated user
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // 1️⃣ Get patient
    const patient = await prisma.patient.findUnique({
      where: { patientId: Number(patientId) },
    });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // 2️⃣ Count previous prints
    const printCount = await prisma.patientPrint.count({
      where: { patientId: patient.id },
    });

    // 3️⃣ Get current card price
    const priceRecord = await prisma.patientCardPrice.findFirst();
    const cardPrice = priceRecord ? priceRecord.price : 200; // default 200 if not set

    // 4️⃣ Decide charge
    const amount = printCount === 0 ? 0 : cardPrice;

    // 5️⃣ Save print record
    const printRecord = await prisma.patientPrint.create({
      data: {
        patientId: patient.id,
        printedById: userId,
        amount,
      },
    });

    // 6️⃣ Respond
    return res.json({
      success: true,
      message: amount === 0 ? "First print is free" : `Charged Rs. ${amount}`,
      data: {
        mrid: patient.patientId,
        name: patient.name,
        amount,
        printId: printRecord.id,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update or set Patient Card Price
export const updatePatientCardPrice = async (req, res) => {
  try {
    const { price } = req.body;

    if (price == null || price < 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    // 1️⃣ Check if price row exists
    const existingPrice = await prisma.patientCardPrice.findFirst();

    let priceRecord;
    if (existingPrice) {
      // 2️⃣ Update existing price
      priceRecord = await prisma.patientCardPrice.update({
        where: { id: existingPrice.id },
        data: { price: Number(price) },
      });
    } else {
      // 3️⃣ Create price if none exists
      priceRecord = await prisma.patientCardPrice.create({
        data: { price: Number(price) },
      });
    }

    return res.json({
      success: true,
      message: "Patient card print price updated",
      price: priceRecord.price,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get current patient card price
export const getPatientCardPrice = async (req, res) => {
  try {
    const priceRecord = await prisma.patientCardPrice.findFirst();

    if (!priceRecord) {
      return res.json({ price: 200 }); 
    }

    return res.json({ price: priceRecord.price });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const checkPatientPrint = async (req, res) => {
  try {
    const patientId = Number(req.params.id);
    if (isNaN(patientId)) return res.status(400).json({ message: "Invalid patient ID" });

    // 1️⃣ Find patient
    const patient = await prisma.patient.findUnique({
      where: { patientId: patientId },
    });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // 2️⃣ Count previous prints
    const printCount = await prisma.patientPrint.count({
      where: { patientId: patient.id },
    });

    // 3️⃣ Get current card price
    const priceRecord = await prisma.patientCardPrice.findFirst();
    const cardPrice = priceRecord ? priceRecord.price : 200; // default 200

    // 4️⃣ Decide amount
    const amount = printCount === 0 ? 0 : cardPrice;

    // 5️⃣ Respond WITHOUT creating a print record
    return res.json({
      success: true,
      message: "Print check successful",
      data: {
        patientId: patient.patientId,
        name: patient.name,
        amount,
        printCount,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
