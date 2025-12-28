const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  addAddress,
  updateAddress,
  deleteAddress,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Profile
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Wishlist
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist/:productId", protect, addToWishlist);
router.delete("/wishlist/:productId", protect, removeFromWishlist);

// Addresses
router.post("/addresses", protect, addAddress);
router.put("/addresses/:addrId", protect, updateAddress);
router.delete("/addresses/:addrId", protect, deleteAddress);

// Password reset
router.post("/forgot", forgotPassword);
router.post("/reset/:token", resetPassword);

module.exports = router;