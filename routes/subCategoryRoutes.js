import { Router } from "express";
import { SubCategory } from "../controller/index.js";
import { checkAuth } from "../middleware/verifyToken.js";
import roleValidation from "../middleware/roleValidation.js";


const router = Router()

router.get("/", checkAuth, SubCategory.getAllSubCategory);
router.post("/create", checkAuth, roleValidation, SubCategory.createSubCategory);
router.put("/update/:id", checkAuth, roleValidation, SubCategory.updateSubCategory);
router.get("/search/:slug", checkAuth, SubCategory.searchSubCategoryByName)
router.get("/bycategory/:id", checkAuth, SubCategory.findByCategoryId)
router.get("/get/:id", checkAuth, SubCategory.getSubCategoryById);
router.delete("/delete/:id", checkAuth, roleValidation, SubCategory.deleteCategory);

export default router;