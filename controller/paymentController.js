import stripe from "../config/stripe.js";
import Product from "../models/productModel.js"
import Order from "../models/orderModel.js";

export const Checkout = async (req, res) => {
    try{
        const userId = req.user._id;
        const { productId } = req.query;

        const product = await Product.findById(productId);
        if(!productId) {
            return res.status(400).json({
                message: "product not found"
            })
        };

        const order = await Order.create({
            user: userId,
            product: product._id,
            amount: product.price,
        });


    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],

        line_items: [
            {
            price_data: {
                currency: "inr",
                product_data: {
                name: product.title,
                description: product.description,
                // image: product.images[0],
                },
                unit_amount: product.price * 100,
            },
            quantity: 1,
            },
        ],

        metadata: {
            orderId: order._id.toString(),
            userId: userId.toString(),
        },


        success_url: "https://localhost:3030/payment/success",
        cancel_url: "https://localhost:3030/payment/cancel",
    });

    order.stripeSessionId = session.id;
    await order.save();



    res.json({
      paymentUrl: session.url,
    });

    }catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}