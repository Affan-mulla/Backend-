import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  // Upload an image
  try {
    if (!localFilePath) return null;

    //upload the file on cloudinary

    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //file successfully upload

    fs.unlinkSync(localFilePath)
    return res;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved temp file as the upload operation failed
  }
};

export { uploadOnCloudinary };