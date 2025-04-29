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

export {
    createPost,
    deletePost
}