import { Content } from "../models/content.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const commentVerify = asyncHandler(async(req,res,next) => {
    try {
        const {contentId,commentId} = req.params;
        const content = await Content.findById(contentId);
        if(!content)
        {
            throw new ApiError(404,"Post not found");
        }
        const comment = await content.comments.id(commentId);
        if(!comment)
        {
            throw new ApiError(404,"Comment not found")
        }
        if(comment.user._id.toString() !== req.user._id.toString())
        {
            throw new ApiError(401,"You are not authorized to edit this comment");
        }
        req.content = content;
        req.comment = comment;
        next();
    
    } catch (error) {
        console.log(error);
        throw new ApiError(500,"Error while verifying the comment");
    }
})


const replyVerify = asyncHandler(async(req,res,next)=> {
    try {
         const {contentId,commentId,replyId} = req.params;
         const content = await Content.findById(contentId);
         if(!content)
         {
            throw new ApiError(404,"Content not found");
         }
         const reply = content.comments.id(commentId).replies.id(replyId);
         if(!reply)
         {
            throw new ApiError(404,"Reply not found")
         }
         if(reply.user._id.toString() !== req.user._id.toString())
         {
            throw new ApiError(401,"You are not authorized to edit this reply");
         }
         req.content = content;
         req.reply = reply;
         next();
    } catch (error) {
        console.log(error);
        throw new ApiError(500,"Error while verifying the reply ")
    }
})

export {
    commentVerify,
    replyVerify
}
