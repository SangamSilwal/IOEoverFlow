import { User } from "../models/user.model.js";
import { Content } from "../models/content.model.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {uploadOnCloudinary} from "../utils/cloudinaryFile.js"
import fs from "fs"

const generateAccessTokenAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.genrateAccessToken()
        const refreshToken = await user.genrateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken,refreshToken}
    } catch (error) {
        console.log(error)
        throw new ApiError(500,"SomeThing went wrong while genrating accesss token or refresh token")
    }
}

const registerUser = asyncHandler(async (req,res) => {
    const {
        name,
        email,
        username,
        password,
        biostatus,
        collegeName,
        departMent
    } = req.body

    if(
        [name,email,username,password,collegeName,departMent].some((field) => field?.trim() === "")
    )
    {
        throw new ApiError(400,"Some Fields are Missing")
    }

    const existedUserCheck = await User.findOne({
        $or: [{username},{email}]
    })

    if(existedUserCheck)
    {
        throw new ApiError(409,"User with email or username already exists")
    }

    let profilePicUrl;

    if(req.files && Array.isArray(req.files.profilePic) && req.files.profilePic.length >0)
    {
        const localprofilePicPath = req.files?.profilePic[0].path;
        const cloudinaryResponse = await uploadOnCloudinary(localprofilePicPath);
        if(!cloudinaryResponse?.url)
        {
            throw new ApiError(500,"Failed to upload on cloudinary")
        }

        profilePicUrl = cloudinaryResponse.url;
        console.log(profilePicUrl)
        console.log(localprofilePicPath)
        fs.unlinkSync(`${localprofilePicPath}`);
    }
    else{
        profilePicUrl = "https://res.cloudinary.com/dc7xpzhax/image/upload/v1745648506/default_qsjqzc.png"
    }



    let ExistedUser;
    try {
        const user = await User.create({
            name,
            username,
            email,
            password,
            biostatus:biostatus || "",
            collegeName,
            departMent,
            profilePicUrl:profilePicUrl
        })
        ExistedUser = await User.findById(user._id).select("-refreshToken -password").lean()
    } catch (error) {
        if(error === "ValidationError")
        {
            throw new ApiError(400,"Invalid collegeName or Department")
        }
        throw new ApiError(500,error.message || "Something went Wront While Registering the user")
    }
    console.log(ExistedUser)
    if(!ExistedUser)
    {
        throw new ApiError(500, "Erorr in Registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201,ExistedUser,"User Created Succesfully")
    )
})

const loginUser = asyncHandler(async(req,res) => {
    const {email,username,password} = req.body;
    if(!(username || email))
    {
        throw new ApiError(400,"Username or email is required")
    }

    const user = await User.findOne({
        $or: [{email},{username}]
    })
    if(!user)
    {
        throw new ApiError(404,"The user Doesnot Exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) throw new ApiError(401,"Invalid user credentials");
    const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }
    req.user = loggedInUser

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(
        200,
        {
            user: loggedInUser,accessToken,refreshToken
        },
        "user logged In successfully"
    ))
    
})

const logoutUser = asyncHandler(async (req,res) => {
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    let options= {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"Logout SuccessFully"))
})
export {
    registerUser,
    loginUser,
    logoutUser
}