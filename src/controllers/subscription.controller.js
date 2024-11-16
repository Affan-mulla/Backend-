import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  const subscribed = await Subscription.aggregate([
    {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
    },
    {
        $lookup: {
          from: "channel",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo",
        },
    },
    {
      $addFields: {
        isSubscribed: {
          $cond: {
            if: {
              $in: [channelId, "$subscribers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
  ]);

  return res
  .status(200)
  .json(new ApiResponse(200, subscribed, "subscribed or not"))
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };