import { Router } from "express";
import { createBrand, getBrands } from "../../controller/pharmacy/BrandController.js";

const router = Router()

router.post('/brand' , createBrand)
router.get('/brand' , getBrands)

export default router
