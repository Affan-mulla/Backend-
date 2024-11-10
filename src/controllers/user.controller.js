import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (res, req) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exist : username , email
  // check for file & images for avatar
  // store it on server temp and then store it in cloudinary
  // take url and store it in database
  // create user object - creation entry in DB
  // remove password and refresh token field from response
  // check for user creation
  // if yes - response else no - error

  const { fullName, email, username, password } = req.body;
  console.log("body: ",req.body);
  
  console.log("email: ", email);

  if ([fullName, email, username, password].some(() => field?.trim() === "")) {
    throw ApiError(400, "All fields are required.");
  }

  const existingUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already existed.");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path
  console.log("files: ",req.files);

  const coverImageLocalPath = req.files?.coverImage[0]?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required.")
  }

  if(!coverImageLocalPath) {
    throw new ApiError(400, "cover image is required.")
  }
  
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  console.log("avatar:",avatar);
  
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Avatar is required.")
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage : coverImage?.url || "",
    password,
    username : username.toLowerCase(),
    email,
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user.")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User register successfully.")
  )


});

export { registerUser };