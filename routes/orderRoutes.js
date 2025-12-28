const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const payfastController = require("../controllers/payfastController");
const stripeController = require("../controllers/stripeController");
const { protect, admin } = require("../middleware/authMiddleware");

// User
router.post("/", protect, orderController.createOrder);
router.get("/myorders", protect, orderController.getMyOrders);
router.post("/:id/pay", protect, orderController.payOrder);
router.get("/:id/payfast", protect, payfastController.payfastInit);
router.post("/:id/stripe", protect, stripeController.createCheckoutSession);

// Admin
router.get("/", protect, admin, orderController.getOrders);
router.put("/:id/deliver", protect, admin, orderController.markDelivered);
router.delete("/:id", protect, admin, orderController.deleteOrder);

// PayFast IPN
router.post("/payfast/ipn", express.raw({ type: "*/*" }), payfastController.payfastIPN);

// Stripe Webhook
router.post("/stripe/webhook", express.raw({ type: "application/json" }), stripeController.stripeWebhook);

module.exports = router;