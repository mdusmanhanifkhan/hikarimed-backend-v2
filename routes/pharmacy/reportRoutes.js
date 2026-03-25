import express from "express";
import { getSalesReport } from "../../controller/pharmacy/ReportControler.js";


const router = express.Router();

router.get("/sale-report", getSalesReport);


export default router;
