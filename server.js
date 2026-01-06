require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const app = express();

/* -------------------- DATABASE -------------------- */
connectDB();

/* -------------------- CORS (FIXED) -------------------- */
const allowedOrigins = [
  "http://localhost:5173",          // Vite dev
  "http://localhost:3000",          // fallback
  "https://flowtoo-frontend.vercel.app",     // CHANGE to your real Vercel domain
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

/* -------------------- HEALTH CHECK -------------------- */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Flowtoo API is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.send("Flowtoo API running ✅");
});

/* -------------------- ROUTES (FIXED) -------------------- */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes")); // ❌ WAS WRONG
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

/* -------------------- 404 HANDLER -------------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* -------------------- ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* -------------------- ENV VALIDATION -------------------- */
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingEnvVars.length) {
  console.error(`❌ Missing env vars: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
});

/* -------------------- GRACEFUL SHUTDOWN (FIXED) -------------------- */
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down...");
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log("✅ MongoDB closed");
      process.exit(0);
    });
  });
});