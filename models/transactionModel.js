import mongoose from "mongoose";

export const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    type: String,
    stripeSessionId: String,
    paymentIntentId: String,
    amount: Number,
    currency: String,
    status: {
        type: String,
        enum: ["SUCCESS", "FAILED"],
        default: "SUCCESS",
    } 
},
 { timestamps: true })

 export default mongoose.model("Transaction", transactionSchema)