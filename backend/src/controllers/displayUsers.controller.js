import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const showAllUsers = asyncHandler(async(req, res) => {
    const currentUserID = req.user?._id; 
    try {
        const users = await User.aggregate([
            {
                $match:{
                    _id: {
                        $ne:new  mongoose.Types.ObjectId(currentUserID)
                    }
                }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    name: 1,
                    username: 1,
                    collegeName: 1,
                    friendStatus: {
                        $cond: {
                            if: { 
                                $in: [
                                    new mongoose.Types.ObjectId(currentUserID), 
                                    "$friends"
                                ] 
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            }
        ]);
        
        return res.status(200).json(
            new ApiResponse(200, { users }, "All users fetched successfully")
        );
        
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Error loading users. Database connectivity issue");
    }
});

export default showAllUsers;