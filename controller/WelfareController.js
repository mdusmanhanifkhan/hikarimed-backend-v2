
import { prisma } from "../lib/prisma.js";



/* ===============================
   ⚙️ Constants & Error Helper
=============================== */
const MAX_STR_LEN = 100

const sendError = (res, status, general_error, errors = {}) =>
  res.status(status).json({ status, general_error, errors })

/* ===============================
   🧩 Validation
=============================== */
const validateWelfareInput = (body) => {
  const errors = {}

  if (!body.patientId) errors.patientId = 'Patient ID is required'
  if (!body.welfareCategory)
    errors.welfareCategory = 'Welfare category is required'

  if (body.discountPercentage && (body.discountPercentage < 0 || body.discountPercentage > 100)) {
    errors.discountPercentage = 'Discount must be between 0–100%'
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

/* ===============================
   ➕ Create Welfare Record
=============================== */
export const createWelfarePatient = async (req, res) => {
  try {
    const { isValid, errors } = validateWelfareInput(req.body)
    if (!isValid) return sendError(res, 400, 'Validation error', errors)

    const existing = await prisma.welfarePatient.findUnique({
      where: { patientId: req.body.patientId },
    })
    if (existing)
      return sendError(res, 409, 'Welfare record already exists for this patient')

    const welfare = await prisma.welfarePatient.create({
      data: {
        patientId: req.body.patientId,
        welfareCategory: req.body.welfareCategory,
        discountType: req.body.discountType,
        discountPercentage: Number(req.body.discountPercentage) || 0,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
        approvedBy: req.body.approvedBy,
        referredBy: req.body.referredBy,
        remarks: req.body.remarks,

        monthlyIncome: req.body.monthlyIncome,
        sourceOfIncome: req.body.sourceOfIncome,
        houseOwnership: req.body.houseOwnership,
        houseType: req.body.houseType,
        vehicleOwnership: req.body.vehicleOwnership,
        familyMembers: req.body.familyMembers ? Number(req.body.familyMembers) : null,
        workingMembers: req.body.workingMembers ? Number(req.body.workingMembers) : null,
        educationLevel: req.body.educationLevel,
        financialRemarks: req.body.financialRemarks,

        verificationStatus: req.body.verificationStatus,
        verifiedBy: req.body.verifiedBy,
        verificationDate: req.body.verificationDate ? new Date(req.body.verificationDate) : null,
        approvalDate: req.body.approvalDate ? new Date(req.body.approvalDate) : null,
        nextReviewDate: req.body.nextReviewDate ? new Date(req.body.nextReviewDate) : null,
      },
    })

    res.status(201).json({ status: 201, message: 'Welfare record created', data: welfare })
  } catch (error) {
    sendError(res, 500, 'Server error' , error)
  }
}

/* ===============================
   📄 Get All Welfare Patients
=============================== */
export const getWelfarePatients = async (req, res) => {
  try {
    const records = await prisma.welfarePatient.findMany({
      include: { patient: true },
      orderBy: { id: 'desc' },
    })
    res.json({ status: 200, data: records })
  } catch (error) {
    sendError(res, 500, 'Server error')
  }
}

/* ===============================
   🔍 Get Single Welfare by Patient ID
=============================== */
export const getWelfareByPatientId = async (req, res) => {
  try {
    const id = Number(req.params.patientId)
    if (isNaN(id)) return sendError(res, 400, 'Invalid patient ID')

    const record = await prisma.welfarePatient.findUnique({
      where: { patientId: id },
      include: { patient: true },
    })

    if (!record) return sendError(res, 404, 'Welfare record not found')
    res.json({ status: 200, data: record })
  } catch (error) {
    sendError(res, 500, 'Server error')
  }
}

/* ===============================
   ✏️ Update Welfare
=============================== */
export const updateWelfarePatient = async (req, res) => {
  try {
    const patientId = Number(req.params.patientId)
    if (isNaN(patientId)) return sendError(res, 400, 'Invalid patient ID')

    const record = await prisma.welfarePatient.findUnique({
      where: { patientId },
    })
    if (!record) return sendError(res, 404, 'Record not found')

    const updated = await prisma.welfarePatient.update({
      where: { patientId },
      data: {
        ...req.body,
        discountPercentage: req.body.discountPercentage
          ? Number(req.body.discountPercentage)
          : record.discountPercentage,
        familyMembers: req.body.familyMembers
          ? Number(req.body.familyMembers)
          : record.familyMembers,
        workingMembers: req.body.workingMembers
          ? Number(req.body.workingMembers)
          : record.workingMembers,
      },
    })

    res.json({ status: 200, message: 'Welfare record updated', data: updated })
  } catch (error) {
    sendError(res, 500, 'Server error')
  }
}

/* ===============================
   🗑 Delete Welfare Record
=============================== */
export const deleteWelfarePatient = async (req, res) => {
  try {
    const patientId = Number(req.params.patientId)
    if (isNaN(patientId)) return sendError(res, 400, 'Invalid patient ID')

    const record = await prisma.welfarePatient.findUnique({ where: { patientId } })
    if (!record) return sendError(res, 404, 'Record not found')

    await prisma.welfarePatient.delete({ where: { patientId } })
    res.json({ status: 200, message: 'Welfare record deleted' })
  } catch (error) {
    sendError(res, 500, 'Server error')
  }
}
