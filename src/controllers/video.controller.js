import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (res, req) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;

  try {
    // Calculate pagination values
    const skip = (page - 1) * limit;

    // Build the aggregation pipeline
    const pipeline = [];

    // Match stage for filtering by query
    if (query) {
      pipeline.push({
        $match: {
          name: { $regex: query, $options: "i" }, // Search by name, case-insensitive
        },
      });
    }

    // Project stage to select specific fields
    pipeline.push({
      $project: {
        videoUrl: "$videoFile",
        thumbnailUrl: "$thumbnail",
        title: "$title",
        description: "$description",
        views: "$views",
        duration: "$duration",
      },
    });

    // Sort stage
    pipeline.push({
      $sort: { [sortBy]: sortType === "desc" ? -1 : 1 },
    });

    // Pagination stages
    pipeline.push({ $skip: skip }, { $limit: parseInt(limit) });

    // Execute the pipeline
    const videos = await Video.aggregate(pipeline);

    // Send the response
    return res
      .status(200)
      .json(
        new ApiResponse(200, videos, "All videos are fetched successfully")
      );
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

const publishAVideo = asyncHandler(async (res, req) => {
  console.log(req.body);

  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  console.log(req.files);

  if (!req?.files || req?.files.length < 0) {
    throw new ApiError(400, "Video and thumbnail is required");
  }

  const videoLocalPath = req?.files.videoFile[0].path;

  if (!videoLocalPath) {
    throw new ApiError(400, "video  path not found");
  }
  const thumbnailLocalPath = req?.files.thumbnail[0].path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail  path not found");
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  console.log(video);

  if (!video.url) {
    throw new ApiError(501, "video upload error");
  }

  if (!thumbnail.url) {
    throw new ApiError(501, "thumbnail upload error");
  }

  const user = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: video.duration,
  });
  console.log(user);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Video created successfully."));
});

const getVideoById = asyncHandler(async (res, req) => {
  const { videoId } = req.params;
  //TODO: get video by id

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfully."));
});

const updateVideo = asyncHandler(async (res, req) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;

  if (!(title || description)) {
    throw new ApiError(400, "title or description is required.");
  }

console.log(req.file);

  const thumbnailLocalPath = req?.file.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail is required");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail.url) {
    throw new ApiError(400, "thumbnail upload error");
  }
  
console.log(thumbnail.url);

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbnail.url,
      },
    },
    {
      new: true,
    }
  );

  console.log(video);
  

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video details updated successfully."));
});

const deleteVideo = asyncHandler(async (res, req) => {
  const { videoId } = req.params;
  //TODO: delete video
  const video = await Video.findByIdAndDelete(videoId);

  if (!video) {
    throw new ApiError(500, "something went wrong while deleting video.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video deleted successfully."));
});

const togglePublishStatus = asyncHandler(async (res, req) => {
  const { videoId } = req.params;
  const {isPublished} = req.body

  const video = await Video.findByIdAndUpdate(videoId, {
    $set : {
      isPublished
    }
  })

  return res
    .status(200)
    .json(new ApiResponse(200, video, "is published toggle"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
