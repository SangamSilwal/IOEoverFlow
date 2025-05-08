import { Router } from "express";
import showAllUsers from "../controllers/displayUsers.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/getAllUser").get(verifyJwt ,showAllUsers);

export default router