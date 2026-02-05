import User from "../models/userModel.js";
import admin from "../config/firebase.js";

export const sendChatNotification = async (
  senderId,
  receiverId,
  message,
  roomId
) => {
  const receiver = await User.findById(receiverId).select("fcmToken fullName");

  if (!receiver?.fcmToken?.length) return;

  await admin.messaging().sendMulticast({
    tokens: receiver.fcmToken,
    notification: {
      title: "New message",
      body: message,
    },
    data: {
      type: "chat",
      roomId: roomId.toString(),
      senderId: senderId.toString(),
    },
  });
};
