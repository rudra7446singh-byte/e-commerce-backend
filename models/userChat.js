import mongoose from "mongoose";

export const roomSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  deletedBy: [String],
  blockedBy: [String],
},
{ timestamps: true }
);

export const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'message is required']
  },
  type: {
    type: String,
    enum: ["text", "file", "image", "video"],
    default: "text",
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'sender is required']
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Receiver is required"]
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userRoom",
    required: [true, "roomId must required"]
  },
  isReaded: { 
    type: Boolean,
    default: false,
  },
  deletedBy: [String],
  blockedBy: [String],
},
{ timestamps: true }
);


export const userChat = mongoose.model("userChat", messageSchema);
export const userRoom = mongoose.model("userRoom", roomSchema);