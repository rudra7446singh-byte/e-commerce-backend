import { Router } from "express";
import {userChat} from "../controller/index.js";
import { checkAuth } from "../middleware/verifyToken.js";
import roleValidation from "../middleware/roleValidation.js";


const router = Router();

router.get("/", checkAuth, userChat.usersList)
router.get("/chatlist", checkAuth, userChat.chatList);
router.post("/createRoom", checkAuth, userChat.createRoom);
router.get("/getmessages", checkAuth, userChat.getMessages);
router.delete("/deletemessage", checkAuth, userChat.deleteMessage)
router.get("/unread", checkAuth, userChat.unreadCount)


export default router;