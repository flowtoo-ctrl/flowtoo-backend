const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  const header = req.header("Authorization");
  const token = header && header.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

const admin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ msg: "Admins only" });
  }
  next();
};

module.exports = { protect, admin };