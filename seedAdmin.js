const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const connectDB = require("./config/db");

const seedAdmin = async () => {
  await connectDB();

  try {
    const adminEmail = "admin@flowtoo.com";
    const adminPass = "admin@123";

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPass, salt);

      admin = new User({
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });

      await admin.save();
      console.log("✅ Admin user created");
    } else {
      console.log("⚠️ Admin already exists");
    }

    process.exit();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

seedAdmin();
