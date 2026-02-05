import mongoose from "mongoose";
import { socketAuth } from "../middleware/socketAuth.js";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";
import {sendPushNotification} from "../config/firebase.js";
import { userChat, userRoom } from "../models/userChat.js";

const onlineUsers = new Map();
let ioInstance;

export default function sockettt(io) {
  ioInstance = io;
  io.use(socketAuth);

  io.on("connection", async (socket) => {
    const { userId } = socket.user;

    onlineUsers.set(userId.toString(), socket.id);

    console.log("Connected:", userId);

    // JOIN ROOM
    socket.on("join-chat", async ({ roomId, message }) => {
      try {
        if (!roomId) return;

        const userId = socket.user.userId;
        const room = await userRoom.findById(roomId);
        if (!room) return;

        if (
          room.user1.toString() !== userId.toString() &&
          room.user2.toString() !== userId.toString()
        )
          return;

        socket.join(roomId.toString());

        await userChat.updateMany(
          {
            roomId,
            receiver: userId,
            isReaded: false,
          },
          {
            $set: { isReaded: true },
          },
        );

        await room.save();

        io.to(roomId.toString()).emit("receive-message", {
          roomId: roomId,
          message: message,
        });
      } catch (err) {
        console.error("JOIN CHAT ERROR:", err.message);
      }
    });

    //  USER to USER MESSAGE
    // USER to USER MESSAGE
    socket.on(
      "userSend-message",
      async ({ roomId, message, type = "text" }) => {
        try {
          if (!roomId || !message) return;

          const senderId = socket.user.userId;
          const room = await userRoom.findById(roomId);
          if (!room) return;

          if (
            room.user1.toString() !== senderId.toString() &&
            room.user2.toString() !== senderId.toString()
          )
            return;

          const receiverId =
            senderId.toString() === room.user1.toString()
              ? room.user2
              : room.user1;

          socket.join(roomId.toString());

          // 1️⃣ SAVE MESSAGE
          const msg = await userChat.create({
            roomId,
            sender: senderId,
            receiver: receiverId,
            message,
            type,
          });

          room.lastMessage = message;
          room.lastMessageAt = new Date();
          await room.save();

          io.to(roomId.toString()).emit("receive-message", {
            _id: msg._id,
            roomId,
            sender: senderId,
            message,
            type,
            createdAt: msg.createdAt,
          });

          const receiver = await User.findById(receiverId).select("fcmToken");
          console.log('fcmToken: ', receiver.fcmToken);

          const tokens = receiver.fcmToken;

        await sendPushNotification(
          tokens,
          {
            title: "New message",
            body: message,
          },
          {
            roomId: roomId.toString(),
            senderId: senderId.toString(),
          }
        );

          
        } catch (err) {
          console.error("USER-USER CHAT ERROR:", err);
        }
      },
    );

    //  ADMIN → USER
    socket.on("admin-to-user", async ({ toUserId, toMobile, message }) => {
      if (!message || role !== "admin") return;

      try {
        let chat = await Chat.findOne({
          participants: { $all: [toUserId] },
        });

        if (!chat) return;

        chat.messages.push({
          sender: userId,
          message,
        });

        chat.lastMessage = message;
        chat.lastMessageAt = new Date();
        await chat.save();

        io.to(`user:${toMobile}`).emit("receive-message", {
          from: "admin",
          message,
        });
      } catch (err) {
        console.error("ADMIN→USER ERROR:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected:", userId);
    });
  });
}

export function getIO() {
  if (!ioInstance) throw new Error("Socket not initialized");
  return ioInstance;
}
