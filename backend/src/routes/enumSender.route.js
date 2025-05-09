import { Router } from "express";
import { sendCollegeEnum, sendDepartmentEnum } from "../controllers/enumDepartCollege.controller.js";
const router = Router();

router.route("/departments").get(sendDepartmentEnum);
router.route("/colleges").get(sendCollegeEnum);


export default router;