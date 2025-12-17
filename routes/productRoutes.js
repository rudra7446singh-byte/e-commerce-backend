import { Router } from "express";
import { productController } from "../controller/index.js";
import { checkAuth } from "../middleware/verifyToken.js";
import roleValidation from "../middleware/roleValidation.js";
import { upload } from "../middleware/multerMiddleware.js";

const router = Router();

router.post("/create", checkAuth, upload.array('images', 10), productController.createProduct);
router.get("/data-user",checkAuth, productController.selfProductById);
router.get("/", checkAuth, productController.getAllProducts);
router.get("/productlist/:query", checkAuth, productController.productByQuery);
router.get("/:id", checkAuth, productController.getProductById);
router.patch("/:productId", checkAuth, productController.updateProduct);
router.delete("/:productId", checkAuth, productController.deleteProduct);
router.post("/upload", checkAuth, upload.array('images', 10), productController.uploadImage);

export default router;
