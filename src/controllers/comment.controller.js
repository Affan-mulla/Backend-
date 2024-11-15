import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (res, req) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    

    const comment = await Comment.aggregate([
        {
            $match : {
                video : new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $limit : limit
        },
        {
            $skip : (page-1) * limit
        }
    ])

    if(!comment) {
        throw new ApiError(400, "comments not found or has no comments.")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, comment, "comments fetched successfully"))
})

const addComment = asyncHandler(async (res, req)=> {
    // TODO: add a comment to a video
    const {videoId} = req.params

    const {content} = req.body

    if(!content) {
        throw new ApiError(400, "comment is required.")
    }

    console.log(videoId);
    

    const comment = await Comment.create({
        content,
        video : videoId
    })

    return res
    .status(200)
    .json(200, comment, "comment uploaded successfully.")
})

const updateComment = asyncHandler(async (res, req) => {
    // TODO: update a comment
    const {content} = req.body
    const {commentId} = req.params

    if(!content) {
        throw new ApiError(400, "comment should not be empty.")
    }

    const comment = await Comment.findByIdAndUpdate(commentId, {
        $set :{
            content : content
        },
        
    },{
        new:true
    })

    return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment updated successfully"))
})

const deleteComment = asyncHandler(async (res, req) => {
    // TODO: delete a comment
    const {commentId} = req.params

    await Comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
