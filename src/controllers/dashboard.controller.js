import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (res, req) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
})

const getChannelVideos = asyncHandler(async (res, req) => {
    // TODO: Get all the videos uploaded by the channel
    const channelVideos = await Video.aggregate([
        {
            $match : {
                owner : req.user._id
            }
        }
    ])

    if(!channelVideos) {
        throw new ApiError(404,"Videos not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,channelVideos, "videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }