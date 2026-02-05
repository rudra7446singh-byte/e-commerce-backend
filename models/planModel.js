import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  priceId: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  interval: {
    type: String,
    enum: ["day","week", "month", "year"],
    required: true,
  },
  duration: {
    type: Number, 
    // required: true,
  },
  amount: Number,
  currency: String,
});

export default mongoose.model("Plan", planSchema);
