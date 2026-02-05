import mongoose from "mongoose";


const subscriptionSchema = new mongoose.Schema({
    User: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    plan: {
        type: mongoose.Types.ObjectId,
        ref: "Plan"
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    priceId: String,
    productId: String,
    interval: String,
    amount: Number,
    currency: String,
    status: {
        type: String, 
        enum: ["PENDING", "ACTIVE", "PAST_DUE", "EXPIRED"],
        default: "PENDING",
    },
    currentPeriodEnd: Date,
},
 { timestamps: true }
)

export default mongoose.model("Subscription", subscriptionSchema);