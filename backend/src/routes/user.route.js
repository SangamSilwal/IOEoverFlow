import { Router } from "express";
import { registerUser,loginUser,logoutUser, sendFriendRequest, acceptFriendRequest, denyFriendRequest, cancelFriendRequest, removeFriend } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(upload.fields([
    {
        name:"profilePic",
        maxCount:1
    }
]),registerUser)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJwt,logoutUser)
router.route("/sendFriendRequest/:userId").get(verifyJwt,sendFriendRequest)
router.route("/acceptFriendRequest/:userId").get(verifyJwt,acceptFriendRequest)
router.route("/denyFriendRequest/:userId").get(verifyJwt,denyFriendRequest)
router.route("/cancelFriendRequest/:userId").get(verifyJwt,cancelFriendRequest)
router.route("/removeFriend/:userId").get(verifyJwt,removeFriend)

export default router;