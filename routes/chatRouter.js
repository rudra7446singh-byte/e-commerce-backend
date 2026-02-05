import { Router } from "express";
import { chat } from "../controller/index.js";
import roleValidation from "../middleware/roleValidation.js";
import { checkAuth } from "../middleware/verifyToken.js";


const router = Router()

router.get("/chatlist", checkAuth, roleValidation, chat.chatList)

export default router;