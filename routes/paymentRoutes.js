import express from "express";
import { payment, subscription } from "../controller/index.js";
import { checkAuth } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", checkAuth, payment.Checkout);
router.get("/sub", checkAuth, subscription.createSubscription);
router.post("/update-subscription", checkAuth, subscription.updateSubscription)

export default router;