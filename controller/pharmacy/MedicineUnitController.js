import { prisma } from "../../lib/prisma.js"

/**
 * Create Medicine Unit (e.g. 400mg, 0.5mg)
 */
export const createMedicineUnit = async (req, res) => {
  try {
    const { value, unit, status } = req.body

    if (value === undefined || !unit) {
      return res.status(400).json({ message: 'Value and unit are required' })
    }

    const label = `${value}${unit}`

    const medicineUnit = await prisma.medicineUnit.create({
      data: {
        value,
        unit,
        label,
        status,
      },
    })

    res.status(201).json(medicineUnit)
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Unit already exists' })
    }
    res.status(500).json({ message: error.message })
  }
}


/**
 * Get all active units
 */
export const getMedicineUnits = async (req, res) => {
  try {
    const units = await prisma.medicineUnit.findMany({
      orderBy: [{ unit: 'asc' }, { value: 'asc' }],
    })

    res.json(units)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getActiveMedicineUnits = async (req, res) => {
  try {
    const units = await prisma.medicineUnit.findMany({
      where:{status:true},
      orderBy: [{ unit: 'asc' }, { value: 'asc' }],
    })

    res.json(units)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Get single unit by ID
 */
export const getMedicineUnitById = async (req, res) => {
  try {
    const id = Number(req.params.id)

    const unit = await prisma.medicineUnit.findUnique({
      where: { id },
    })

    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' })
    }

    res.json(unit)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Update unit
 */
export const updateMedicineUnit = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { value, unit, status } = req.body

    const label = value && unit ? `${value}${unit}` : undefined

    const updated = await prisma.medicineUnit.update({
      where: { id },
      data: {
        value,
        unit,
        label,
        status,
      },
    })

    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Soft delete (disable)
 */
export const toggleMedicineUnitStatus = async (req, res) => {
  try {
    const id = Number(req.params.id)

    const unit = await prisma.medicineUnit.findUnique({ where: { id } })
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' })
    }

    const updated = await prisma.medicineUnit.update({
      where: { id },
      data: { status: !unit.status },
    })

    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
