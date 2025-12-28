const mongoose = require("mongoose");

// Review Schema
const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "Anonymous",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Product Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],

    sku: {
      type: String,
      unique: true,
      sparse: true,
    },

    weight: {
      type: Number,
      default: 0,
    },

    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
productSchema.index({ category: 1 });
productSchema.index({ name: "text", description: "text" });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

// Virtual for average rating
productSchema.virtual("averageRating").get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  return Number((sum / this.reviews.length).toFixed(1));
});

// Add a review
productSchema.methods.addReview = async function (reviewData) {
  const reviewId = new mongoose.Types.ObjectId(); // FIXED

  this.reviews.push({
    ...reviewData,
    _id: reviewId,
  });

  this.numReviews = this.reviews.length;
  this.rating = this.averageRating;

  return await this.save();
};

// Remove a review
productSchema.methods.removeReview = async function (reviewId) {
  this.reviews = this.reviews.filter(
    (r) => r._id.toString() !== reviewId.toString()
  );

  this.numReviews = this.reviews.length;

  this.rating =
    this.reviews.length > 0 ? this.averageRating : 0;

  return await this.save();
};

// Pre-save rating recalculation
productSchema.pre("save", function (next) {
  if (this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.rating = Number((sum / this.reviews.length).toFixed(1));
    this.numReviews = this.reviews.length;
  } else {
    this.rating = 0;
    this.numReviews = 0;
  }
  next();
});

module.exports =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);
