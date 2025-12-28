const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Product = require("./models/Product");   // ✅ model
const products = require("./data/products");   // ✅ product data
require("dotenv").config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // ===== ADMIN USER =====
    await User.deleteOne({ email: "admin@flowtoo.com" });

    const hashedPassword = await bcrypt.hash("admin@123", 10);

    const adminUser = new User({
      email: "admin@flowtoo.com",
      password: hashedPassword,
      role: "admin",
    });

    await adminUser.save();
    console.log("✅ Admin created successfully");

    // ===== PRODUCTS =====
    await Product.deleteMany(); // clear old products
    await Product.insertMany(products);
    console.log('✅ ${products.length} products seeded successfully');

    process.exit();
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
};

seedData();