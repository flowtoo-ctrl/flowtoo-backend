const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mockProducts = require("./mockData");

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// In-memory storage for demo
let products = JSON.parse(JSON.stringify(mockProducts));
let users = [];
let orders = [];

// ============ HEALTH CHECK ============
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Flowtoo API is running (MOCK MODE)",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => res.send("Flowtoo API running (MOCK MODE) ✅"));

// ============ PRODUCT ROUTES ============

// GET /api/products - Get all products
app.get("/api/products", (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12 } = req.query;
    
    let filtered = [...products];
    
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (sort === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    }
    
    const skip = (page - 1) * limit;
    const paginatedProducts = filtered.slice(skip, skip + parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: paginatedProducts,
      pagination: {
        total: filtered.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(filtered.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id - Get single product
app.get("/api/products/:id", (req, res) => {
  try {
    const product = products.find(p => p._id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products/:id/reviews - Add review
app.post("/api/products/:id/reviews", (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: "Rating and comment required" });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be 1-5" });
    }
    
    if (comment.length < 10) {
      return res.status(400).json({ success: false, message: "Comment too short" });
    }
    
    const product = products.find(p => p._id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    const review = {
      _id: "r" + Date.now(),
      name: "Guest User",
      rating: parseInt(rating),
      comment: comment.trim(),
      createdAt: new Date()
    };
    
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = (
      product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    ).toFixed(1);
    
    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id/reviews - Get reviews
app.get("/api/products/:id/reviews", (req, res) => {
  try {
    const product = products.find(p => p._id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    const reviews = product.reviews
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(r => ({
        _id: r._id,
        name: r.name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt
      }));
    
    res.status(200).json({
      success: true,
      data: reviews,
      total: reviews.length,
      averageRating: product.rating
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id/related - Get related products
app.get("/api/products/:id/related", (req, res) => {
  try {
    const product = products.find(p => p._id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    const limit = req.query.limit || 6;
    
    const related = products
      .filter(p => p.category === product.category && p._id !== product._id)
      .slice(0, parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: related
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ AUTH ROUTES (MOCK) ============

// POST /api/auth/register
app.post("/api/auth/register", (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }
    
    const user = {
      _id: "user" + Date.now(),
      name,
      email,
      role: "user"
    };
    
    users.push(user);
    
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: "mock-token-" + Date.now(),
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }
    
    const user = {
      _id: "user" + Date.now(),
      name: "Demo User",
      email,
      role: "user"
    };
    
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: "mock-token-" + Date.now(),
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ORDERS ROUTES (MOCK) ============

// POST /api/orders
app.post("/api/orders", (req, res) => {
  try {
    const order = {
      _id: "order" + Date.now(),
      ...req.body,
      createdAt: new Date(),
      status: "pending"
    };
    
    orders.push(order);
    
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders
app.get("/api/orders", (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ 404 HANDLER ============
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Route not found" 
  });
});

// ============ ERROR HANDLER ============
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Server error",
    error: err.message
  });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n✅ Flowtoo API Server running on http://localhost:${PORT}`);
  console.log(`📝 Mode: MOCK (No database required)`);
  console.log(`🔗 CORS enabled for: http://localhost:3000\n`);
});

module.exports = app;
