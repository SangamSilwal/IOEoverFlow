import { Content } from "../models/content.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinaryFile.js"
import fs from "fs"

const createPost = asyncHandler(async (req, res) => {
    const { title, description, fileAttach } = req.body
    if (!(title || description || fileAttach)) {
        throw new ApiError(400, "Atleast one Field is required to Post")
    }
    if (!req.user) {
        throw new ApiError(401, "Unauthorized to post")
    }
    console.log(req.files)
    const imageUrls = await Promise.all(
        req.files.map(async (file) => {
            const cloudinaryResponse = await uploadOnCloudinary(file.path)
            console.log(cloudinaryResponse.url)
            fs.unlinkSync(`${file.path}`)
            return cloudinaryResponse.url;
        })
    )

    const content = await Content.create({
        title,
        description,
        fileAttach: imageUrls || [],
        author: req.user
    })
    if (!content) {
        throw new ApiError(500, "Failed to save the content in the database")
    }
    const user = await User.findById(req.user._id);
    user.content.push(content._id)
    await user.save({ validateBeforeSave: false })
    req.user = user;

    return res
        .status(201)
        .json(new ApiResponse(201, { content }, "post created Succesfully"))

})

const deletePost = asyncHandler(async (req, res) => {
    await Content.findByIdAndDelete(req.content._id);
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull: { content: req.content._id }
        },
        { new: true }
    )
    return res.status(201).json(new ApiResponse(201,{},"Deleted Succesfully"))
})

const editPost = asyncHandler(async (req,res) => {
    try {
        const {title,description} = req.body || {};
        console.log(description)
        const content = req.content;
        const updatedContent = await Content.findByIdAndUpdate(
            content._id,
            {
                $set:{
                    title:title || content.title,
                    description:description || content.description
                }
            },
            {
                new:true
            }
        )
        return res.status(200).json(new ApiResponse(200,{updatedContent},"Post Updated Succesfully"))
    } catch (error) {
        console.log(error);
        throw new ApiError(500,"Error While Editing the post")
    }
})

const commentPost = asyncHandler(async (req,res) => {
    if(!req.user)
    {
        throw new ApiError(401,"Need to login or register for posting comment")
    }
    try {
        const contentId = req.params.contentId;
        const {text} =req.body;
        if(!text)
        {
            throw new ApiError(400,"Cannot comment empty string");
        }
        const updatedContent = await Content.findByIdAndUpdate(
            contentId,
            {
                $push:{
                    comments: {
                        user: req.user,
                        text:text
                    }
                }
            }
        )
        return res.status(201).json(new ApiResponse(201,{updatedContent},"Posted successfully"))
    } catch (error) {
        console.log(error)
        throw new ApiError(500,"Error occur while commenting on the post")
    }
})

const replyUser = asyncHandler(async(req,res) => {
    if(!req.user)
    {
        throw new ApiError(401,"Need to login or reguster for giving replies")
    }

    try {
        const {contentId,commentId}= req.params;
        const {replyText} =req.body;
        if(!replyText)
        {
            throw new ApiError(400,"Cannot reply empty string");
        }
        const content = await Content.findById(contentId);
        console.log(content)
        console.log(contentId,"-->contentId")
        console.log(commentId,"--->commentId")
        const comment = await content.comments.id(commentId);
        if(!comment)
        {
            throw new ApiError(404,"Comment donot exists")
        }
        comment.replies.push({
            user: req.user,
            text:replyText
        });
        await content.save();

        const updatedContent = await Content.findById(contentId).populate('author comments.user comments.replies.user')
        return res.status(201).json( new ApiResponse(201,{updatedContent},"Reply added Succesfully"))
        

    } catch (error) {
        console.log(error);
        throw new ApiError(500,"Error While giving reply")
    }
})



export {
    createPost,
    deletePost,
    commentPost,
    replyUser,
    editPost
}