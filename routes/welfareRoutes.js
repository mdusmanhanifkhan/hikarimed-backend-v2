import { Router } from "express";
import {createWelfarePatient} from "../controller/WelfareController.js"

const router = Router()

router.post('/welfare' , createWelfarePatient)


export default router