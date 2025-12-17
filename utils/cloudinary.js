import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";


dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const uploadOnCloudinary = async (file) => {
  try {
    if (!file || !file.path) {
      console.error("Invalid file object:", file);
      return null;
    }

    console.log("Uploading file to Cloudinary:", file.path);

    const response = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto",
    });

    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    return null;
  }
};

