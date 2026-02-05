// // import express from "express";
// // import stripe from "../config/stripe.js";
// // import Order from "../models/orderModel.js";
// // import Subscription from "../models/subscriptionModel.js";
// // import Transaction from "../models/transactionModel.js"

// // const router = express.Router();

// // router.post(
// //   "/webhook",
// //   express.raw({ type: "application/json" }),
// //   async (req, res) => {
// //     const sig = req.headers["stripe-signature"];
// //     console.log('sig: ', sig);

// //     let event;
// //     try {
// //       event = stripe.webhooks.constructEvent(
// //         req.body,
// //         sig,
// //         process.env.STRIPE_WEBHOOK_SECRET
// //       );
// //     } catch (err) {
// //       console.error(" Signature error:", err.message);
// //       return res.status(400).send(err.message);
// //     }

// //     // console.log("EVENT:", event);

// //     console.log("event-------------", event.type);


// //     if (event.type === "checkout.session.completed") {
// //       const session = event.data.object;

// //     //   console.log("SESSION METADATA:", session.metadata);
// //     // console.log( "subscription", session.subscription)



// //       const userId = session.metadata?.userId;
// //       const orderId = session.metadata?.orderId;
// //       const Subscription = session?.subscription;
// //       console.log('Subscription  ---------------------------: ', Subscription);

// //       // if (!orderId) {
// //       //   console.error("orderId missing in metadata");
// //       //   return res.status(200).json({ received: true });
// //       // }

// //       if(orderId) {
// //           await Order.findByIdAndUpdate(orderId, {
// //           paymentStatus: "PAID",
// //         });
// //       }
// //       if(Subscription) {
// //         await Subscription.findOneAndUpdate(Subscription, {
// //           status: "PAID",
// //         })
// //       }

// //       const tttt = await Transaction.create({
// //         user: userId,
// //         order: orderId || Subscription,
// //         stripeSessionId: session.id,
// //         paymentIntentId: session.payment_intent,
// //         amount: session.amount_total / 100,
// //         currency: session.currency,
// //         status: "SUCCESS",
// //     });

// //     // console.log("--------------------------->>>>>>>>   transaction", tttt);
// //     }


// //     if(event.type === "checkout.session.payment_failed"){
// //         const session = event.data.object;


// //       const userId = session.metadata?.userId;
// //       const orderId = session.metadata?.orderId;
// //       if (!orderId) {
// //         console.error("orderId missing in metadata");
// //         return res.status(200).json({ received: true }); 
// //       }

// //       await Order.findByIdAndUpdate(orderId, {
// //         paymentStatus: "PENDING",
// //       });

// //         await Transaction.create({
// //         user: userId,
// //         order: orderId,
// //         stripeSessionId: session.id,
// //         paymentIntentId: session.payment_intent,
// //         amount: session.amount_total / 100,
// //         currency: session.currency,
// //         status: "FAILED",
// //     });

// //     }

// //     res.json({ received: true });
// //   }
// // );


// // export default router;


import express from "express";
import stripe from "../config/stripe.js";
import Order from "../models/orderModel.js";
import Subscription from "../models/subscriptionModel.js";
import Transaction from "../models/transactionModel.js";

const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("Stripe Event:", event.type);


      //  CHECKOUT COMPLETED
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata || {};

      // PRODUCT PAYMENT
      if (session.mode === "payment") {
        const orderId = metadata?.orderId;

        if (orderId) {
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: "PAID",
          });
        }

        await Transaction.create({
          user: metadata.userId,
          order: orderId,
          stripeSessionId: session.id,
          paymentIntentId: session.payment_intent,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency,
          status: "SUCCESS",
          type: "PRODUCT",
        });
      }


      console.log('session.subscription: ', session.subscription);
      console.log(session.mode);


      //  SUBSCRIPTION PAYMENT 
      if (session.mode === "subscription") {
        try {
          const stripeSubscriptionId = session.subscription;
          // const invoice = event.data?.object;
          // const line = invoice.lines.data[0];


          const stripeSub = await stripe.subscriptions.retrieve(
            stripeSubscriptionId
          );

          const updateSub = await Subscription.findOneAndUpdate(
            { stripeCustomerId: session.customer },
            {
              stripeSubscriptionId,
              status: "ACTIVE",
            },
          );

          console.log("Updated subscription:", updateSub);
        } catch (err) {
          console.error("SUBSCRIPTION WEBHOOK ERROR:", err.message);
        }
      }

      


      //  SUBSCRIPTION RENEWAL
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      const line = invoice.lines.data[0];
      
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: invoice.subscription },
        {
          status: "ACTIVE",
          currentPeriodEnd: new Date(
          line.period.end * 1000)
        }
      );
    }


      //  SUBSCRIPTION FAILED
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;

      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: invoice.subscription },
        { status: "PAST_DUE" }
      );
    }


      if (event.type === "customer.subscription.deleted") {
        const sub = event.data.object;

        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: sub.id },
          { status: "EXPIRED" }
        );
      }

    res.json({ received: true });
  }}
);

export default router;


