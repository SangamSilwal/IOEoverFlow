import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinaryFile.js"
import fs from "fs"

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.genrateAccessToken()
        const refreshToken = await user.genrateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        console.log(error)
        throw new ApiError(500, "SomeThing went wrong while genrating accesss token or refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        username,
        password,
        biostatus,
        collegeName,
        departMent
    } = req.body

    if (
        [name, email, username, password, collegeName, departMent].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "Some Fields are Missing")
    }

    const existedUserCheck = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUserCheck) {
        throw new ApiError(409, "User with email or username already exists")
    }

    let profilePicUrl;

    if (req.files && Array.isArray(req.files.profilePic) && req.files.profilePic.length > 0) {
        const localprofilePicPath = req.files?.profilePic[0].path;
        const cloudinaryResponse = await uploadOnCloudinary(localprofilePicPath);
        if (!cloudinaryResponse?.url) {
            throw new ApiError(500, "Failed to upload on cloudinary")
        }

        profilePicUrl = cloudinaryResponse.url;
        console.log(profilePicUrl)
        console.log(localprofilePicPath)
        fs.unlinkSync(`${localprofilePicPath}`);
    }
    else {
        profilePicUrl = "https://res.cloudinary.com/dc7xpzhax/image/upload/v1745648506/default_qsjqzc.png"
    }



    let ExistedUser;
    try {
        const user = await User.create({
            name,
            username,
            email,
            password,
            biostatus: biostatus || "",
            collegeName,
            departMent,
            profilePicUrl: profilePicUrl
        })
        ExistedUser = await User.findById(user._id).select("-refreshToken -password").lean()
    } catch (error) {
        if (error === "ValidationError") {
            throw new ApiError(400, "Invalid collegeName or Department")
        }
        throw new ApiError(500, error.message || "Something went Wront While Registering the user")
    }
    console.log(ExistedUser)
    if (!ExistedUser) {
        throw new ApiError(500, "Erorr in Registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201, ExistedUser, "User Created Succesfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (!user) {
        throw new ApiError(404, "The user Doesnot Exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials");
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: false,
        sameSite:'None'
    }
    req.user = loggedInUser

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "user logged In successfully"
        ))

})

const logoutUser = asyncHandler(async (req, res) => {

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

    const options = {
        httpOnly: true,
        secure: false,
        sameSite:'None'
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Logout SuccessFully"))
})

const sendFriendRequest = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(400, "First You need to login or register")
        }
        const user = req.user
        const { userId } = req.params;
        if (user._id.toString() === userId) {
            throw new ApiError(400, "Cannot send Request to yourself")
        }
        const friendUser = await User.findById(userId);
        if (!friendUser) {
            throw new ApiError(404, "The Person Doesnot Exists");
        }
        if (user.sentRequest.includes(friendUser._id)) {
            throw new ApiError(400, "You have already send request to the user")
        }
        if (user.friends.includes(friendUser._id)) {
            throw new ApiError(400, "This person is already your friend");
        }
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                $push: {
                    sentRequest: friendUser._id
                }
            },
            {
                new: true
            }
        )
        const updatedFriendUser = await User.findByIdAndUpdate(
            friendUser._id,
            {
                $push: {
                    friendRequest: user._id
                }
            },
            {
                new: true
            }
        )
        if (!updatedUser && !updatedFriendUser) {
            throw new ApiError(500, "Failed To sent request to the person")
        }
        res.status(201).json(new ApiResponse(201, { updatedUser }, "Friend Request Send Successfull"))
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Error Occured While sending request to the user")
    }
})

const cancelFriendRequest = asyncHandler(async(req,res) => {
    if(!req.user)
    {
        throw new ApiError(401,"unauthorized access")
    }
    const user = req.user;
    const {userId} = req.params;
    const friendUser = await User.findById(userId);
    if(!friendUser)
    {
        throw new ApiError(400,"The user doesNot exists")
    }
    if(!user.sendFriendRequest.includes(friendUser._id) && !friendUser.friendRequest.includes(user._id))
    {
        throw new ApiError(400,"You havenot sent request to that user")
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                $pull:{
                    sentRequest:friendUser._id
                }
            },
            {
                new:true
            }
        )
        const updatedFriend = await User.findByIdAndUpdate(
            friendUser._id,
            {
                $pull:{
                    friendRequest:user._id
                }
            },
            {
                new:true
            }
        )
        return res.status(200).json(new ApiResponse(200,{updatedUser},"Request Cancelled Succesfully"))
    } catch (error) {
        console.log(error)
        throw new ApiError(500,"Error while cancelling the friend Request")
    }
})

const acceptFriendRequest = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const { userId } = req.params;
        const userFriend = await User.findById(userId);

        if (!userFriend) {
            throw new ApiError(404, "User not Found");
        }
        if (user.friends.includes(userFriend._id)) {
            throw new ApiError(400, "The user is already your friend")
        }
        if (!user.friendRequest.includes(userFriend._id) && !userFriend.sentRequest.includes(user._id)) {
            throw new ApiError(400, "The user has not sent you any request")
        }
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                $pull: {
                    friendRequest: userFriend._id,
                },
                $push: {
                    friends: userFriend._id,
                }
            },
            {
                new: true
            }
        )
        const updatedUserFriend = await User.findByIdAndUpdate(
            userFriend._id,
            {
                $pull: {
                    sentRequest: user._id,
                },
                $push: {
                    friends: user._id,
                }
            },
            {
                new: true
            }
        )
        if (!updatedUser && !updatedUserFriend) {
            throw new ApiError(500, "Failed to accept Friend Request")
        }
        return res.status(200).json(new ApiResponse(200, { updatedUser }, "Friend Request Accepted Succesfully"))

    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Failed to accept Friend Request")
    }
})

const denyFriendRequest = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const { userId } = req.params;
        const userFriend = await User.findById(userId);
        if (!userFriend) {
            throw new ApiError(404, "User not Found");
        }
        if(user.friends.includes(userFriend._id))
        {
            throw new ApiError(400,"The user is already your friend")
        }
        if(!user.friendRequest.includes(userFriend._id) && !userFriend.sentRequest.includes(user._id))
        {
            throw new ApiError(400,"The user has not sent you any Request")
        }
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                $pull:{
                     friendRequest:userFriend._id
                }
            },
            {
                new:true
            }
        )

        const updatedUserFriend = await User.findByIdAndUpdate(
            userFriend._id,
            {
                $pull:{
                    sentRequest:user._id,
                }
            },
            {
                new:true
            }
        )
        res.status(200).json(new ApiResponse(200,{updatedUser},"Request Denied Succesfully"))


    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Error to deny the friend Request")
    }
})

const removeFriend = asyncHandler(async(req,res)=>{
    if(!req.user)
    {
        throw new ApiError(401,"Unauthorized access")
    }
    const user = req.user;
    const {userId} = req.params;
    const friendUser = await User.findById(userId);
    if(!friendUser)
    {
        throw new ApiError(400,"The user does not Exists")
    }
    if(!user.friends.includes(friendUser._id) && !friendUser.friends.includes(user._id))
    {
        throw new ApiError(401,"The user is not your friend")
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                $pull:{
                    friends:friendUser._id
                }
            },
            {
                new:true
            }
        )
        const updatedFriend = await User.findByIdAndUpdate(
            friendUser._id,
            {
                $pull:{
                    friends:user._id
                }
            },
            {
                new:true
            }
        )
        return res.status(200).json(new ApiResponse(200,{updatedUser},"Friend Removed Succesfully"))
    } catch (error) {
        console.log(error);
        throw new ApiError(500,"Failed to remove the friend from your friend's list")
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    sendFriendRequest,
    acceptFriendRequest,
    denyFriendRequest,
    cancelFriendRequest,
    removeFriend
}