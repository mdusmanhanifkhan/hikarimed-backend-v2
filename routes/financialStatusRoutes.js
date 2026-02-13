import { Router } from "express";
import { getFinancialReportTodayHandler } from "../controller/FinancialStatusController.js";

const router = Router()

router.get('/financial-report' , getFinancialReportTodayHandler)

export default router
