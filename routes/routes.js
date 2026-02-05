import express from "express"
import { register, verifyOtp, login, profile } from "../controller/controller.js"
import { checkAuth } from "../middleware/verifyToken.js";
import categoryRoute from "./categoryRoutes.js";
import productRoutes from "./productRoutes.js";
import subCategoryRoutes from "./subCategoryRoutes.js"
import dashboardRoutes from "./dashboardRoutes.js"
import chatRouters from "./chatRouter.js"
import userchat from "./userChat.js"
import paymentRouter from "./paymentRoutes.js"
import planRouter from "./planRoutes.js"

const router = express.Router();


router.post("/", register);
router.post("/otp", verifyOtp);
router.post("/login", login);
router.get("/profile", checkAuth, profile)
router.use("/category", categoryRoute);
router.use("/subcategory", subCategoryRoutes)
router.use("/product", productRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/chat", chatRouters)
router.use("/userchat", userchat)
router.use("/order", paymentRouter)
router.use("/plan", planRouter)

export default router;
