import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {createPost,deletePost,commentPost, replyUser, editPost} from "../controllers/content.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { verifyContentOwner } from "../middlewares/contentVerify.middlewares.js";
const router = Router();

router.route("/upload-post").post(verifyJwt,upload.array("contentImage",5),createPost)
router.route("/delete-post/:contentId").get(verifyJwt,verifyContentOwner,deletePost)
router.route("/comment/:contentId").post(verifyJwt,commentPost)
router.route("/comment/reply/:contentId/:commentId").post(verifyJwt,replyUser)
router.route("/editPost/:contentId").post(verifyJwt,verifyContentOwner,editPost)

export default router;