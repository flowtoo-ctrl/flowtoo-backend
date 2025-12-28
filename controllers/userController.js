const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");

// sendEmail helper
const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
  return info;
};

// Get profile
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// Update profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const { name, email, password } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (password) user.password = password;

  await user.save();
  res.json({ message: "Profile updated" });
});

// Add to wishlist
exports.addToWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const { productId } = req.params;
  if (user.wishlist.includes(productId)) {
    return res.status(400).json({ message: "Already in wishlist" });
  }
  user.wishlist.push(productId);
  await user.save();
  res.json({ message: "Added to wishlist" });
});

// Remove from wishlist
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
  await user.save();
  res.json({ message: "Removed from wishlist" });
});

// Get wishlist
exports.getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate("wishlist");
  res.json(user.wishlist || []);
});

// Add address
exports.addAddress = asyncHandler(async (req, res) => {
  const { label, address, city, postalCode, country } = req.body;
  const user = await User.findById(req.user.id);
  user.addresses.push({ label, address, city, postalCode, country });
  await user.save();
  res.status(201).json({ message: "Address added", addresses: user.addresses });
});

// Update address
exports.updateAddress = asyncHandler(async (req, res) => {
  const { addrId } = req.params;
  const user = await User.findById(req.user.id);
  const addr = user.addresses.id(addrId);
  if (!addr) return res.status(404).json({ message: "Address not found" });

  addr.set(req.body);
  await user.save();
  res.json({ message: "Address updated", addresses: user.addresses });
});

// Delete address
exports.deleteAddress = asyncHandler(async (req, res) => {
  const { addrId } = req.params;
  const user = await User.findById(req.user.id);
  const addr = user.addresses.id(addrId);
  if (!addr) return res.status(404).json({ message: "Address not found" });

  addr.remove();
  await user.save();
  res.json({ message: "Address removed", addresses: user.addresses });
});

// Forgot password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(200).json({ message: "If that email exists, a reset link will be sent." });

  const token = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  const resetUrl = `\( {process.env.CLIENT_URL}/reset-password/ \){token}`;
  const subject = "Flowtoo password reset";
  const text = `You requested a password reset. Click the link to reset: ${resetUrl}\n\nIf you didn't request, ignore this email.`;
  const html = `<p>You requested a password reset.</p><p><a href="${resetUrl}">Click here to reset your password</a></p>`;

  try {
    await sendEmail({ to: user.email, subject, text, html });
    res.json({ message: "If that email exists, a reset link will be sent." });
  } catch (err) {
    console.error("Email send error:", err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(500).json({ message: "Failed to send reset email" });
  }
});

// Reset password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Token invalid or expired" });

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
});