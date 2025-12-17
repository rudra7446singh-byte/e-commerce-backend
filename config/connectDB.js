// const mongoose = require("mongoose");
import mongoose from "mongoose";

mongoose.set("autoIndex", true)

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB connected successfully");
  } catch (error) {
    console.log("DB connection error:", error);
  }
};
