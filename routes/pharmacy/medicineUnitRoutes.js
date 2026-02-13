import express from 'express'
import { createMedicineUnit, getActiveMedicineUnits, getMedicineUnitById, getMedicineUnits, toggleMedicineUnitStatus, updateMedicineUnit } from '../../controller/pharmacy/MedicineUnitController.js'


const router = express.Router()

router.post('/unit', createMedicineUnit)
router.get('/unit', getMedicineUnits)
router.get('/unit-active', getActiveMedicineUnits)
router.get('/unit/:id', getMedicineUnitById)
router.put('/unit/:id', updateMedicineUnit)
router.patch('/unit/:id/toggle-status', toggleMedicineUnitStatus)

export default router
