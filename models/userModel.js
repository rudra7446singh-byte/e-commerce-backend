// const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken")
// const bcrypt = require("bcrypt")

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../utils/emailService.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "name field is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "name field is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email field is required"],
      trim: true,
      index: true,
      unique: [true, "this email is already exists."],
      match: [/^\S+@\S+\.\S+$/, "Invalid email."],
    },
    mobile: {
      type: Number,
      required: true,
      trim: true,
      unique: [true, "This mobile number already exist"],
      minLength: [10, "should be 10 digit"],
      maxLength: [10, "should be 10 digit"],
      index: true,
      match: [/^\d{10}$/, "invalid mobile number."],
    },
    age: {
      type: Number,
      required: true,
      minimum: [1, "age should greater then 1"],
      maximum: [100, "age should less then 1"],
    },
    password: {
      type: String,
      required: [true, "Password field is required"],
      trim: true,
    },
    role: {
      type: String,
      default: "user",
      index: true,
    },
    otp: {
      type: Number,
      default: 1234,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true ,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
  }
);


userSchema.index({ email: 1, mobile: 1});

userSchema.index({ createdAt: -1 });


userSchema.virtual("fullName").get(function () {
   return `${this.firstName } ${this.lastName}`;
})

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.pre("save", function (next) {
  this._wasNew = this.isNew;
  next();
});

userSchema.post("save", async function (doc) {
  if (doc._wasNew) {
    await sendWelcomeEmail(doc.email);
  }
});

export default mongoose.model("User", userSchema);
