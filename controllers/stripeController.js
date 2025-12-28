const asyncHandler = require("express-async-handler");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/orderModel");

// Create Stripe Checkout Session
exports.createCheckoutSession = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user");
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.isPaid) return res.status(400).json({ message: "Already paid" });

  const line_items = order.orderItems.map(item => ({
    price_data: {
      currency: "zar",
      product_data: {
        name: item.name,
        images: [item.image],
      },
      unit_amount: Math.round(item.price * 100), // cents
    },
    quantity: item.qty,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    success_url: `\( {process.env.CLIENT_URL || "http://localhost:3000"}/success?orderId= \){order._id}`,
    cancel_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/cancel`,
    metadata: {
      orderId: order._id.toString(),
      userId: req.user._id.toString(),
    },
    customer_email: req.user.email,
  });

  order.paymentMethod = "Stripe";
  order.status = "payment_pending";
  await order.save();

  res.json({ url: session.url });
});

// Stripe Webhook
exports.stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    const order = await Order.findById(orderId);
    if (order) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.status = "paid";
      order.paymentResult = {
        id: session.payment_intent,
        status: session.payment_status,
        update_time: new Date().toISOString(),
        email_address: session.customer_email,
      };
      await order.save();
    }
  }

  res.json({ received: true });
});