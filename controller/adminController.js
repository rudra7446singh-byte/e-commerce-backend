import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";
import admin from "../config/firebase.js";


export const sendAdminChat = async (req, res) => {
    try{
        const userId = req.user.id;
        const message = req.body;
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}