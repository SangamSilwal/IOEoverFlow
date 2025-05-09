import { ioeCollegeValues } from "../constants.js";
import { ioeBachelorProgramsValues } from "../constants.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const sendCollegeEnum = asyncHandler(async (req,res) => {
    if(!ioeCollegeValues)
    {
        throw new ApiError(500, "Error in sending the college name from server")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {ioeCollegeValues},
            "Send Succesfully"
        )
    )
});

const sendDepartmentEnum = asyncHandler(async (req,res) => {
    if(!ioeBachelorProgramsValues)
    {
        throw new ApiError(500,"Error in sending the ioe Bachelor program form Server")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {ioeBachelorProgramsValues},
            "Send Succesfully"
        )
    )
});

export {
    sendCollegeEnum,
    sendDepartmentEnum
}

