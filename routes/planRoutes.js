import express from "express";
import {subscription} from "../controller/index.js"
import { checkAuth } from "../middleware/verifyToken.js";
import roleValidation from "../middleware/roleValidation.js";


const router = express.Router()


router.post("/", checkAuth, roleValidation, subscription.createSubscriptionPlan);
router.get("/plans", checkAuth, subscription.getPlans)


export default router;