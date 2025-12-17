import { Router } from "express";
import { category } from "../controller/index.js";
import { checkAuth } from "../middleware/verifyToken.js";
import roleValidation from "../middleware/roleValidation.js";

const router = Router();

router.get("/", checkAuth, category.getCategories);
router.post("/create", checkAuth, roleValidation, category.createCategory);
router.get("/get/:id", checkAuth, category.getCategoryById);
router.get("/search/:slug", checkAuth, category.getCategoryBySlug);
router.put("/update/:id", checkAuth, roleValidation, category.updateCategory);
router.delete("/delete/:id", checkAuth, roleValidation, category.deleteCategory);

export default router;
