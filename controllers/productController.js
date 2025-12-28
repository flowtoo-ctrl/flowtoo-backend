const Product = require("../models/productModel");

// GET /api/products - Get all products with filtering and pagination
exports.getProducts = async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12 } = req.query;
    
    // Build filter object
    let filter = { isActive: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    
    // Build sort object
    let sortObj = { createdAt: -1 };
    if (sort === "price-low") {
      sortObj = { price: 1 };
    } else if (sort === "price-high") {
      sortObj = { price: -1 };
    } else if (sort === "rating") {
      sortObj = { rating: -1 };
    } else if (sort === "newest") {
      sortObj = { createdAt: -1 };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    
    // Get products
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .select("_id name price image rating numReviews category");
    
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

// GET /api/products/:id - Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("reviews.user", "name email");
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

// POST /api/products - Create new product (admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, image, description, brand, category, price, countInStock } = req.body;
    
    // Validation
    if (!name || !image || !description || !brand || !category || !price) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide all required fields" 
      });
    }
    
    const product = new Product({
      name,
      image,
      description,
      brand,
      category,
      price,
      countInStock: countInStock || 0
    });
    
    await product.save();
    
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

// PUT /api/products/:id - Update product (admin)
exports.updateProduct = async (req, res) => {
  try {
    const { name, image, description, brand, category, price, countInStock } = req.body;
    
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }
    
    // Update fields
    if (name) product.name = name;
    if (image) product.image = image;
    if (description) product.description = description;
    if (brand) product.brand = brand;
    if (category) product.category = category;
    if (price) product.price = price;
    if (countInStock !== undefined) product.countInStock = countInStock;
    
    await product.save();
    
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

// DELETE /api/products/:id - Delete product (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

// POST /api/products/:id/reviews - Create review for product
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    // Validation
    if (!rating || !comment) {
      return res.status(400).json({ 
        success: false,
        message: "Rating and comment are required" 
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false,
        message: "Rating must be between 1 and 5" 
      });
    }
    
    if (comment.length < 10) {
      return res.status(400).json({ 
        success: false,
        message: "Comment must be at least 10 characters" 
      });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }
    
    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user && r.user.toString() === req.user.id
    );
    
    if (alreadyReviewed) {
      return res.status(400).json({ 
        success: false,
        message: "You have already reviewed this product" 
      });
    }
    
    // Create review
    const review = {
      name: req.user.name || "Anonymous",
      rating: Number(rating),
      comment: comment.trim(),
      user: req.user.id,
      createdAt: new Date()
    };
    
    product.reviews.push(review);
    
    // Update rating
    const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.rating = parseFloat((sum / product.reviews.length).toFixed(1));
    product.numReviews = product.reviews.length;
    
    await product.save();
    
    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: review
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// GET /api/products/:id/related - Get related products
exports.getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }
    
    const limit = req.query.limit || 6;
    
    // Find related products by category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true
    })
      .limit(parseInt(limit))
      .select("_id name price image rating numReviews category");
    
    res.status(200).json({
      success: true,
      data: relatedProducts
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// GET /api/products/:id/reviews - Get product reviews
exports.getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }
    
    // Sort reviews by newest first
    const reviews = product.reviews
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(review => ({
        _id: review._id,
        name: review.name || "Anonymous",
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt || new Date()
      }));
    
    res.status(200).json({
      success: true,
      data: reviews,
      total: reviews.length,
      averageRating: product.rating
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// DELETE /api/products/:id/reviews/:reviewId - Delete review
exports.deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }
    
    const review = product.reviews.id(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: "Review not found" 
      });
    }
    
    // Check authorization
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to delete this review" 
      });
    }
    
    product.reviews.id(req.params.reviewId).deleteOne();
    
    // Update rating
    if (product.reviews.length > 0) {
      const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
      product.rating = parseFloat((sum / product.reviews.length).toFixed(1));
    } else {
      product.rating = 0;
    }
    
    product.numReviews = product.reviews.length;
    
    await product.save();
    
    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};
