import { Router } from "express";
import { dashboard } from "../controller/index.js";
import roleValidation from "../middleware/roleValidation.js";
import { checkAuth } from "../middleware/verifyToken.js";

const router = Router();

router.get("/", checkAuth, roleValidation, dashboard.getDashboard);
router.get("/user", checkAuth, roleValidation, dashboard.getUserData);
router.get("/category", checkAuth, roleValidation, dashboard.getCategory);
router.get("/subcategory", checkAuth, roleValidation, dashboard.getSubcategory);
router.get("/product", checkAuth, roleValidation, dashboard.getProducts);
router.get("/total", checkAuth, roleValidation, dashboard.getTotal);

export default router;
