import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleVideoLike = asyncHandler(async (res,req) => {
    console.log("req",req.params);
    const { videoId } = req.params
    
    //TODO: toggle like on video
    const existingLike = await Like.findOne({
        video : videoId,
        likedBy : req.user._id
    })

    if(existingLike) {
        const disLike = await Like.deleteOne({
            _id : existingLike._id
        })
        return res.status(200).json(200, disLike," video disliked")
    } else {
        const videoLike = await Like.create({
            video : videoId,
            likedBy : req.user._id
        })
        return res.status(200).json(200, videoLike," video liked")
    }

    
})

const toggleCommentLike = asyncHandler(async(res,req)=> {
    const {commentId} = req.params
    //TODO: toggle like on comment

    const existingLike = await Like.findOne({
        comment : commentId,
        likedBy : req.user._id
    })

    if(existingLike) {
        const disLike = await Like.deleteOne({
            _id : existingLike._id
        })
        return res.status(200).json(200, disLike," comment disliked")
    } else {
        const videoLike = await Like.create({
            comment : commentId,
            likedBy : req.user._id
        })
        return res.status(200).json(200, videoLike," comment liked")
    }
})

const toggleTweetLike = asyncHandler(async (res,req) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const existingLike = await Like.findOne({
        tweet : tweetId,
        likedBy : req.user._id
    })

    if(existingLike) {
        const disLike = await Like.deleteOne({
            _id : existingLike._id
        })
        return res.status(200).json(200, disLike," tweet disliked")
    } else {
        const videoLike = await Like.create({
            tweet : tweetId,
            likedBy : req.user._id
        })
        return res.status(200).json(200, videoLike," tweet liked")
    }

    
}
)

const getLikedVideos = asyncHandler(async (res,req) => {
    //TODO: get all liked videos
    const likedVideos = await Like.aggregate([
        {
            $match :{
                likedBy : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from : "videos",
                localField : "video",
                foreignField : "_id",
                as : "videoDetails"
            }
        },{
            $unwind : "$videoDetails"
        },{
            $project : {
                _id  : 0,
                video : "$videoDetails"
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200,likedVideos,"liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}