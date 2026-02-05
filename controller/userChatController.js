import mongoose from "mongoose";
import { userRoom } from "../models/userChat.js";
import { userChat } from "../models/userChat.js";
import User from "../models/userModel.js"
import MESSAGES from "../messages/message.js";


// ----> USER LIST
export const usersList = async (req, res) => {
    try{
        const list = await User.find()
        .select("fullname email mobile")

    return res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

// ----> CREATE ROOM
export const createRoom = async (req, res) => {
  try{
    const {userId} = req.body;
    const user1 = req.user._id;

    if(!userId){
      return res.status(400).json({
        success: false,
        message: "user2 is required"
      })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user2 ID format'
      });
    }

    const user2 = userId;

    const existingRoom = await userRoom.findOne({
      $or: [
        { user1: user1, user2: user2 },
        { user1: user2, user2: user1 }
      ]
    });

    if (existingRoom) {
      return res.status(200).json({
        success: true,
        message: "Room already exists",
        data: existingRoom
      });
    }

    const newRoom = await userRoom.create({
      user1: user1,
      user2: user2
    })

     const populatedRoom = await userRoom.findById(newRoom._id)
      .populate('user1', 'fullName email mobile')
      .populate('user2', 'fullName email mobile');

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room: populatedRoom,
      isNewRoom: true
    });

  }catch(error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ----> CHAT LIST
export const chatList = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const chats = await userRoom.aggregate([
      {
        $match: {
          $or: [
            { user1: userId },
            { user2: userId },
          ],
        },
      },

      {
        $lookup: {
          from: "userchats",
          let: { roomId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$roomId", "$$roomId"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: "lastMessage",
        },
      },

      { $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true } },

      {
        $addFields: {
          otherUserId: {
            $cond: [
              { $eq: ["$user1", userId] },
              "$user2",
              "$user1",
            ],
          },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "otherUserId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      {
        $lookup: {
          from: "userchats",
          let: { roomId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$roomId", "$$roomId"] },
                    { $eq: ["$receiver", userId] },
                    { $eq: ["$isReaded", false] },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "unreadCount",
        },
      },

      {
        $addFields: {
          unreadCount: {
            $ifNull: [{ $arrayElemAt: ["$unreadCount.count", 0] }, 0],
          },
        },
      },

      {
        $sort: {
          "lastMessage.createdAt": -1,
        },
      },

       {
        $project: {
          roomId: "$_id",
          unreadCount: 1,
          lastMessage: "$lastMessage.message",
          lastMessageType: "$lastMessage.type",
          lastMessageAt: "$lastMessage.createdAt",
          user: {
            _id: "$user._id",
            name: "$user.fullName",
            mobile: "$user.mobile",
          },
        },
      },
    ]);

    res.json({
      success: true,
      count: chats.length,
      data: chats,
    });
  } catch (err) {
    console.error("chatList error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};




//----> GET MESSAGES
export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.query;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid roomId",
      });
    }

    const room = await userRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // authorization
    if (
      room.user1.toString() !== userId.toString() &&
      room.user2.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    };


    await userChat.updateMany(
      {
        roomId,
        receiver: userId,
        isReaded: false
      },
      {
        $set: { isReaded: true }
      }
    )

  

    await room.save();


    const messages = await userChat.find({
      roomId,
      deletedBy: { $ne: userId },
    })
    .sort({ createdAt: -1 })
    .populate("sender", "fullName email mobile")
    .populate("receiver", "fullName email mobile")
    .lean();

    const formattedMessages = messages.map((msg) => ({
      _id: msg._id,
      roomId: msg.roomId,
      message: msg.message,
      type: msg.type,
      createdAt: msg.createdAt,
      isSender: msg.sender._id.toString() === userId.toString(),
      sender: {
        _id: msg.sender._id,
        name: msg.sender.fullName,
        email: msg.sender.email,
        mobile: msg.sender.mobile,
      },
      receiver: {
        _id: msg.receiver._id,
        name: msg.receiver.fullName,
        email: msg.receiver.email,
        mobile: msg.receiver.mobile,
      },
    }));

    const otherUserId =
      room.user1.toString() === userId.toString()
        ? room.user2
        : room.user1;


    res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      data: {
        roomId,
        messages: formattedMessages,
        otherUserId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// DELETE MESSAGE
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.query;
    const userId = req.user._id;

    const message = await userChat.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (!message.deletedBy.includes(userId)) {
      message.deletedBy.push(userId);
      await message.save();
    }


    res.status(200).json({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// UNREAD MESSAGES COUNT

export const unreadCount = async (req, res) => {
  try{
    const userId = new mongoose.Types.ObjectId(req.user._id);;
    console.log('userId: ', userId);


    const unreadData = await userChat.aggregate([
      {
        $match: {
          receiver: userId,
          isReaded: false,
        },
      },
      {
        $group: {
          _id: "$roomId",
          unreadCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          roomId: "$_id",
          unreadCount: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: unreadData,
    });
  }catch(error){
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}