const express = require("express");
const router = express.Router();
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;
const { protect, admin } = require("../middleware/authMiddleware");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer();

router.post("/", protect, admin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });

    const streamUpload = (file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "flowtoo/products" },
          (error, result) => error ? reject(error) : resolve(result)
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file);
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;