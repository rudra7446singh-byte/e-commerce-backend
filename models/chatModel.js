import mongoose from "mongoose";
import User from "./userModel.js"

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  { 
    roomId: {
      type: String,
      // required: true,
      unique: true,
      index: true,  
  },

  participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      validate: {
        validator: (arr) => arr.length === 2,
        message: "Room must have exactly 2 participants",
      },
      required: true,
  },
  
    messages: [messageSchema],
    lastMessage: String,
    lastMessageAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
