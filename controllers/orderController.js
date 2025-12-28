const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

// Create order
exports.createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: "No order items" });
  }

  // Check stock
  for (let item of orderItems) {
    const product = await Product.findById(item.product);
    if (product.countInStock < item.qty) {
      return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
    }
  }

  const order = new Order({
    user: req.user.id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice: taxPrice || 0,
    totalPrice,
  });

  const created = await order.save();
  res.status(201).json(created);
});

// Get my orders
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).populate("orderItems.product", "name image");
  res.json(orders);
});

// Get all orders (admin)
exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "name email");
  res.json(orders);
});

// Mark delivered (admin)
exports.markDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  const updated = await order.save();
  res.json(updated);
});

// Delete order (admin)
exports.deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  await order.deleteOne();
  res.json({ message: "Order removed" });
});

// Pay order
exports.payOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const paymentResult = req.body.paymentResult || {};

  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentResult = {
    id: paymentResult.id || paymentResult.transactionId || null,
    status: paymentResult.status || "COMPLETED",
    update_time: paymentResult.update_time || new Date().toISOString(),
    email_address:
      paymentResult.email_address || (paymentResult.payer && paymentResult.payer.email_address) || null,
    raw: paymentResult.raw || paymentResult,
  };

  const updated = await order.save();
  res.json(updated);
});