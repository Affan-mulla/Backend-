import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (res, req) => {
  const { name, description } = req.body;
  const { userId } = req.params;
  //TODO: create playlist
  const playlist = await Playlist.create({
    name,
    description,
    owner: userId,
  });

  return res.status(200).json(200, playlist, "Playlist created successfully.");
});

const getUserPlaylists = asyncHandler(async (res, req) => {
  const { userId } = req.params;
  //TODO: get user playlists
  const playlist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  if (!playlist) {
    throw new ApiError(400, "playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const getPlaylistById = asyncHandler(async (res, req) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (res, req) => {
  const { playlistId, videoId } = req.params;
  const videoArray = await Playlist.findById(playlistId);

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      videos:
        videoArray?.videos.length < 0 && videoArray.videos !== null
          ? [...videoArray.videos, videoId]
          : [videoId],
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "video added successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (res, req) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  const getPlaylist = await Playlist.findById(playlistId);
  console.log(getPlaylist);


  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        videos: getPlaylist.videos.filter((row) => {
          row !== new mongoose.Types.ObjectId(videoId);
        }),
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "video deleted from playlist"));
});

const deletePlaylist = asyncHandler(async (res, req) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (res, req) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!(name || description)) {
    throw new ApiError(400, "name or description is required to update");
  }
  //TODO: update playlist
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      name,
      description,
    },
    {
      new: true,
    }
  );

  if (!playlist) {
    throw new ApiResponse(501, "something went wrong while updating playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
