// controllers/payfastController.js
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const { generatePayFastUrl } = require("../utils/payfast");

// GET /api/orders/:id/payfast  (protected)
exports.payfastInit = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.isPaid) return res.status(400).json({ message: "Order already paid" });

    const user = await User.findById(order.user);

    const url = generatePayFastUrl(order, user);
    // mark as waiting for payment
    order.status = "payment_pending";
    await order.save();

    res.json({ payfastUrl: url });
  } catch (err) {
    res.status(500).json({ message: "Payment init failed", error: err.message });
  }
};

// POST /api/orders/payfast/ipn  (public listener; PayFast will call this)
exports.payfastIPN = async (req, res) => {
  try {
    // PayFast sends urlencoded body. We receive raw and parse via req.body (express.raw used on route)
    const bodyString = req.body.toString();
    const params = bodyString
      .split("&")
      .map((p) => p.split("="))
      .reduce((acc, [k, v]) => {
        acc[k] = decodeURIComponent(v);
        return acc;
      }, {});

    const m_payment_id = params.m_payment_id;
    const payment_status = params.payment_status;
    const pf_payment_id = params.pf_payment_id;

    const order = await Order.findById(m_payment_id);
    if (!order) {
      res.status(200).send("INVALID ORDER");
      return;
    }

    // NOTE: In production you MUST validate the IPN with PayFast (POST back) and verify signature.
    // For sandbox/testing this will suffice to change order status based on payment_status.
    if (payment_status === "COMPLETE") {
      order.isPaid = true;
      order.paidAt = new Date();
      order.status = "paid";
      order.paymentMethod = "PayFast";
      order.paymentResult = {
        id: pf_payment_id,
        status: payment_status,
        raw: params,
      };
      await order.save();
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("IPN error:", err);
    res.status(500).send("ERROR");
  }
};