// const mongoose = require("mongoose");
// const ROLE_STATUS = require("../config/constant");
import mongoose from "mongoose";
import ROLE_STATUS from "../config/constant.js";


const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    slug: { 
      type: String,
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ROLE_STATUS.STATUS),
      default: ROLE_STATUS.STATUS.PENDING,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    isdeleted: {
      type: Boolean,
      default: false,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true,
      }
    }
  },
  {
    timestamps: true,
  }
);

productSchema.index({ location: "2dsphere" });


const Product = mongoose.model("Product", productSchema);
export default Product;
