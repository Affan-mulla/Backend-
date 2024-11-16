import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { json } from "express"

const createTweet = asyncHandler(async ( res,req) => {
    //TODO: create tweet
    const {content } = req.body
    if(!content) {
        throw new ApiError(200, "tweet content is required")
    }
    
    const tweet = await Tweet.create({
        content,
        owner :  req.user._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet created successfully"))
})

const getUserTweets = asyncHandler(async ( res,req) => {
    // TODO: get user tweets
    const {userId} = req.params

    const tweet = await Tweet.aggregate([
        {
            $match: {
                owner : new mongoose.Types.ObjectId(userId)
            }
        },
    ])

    if(!tweet) {
        throw new ApiError(400, "user has no tweet")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "user tweet fetched successfully"))
})

const updateTweet = asyncHandler(async( res,req) => {
    //TODO: update tweet
    const {content} = req.body
    const {tweetId} = req.params

    const tweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set : {
                content
            }
        },
        {new:true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet updated successfully"))
})

const deleteTweet = asyncHandler(async( res,req)=> {
    //TODO: delete tweet
    const {tweetId} = req.params

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
