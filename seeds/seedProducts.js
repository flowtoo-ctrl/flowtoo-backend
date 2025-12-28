require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/productModel");

const connectDB = require("../config/db");

const sampleProducts = [
  {
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and professionals.",
    brand: "AudioTech",
    category: "Electronics",
    price: 1299,
    countInStock: 50,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    rating: 4.5,
    numReviews: 128,
    isActive: true,
    reviews: []
  },
  {
    name: "Smart Watch Pro",
    description: "Advanced smartwatch with health monitoring, fitness tracking, and 7-day battery life. Features heart rate monitor, sleep tracker, and water resistance.",
    brand: "TechWear",
    category: "Electronics",
    price: 2499,
    countInStock: 35,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
    rating: 4.7,
    numReviews: 256,
    isActive: true,
    reviews: []
  },
  {
    name: "Professional Camera",
    description: "24MP mirrorless camera with 4K video recording, advanced autofocus, and weather-sealed body. Ideal for photographers and videographers.",
    brand: "VisualPro",
    category: "Electronics",
    price: 4999,
    countInStock: 20,
    image: "https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=500&h=500&fit=crop",
    rating: 4.8,
    numReviews: 189,
    isActive: true,
    reviews: []
  },
  {
    name: "Ergonomic Office Chair",
    description: "Premium ergonomic office chair with lumbar support, adjustable armrests, and breathable mesh. Perfect for long work sessions.",
    brand: "ComfortSeating",
    category: "Furniture",
    price: 3499,
    countInStock: 25,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop",
    rating: 4.6,
    numReviews: 142,
    isActive: true,
    reviews: []
  },
  {
    name: "Mechanical Gaming Keyboard",
    description: "RGB mechanical keyboard with Cherry MX switches, customizable lighting, and aluminum frame. Perfect for gaming and typing.",
    brand: "GameGear",
    category: "Electronics",
    price: 1599,
    countInStock: 45,
    image: "https://images.unsplash.com/photo-1587829191301-4e8d30a42b48?w=500&h=500&fit=crop",
    rating: 4.7,
    numReviews: 203,
    isActive: true,
    reviews: []
  },
  {
    name: "4K Monitor",
    description: "32-inch 4K monitor with HDR support, 144Hz refresh rate, and USB-C connectivity. Perfect for creative professionals and gamers.",
    brand: "DisplayMax",
    category: "Electronics",
    price: 5999,
    countInStock: 15,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop",
    rating: 4.8,
    numReviews: 167,
    isActive: true,
    reviews: []
  },
  {
    name: "Portable Bluetooth Speaker",
    description: "Waterproof portable speaker with 360-degree sound, 12-hour battery, and built-in microphone. Great for outdoor adventures.",
    brand: "SoundWave",
    category: "Electronics",
    price: 799,
    countInStock: 60,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
    rating: 4.4,
    numReviews: 312,
    isActive: true,
    reviews: []
  },
  {
    name: "USB-C Hub",
    description: "Multi-port USB-C hub with HDMI, USB 3.0, SD card reader, and power delivery. Expand your laptop connectivity.",
    brand: "TechConnect",
    category: "Electronics",
    price: 599,
    countInStock: 80,
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&h=500&fit=crop",
    rating: 4.5,
    numReviews: 98,
    isActive: true,
    reviews: []
  },
  {
    name: "Wireless Mouse",
    description: "Precision wireless mouse with adjustable DPI, silent clicks, and long battery life. Comfortable for all-day use.",
    brand: "PointerPro",
    category: "Electronics",
    price: 399,
    countInStock: 100,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop",
    rating: 4.3,
    numReviews: 156,
    isActive: true,
    reviews: []
  },
  {
    name: "Laptop Stand",
    description: "Adjustable aluminum laptop stand with ergonomic design. Improves posture and creates more desk space.",
    brand: "WorkStation",
    category: "Furniture",
    price: 499,
    countInStock: 70,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop",
    rating: 4.6,
    numReviews: 87,
    isActive: true,
    reviews: []
  },
  {
    name: "Wireless Charging Pad",
    description: "Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.",
    brand: "PowerTech",
    category: "Electronics",
    price: 299,
    countInStock: 90,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&h=500&fit=crop",
    rating: 4.4,
    numReviews: 124,
    isActive: true,
    reviews: []
  },
  {
    name: "Premium Desk Lamp",
    description: "LED desk lamp with adjustable brightness, color temperature control, and USB charging port. Perfect for reading and working.",
    brand: "LightWorks",
    category: "Furniture",
    price: 699,
    countInStock: 40,
    image: "https://images.unsplash.com/photo-1565636192335-14c46fa1120d?w=500&h=500&fit=crop",
    rating: 4.7,
    numReviews: 145,
    isActive: true,
    reviews: []
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing products");

    // Insert sample products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Inserted ${createdProducts.length} sample products`);

    // Display created products
    console.log("\n📦 Sample Products Created:");
    createdProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - R${product.price}`);
    });

    console.log("\n✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:", err.message);
    process.exit(1);
  }
};

seedDatabase();
