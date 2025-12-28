const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Product = require("../models/productModel");

// GET /api/products/:id/reviews - Fetch all reviews for a product
router.get("/:id/reviews", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Return reviews sorted by newest first
    const reviews = product.reviews
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(review => ({
        _id: review._id,
        name: review.name || "Anonymous",
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt || new Date(),
        user: review.user
      }));

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/products/:id/reviews - Add a new review
router.post("/:id/reviews", protect, async (req, res) => {
  const { rating, comment } = req.body;

  try {
    // Validation
    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    if (comment.length < 10) {
      return res.status(400).json({ message: "Comment must be at least 10 characters" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (r) => r.user && r.user.toString() === req.user.id
    );
    
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    // Create new review
    const review = {
      name: req.user.name || "Anonymous",
      rating: Number(rating),
      comment: comment.trim(),
      user: req.user.id,
      createdAt: new Date()
    };

    // Add review to product
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    
    // Calculate average rating
    product.rating = (
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length
    ).toFixed(1);

    await product.save();
    
    res.status(201).json({ 
      message: "Review added successfully",
      review: review
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE /api/products/:id/reviews/:reviewId - Delete a review (admin or review owner)
router.delete("/:id/reviews/:reviewId", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user is review owner or admin
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    product.reviews.id(req.params.reviewId).deleteOne();
    product.numReviews = product.reviews.length;
    
    // Recalculate average rating
    if (product.reviews.length > 0) {
      product.rating = (
        product.reviews.reduce((acc, r) => acc + r.rating, 0) /
        product.reviews.length
      ).toFixed(1);
    } else {
      product.rating = 0;
    }

    await product.save();
    
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/products/related/:id - Get related products by category
router.get("/related/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const limit = req.query.limit || 6;
    
    // Find related products by category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    })
      .limit(parseInt(limit))
      .select("_id name price image rating reviews category");

    res.status(200).json(relatedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
