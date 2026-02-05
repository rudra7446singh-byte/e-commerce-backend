import Chat from "../models/chatModel.js";

// export default function chatSocket(io) {
//   io.on("connection", (socket) => {
//     const { userId, role } = socket.user;

//     console.log("Socket connected:", userId, role);

//     // Each user has ONE room = userId
//     socket.join(userId.toString());

//     // USER → ADMIN
//     socket.on("user-send-message", async ({ message }) => {
//       if (!message) return;

//       let chat = await Chat.findOne({ user: userId });

//       if (!chat) {
//         chat = await Chat.create({
//           user: userId,
//           messages: [],
//         });
//       }

//       chat.messages.push({
//         sender: userId,
//         senderRole: "user",
//         message,
//       });

//       chat.lastMessage = message;
//       chat.lastMessageAt = new Date();

//       await chat.save();

//       io.to(userId.toString()).emit("receive-message", {
//         from: "user",
//         message,
//       });
//     });

//     // ADMIN → USER
//     socket.on("admin-send-message", async ({ targetUserId, message }) => {
//       if (role !== "admin") return;
//       if (!targetUserId || !message) return;

//       let chat = await Chat.findOne({ user: targetUserId });

//       if (!chat) return;

//       chat.messages.push({
//         sender: userId,
//         senderRole: "admin",
//         message,
//       });

//       chat.lastMessage = message;
//       chat.lastMessageAt = new Date();

//       await chat.save();

//       io.to(targetUserId.toString()).emit("receive-message", {
//         from: "admin",
//         message,
//       });
//     });

//     socket.on("disconnect", () => {
//       console.log("Disconnected:", userId);
//     });
//   });
// }



//  CHAT LIST OF ADMIN

export const chatList = async (req, res) => {
  try {
    const lastChats = await Chat.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          user: {
            _id: "$user._id",
            name: "$user.firstName",
            email: "$user.email"
          },
          lastMessage: 1,
          // updatedAt: 1
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: lastChats.length,
      data: lastChats
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

