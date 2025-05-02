import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const showAllUsers = asyncHandler(async(req,res) => {
    try {
        const users = await User.find({});
        
    } catch (error) {
        console.log(error);
        throw new ApiError(500,"Error in loading all the users. Maybe DataBase connectivity failed")
    }
})