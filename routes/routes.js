import express from "express"
import { register, verifyOtp, login, profile } from "../controller/controller.js"
import { checkAuth } from "../middleware/verifyToken.js";
import categoryRoute from "./categoryRoutes.js";
import productRoutes from "./productRoutes.js";
import subCategoryRoutes from "./subCategoryRoutes.js"
import dashboardRoutes from "./dashboardRoutes.js"

const router = express.Router();


router.post("/", register);
router.post("/otp", verifyOtp);
router.post("/login", login);
router.get("/profile", checkAuth, profile)
router.use("/category", categoryRoute);
router.use("/subcategory", subCategoryRoutes)
router.use("/product", productRoutes);
router.use("/dashboard", dashboardRoutes);


export default router;
