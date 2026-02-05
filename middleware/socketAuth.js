import jwt from "jsonwebtoken";
import User from "../models/userModel.js"

export const socketAuth = async (socket, next) => {
  //  console.log('socket: ', socket);
  try {
    let token =
      socket.handshake.headers?.token ;
      // socket.handshake.auth?.token;

    if (!token) return next(new Error("Token missing"));

    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    // console.log('decoded------------------: ', decoded);

    const findUser = await User.findById(decoded._id);
    // console.log("findUser: ", findUser);

    socket.user = {
      userId: decoded._id,
      role: findUser.role,
      mobile: findUser.mobile,
    };

    next();
  } catch {
    next(new Error("Invalid token"));
  }
};
