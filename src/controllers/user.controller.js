import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const options = {
  httpOnly : true,
  secure : true,
}

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

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw ApiError(400, "All fields are required.");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already existed.");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  // const coverImageLocalPath = req.files?.coverImage[0]?.path

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required.");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required.");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
    username: username.toLowerCase(),
    email,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user.");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User register successfully."));
});

const generateAccessAndRefreshToken = async(userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave : false})

    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token.")
  }
}

const loginUser = asyncHandler(async (res, req) => {
  // 1.take id/username password from frontend
  // 2.check user exist
  // * check password
  // 3.generate access and refresh token
  // * send cookie
  // 4.allow user to login

  const { email, password, username } = req.body;

 
    if(!email && !username){
      throw new ApiError(400, "username or email is required.");
    }
  

  // if (!(email || username)) {
  //   throw new ApiError(400, "username or email is required.");
  // }

  const user = await User.findOne({
    $or : [{username}, {email}]
  })

  if(!user) {
    throw new ApiError(400,"User does not exist.")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid) {
    throw new ApiError(400,"Password incorrect.")
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken)
  .json(
    new ApiResponse(
      200,
      {
        user : loggedInUser, accessToken, refreshToken
      },
      "User logged in successfully."
    )
  )

});

const logOutUser = asyncHandler(async(res,req) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set : {
        refreshToken : undefined
      }
    },
    {
      new : true
    }
  )

  const options = {
    httpOnly : true,
    secure : true,
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(
    200,
    {},
    "user logged Out"
  )
  
})

const refreshAccessToken = asyncHandler(async(res, req) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  
    if (incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request.")
    }
  
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id)
  
    if(!user) {
      throw new ApiError(401, "Invalid refresh token.")
    }
  
    if(incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used.")
    }
  
    const {accessToken, refreshToken : newRefreshToken} = await generateAccessAndRefreshToken(user._id)
  
    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {accessToken, newRefreshToken},
        "Access Token Refreshed."
      )
    )
  } catch (error) {
    throw new ApiError(401, error?.message ||
      "invalid refresh token"
    )
  }

})

export { registerUser, loginUser, logOutUser, refreshAccessToken };