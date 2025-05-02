import { Content } from "../models/content.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";


export const verifyContentOwner = asyncHandler(async (req,res,next) => {
    const contentId = req.params.contentId;
    try {
        const content = await Content.findById(contentId).populate("author")
        
        if(!content)
        {
            throw new ApiError(404,"Post Not found")
        }
        if(content.author.id.toString() !== req.user._id.toString())
        {
            throw new ApiError(403,"You are not the owner of this post")
        }
        req.content = content
        next();
    } catch (error) {
        console.log(error)
        throw new ApiError(404,"Error Occured: Maybe the content is not present")
    }
})
