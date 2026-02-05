import stripe from "../config/stripe.js"
import Subscription from "../models/subscriptionModel.js";
import Plan from "../models/planModel.js";
import User from "../models/userModel.js"


export const createSubscriptionPlan = async (req, res) => {
    try {

    const { name, amount, currency, interval } = req.body;

    // 1. Validate
    if (!name || !amount || !currency || !interval) {
      return res.status(400).json({ message: "Missing required fields" });
    }


    const allowedIntervals = ["day", "week", "month", "year"]
    if (!allowedIntervals.includes(interval)) {
      return res.status(400).json({ message: "Invalid interval" });
    }

    // 2. Create Stripe product
    const product = await stripe.products.create({
      name,
    });

    // 3. Create Stripe price
    const price = await stripe.prices.create({
      unit_amount: amount * 100,
      currency,
      recurring: { interval },
      product: product.id,
    });

    // 4. Save plan in DB
    const plan = await Plan.create({
      name,
      priceId: price.id,
      productId: product.id,
      interval,
      amount,
      currency,
    });

    res.status(201).json({
      success: true,
      plan,
    });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


export const getPlans = async (req, res) => {
    try{
        const plans = await Plan.find().sort({amount: 1});

        return res.status(400).json({
            success: true,
            data: plans,
        })
    }catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


export const createSubscription = async (req, res) => {
    try {
        const userId = req.user._id;
        const { planId } = req.body;

        if (!planId) {
        return res.status(400).json({ message: "planId is required" });
        }

        // Get plan by _id
        const plan = await Plan.findById(planId);
        if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
        }

        //existing subscription
        const existingSub = await Subscription.findOne({
            User: userId,
            status: { $in: ["ACTIVE", "PAST_DUE", "PENDING"] },
        })

        if(existingSub) {
            if (existingSub.priceId === plan.priceId) {
            return res.status(400).json({
            message: "You already have this subscription plan",
            });
        }

         return res.status(400).json({
            message: "Subscription already exists. Use upgrade instead.",
        });
    }

        // Get or create Stripe customer
        const user = await User.findById(userId);

        let stripeCustomerId = user.stripeCustomerId;


        if(stripeCustomerId) {
            try {
                await stripe.customers.retrieve(stripeCustomerId);
            } catch (err) {
                stripeCustomerId = null; 
            }
        }

        if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            metadata: { userId: userId.toString() }
        });

        stripeCustomerId = customer.id;
        user.stripeCustomerId = stripeCustomerId;
        await user.save();
        }

         const existingPending = await Subscription.findOne({
            User: userId,
            status: "PENDING",
        });

        if (existingPending) {
            return res.status(400).json({
                message: "You already have a pending subscription",
            });
        }

        // Create Stripe Checkout session
         const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer: stripeCustomerId,
            payment_method_types: ["card"],
            line_items: [
                {
                price: plan.priceId,
                quantity: 1,
                },
            ],
            metadata: {
                userId: userId.toString(),
                planId: plan._id.toString(),
            },
            success_url: "http://localhost:3030/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url: "http://localhost:3030/cancel",
            });

            // 7️⃣ Save subscription as PENDING
            await Subscription.create({
            User: userId,
            plan: plan._id,
            stripeCustomerId,
            priceId: plan.priceId,
            productId: plan.productId,
            interval: plan.interval,
            amount: plan.amount,
            currency: plan.currency,
            status: "PENDING",
            });

        return res.status(200).json({
        success: true,
        checkoutUrl: session.url
        });

    } catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}



// UPDATE SUBSCRIPTION 

export const updateSubscription = async (req, res) => {
    try{
        const userId = req.user._id;
        const { newPlanId } = req.body;

        if(!newPlanId) {
            return res.status(400).json({
                success: false,
                message: "PLAN ID required",
            })
        }

        const subscription = await Subscription.findOne({
      User: userId,
      status: "ACTIVE",
    });

    if (!subscription) {
      return res.status(400).json({
        message: "No active subscription found",
      });
    }

    //    GET NEW PLAN
    const newPlan = await Plan.findById(newPlanId);
    if (!newPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    console.log(newPlan);

    //    SAME PLAN CHECK
    if (subscription.priceId === newPlan.priceId) {
      return res.status(400).json({
        message: "You are already on this plan",
      });
    }

    //    RETRIEVE STRIPE SUBSCRIPTION
    const stripeSub = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    //    UPDATE STRIPE SUBSCRIPTION
 const updatedSub = await stripe.subscriptions.update(
      stripeSub.id,
      {
        items: [
          {
            id: stripeSub.items.data[0].id,
            price: newPlan.priceId,
          },
        ],
        proration_behavior: "create_prorations",
        billing_cycle_anchor: "now",
        payment_behavior: "error_if_incomplete",
        expand: ["latest_invoice.payment_intent"],
        metadata: {
            userId: userId.toString(),
            newPlanId: newPlan._id.toString(),
            type: "PLAN_UPGRADE",
        },
      },
    );

    console.log(updatedSub);
    // 5️⃣ Get hosted invoice payment URL
    const invoice = await stripe.invoices.retrieve(
      updatedSub.latest_invoice.id
    );

    // 6️⃣ Update local DB (pending until webhook confirms)
    await Subscription.findByIdAndUpdate(subscription._id, {
      plan: newPlan._id,
      priceId: newPlan.priceId,
      productId: newPlan.productId,
      interval: newPlan.interval,
      amount: newPlan.amount,
      currency: newPlan.currency,  
      status: "PENDING",
    //    currentPeriodEnd: new Date(
    //     updatedSub.current_period_end * 1000
    //   ), 
    });

    return res.status(200).json({
      success: true,
      checkoutUrl: invoice.hosted_invoice_url,      
    });
    }catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}