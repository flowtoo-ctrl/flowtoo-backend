// Mock data for preview
const mockProducts = [
  {
    _id: "1",
    name: "Premium Wireless Headphones",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    description: "High-quality wireless headphones with noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and professionals.",
    brand: "AudioTech",
    category: "Electronics",
    price: 1299.99,
    countInStock: 15,
    rating: 4.5,
    numReviews: 24,
    reviews: [
      {
        _id: "r1",
        name: "John Smith",
        rating: 5,
        comment: "Absolutely amazing headphones! The sound quality is incredible and the noise cancellation works perfectly. Highly recommended!",
        createdAt: new Date("2024-01-10")
      },
      {
        _id: "r2",
        name: "Sarah Johnson",
        rating: 4,
        comment: "Great product overall. Battery lasts long and comfort is excellent. Only minor issue with the app.",
        createdAt: new Date("2024-01-08")
      },
      {
        _id: "r3",
        name: "Mike Davis",
        rating: 5,
        comment: "Best purchase ever! Worth every penny. Customer service was also very helpful.",
        createdAt: new Date("2024-01-05")
      },
      {
        _id: "r4",
        name: "Emma Wilson",
        rating: 4,
        comment: "Very good quality. Comfortable for long listening sessions. Delivery was fast too.",
        createdAt: new Date("2024-01-02")
      }
    ]
  },
  {
    _id: "2",
    name: "4K Ultra HD Smart TV",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop",
    description: "55-inch 4K Ultra HD Smart TV with HDR support, built-in streaming apps, and voice control. Perfect for home entertainment.",
    brand: "VisionMax",
    category: "Electronics",
    price: 4999.99,
    countInStock: 8,
    rating: 4.3,
    numReviews: 18,
    reviews: [
      {
        _id: "r5",
        name: "Robert Brown",
        rating: 5,
        comment: "Picture quality is outstanding! Colors are vibrant and the smart features work seamlessly.",
        createdAt: new Date("2024-01-09")
      },
      {
        _id: "r6",
        name: "Lisa Anderson",
        rating: 4,
        comment: "Great TV for the price. Setup was easy and the remote is user-friendly.",
        createdAt: new Date("2024-01-06")
      }
    ]
  },
  {
    _id: "3",
    name: "Professional DSLR Camera",
    image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop",
    description: "24MP DSLR camera with 4K video recording, professional autofocus system, and weather-sealed body. Ideal for photographers and videographers.",
    brand: "CameraGear",
    category: "Electronics",
    price: 8999.99,
    countInStock: 5,
    rating: 4.7,
    numReviews: 32,
    reviews: [
      {
        _id: "r7",
        name: "Alex Turner",
        rating: 5,
        comment: "Professional quality camera! The autofocus is incredibly fast and the image quality is exceptional.",
        createdAt: new Date("2024-01-11")
      },
      {
        _id: "r8",
        name: "Jessica Lee",
        rating: 5,
        comment: "Worth every penny! Great build quality and fantastic customer support.",
        createdAt: new Date("2024-01-07")
      }
    ]
  },
  {
    _id: "4",
    name: "Portable Bluetooth Speaker",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
    description: "Waterproof portable speaker with 360-degree sound, 12-hour battery, and Bluetooth 5.0. Perfect for outdoor adventures.",
    brand: "SoundWave",
    category: "Electronics",
    price: 499.99,
    countInStock: 30,
    rating: 4.4,
    numReviews: 56,
    reviews: [
      {
        _id: "r9",
        name: "Tom Harris",
        rating: 5,
        comment: "Amazing sound quality for a portable speaker! Waterproof design is perfect for beach trips.",
        createdAt: new Date("2024-01-12")
      },
      {
        _id: "r10",
        name: "Rachel Green",
        rating: 4,
        comment: "Great value for money. Sound is clear and battery lasts long.",
        createdAt: new Date("2024-01-04")
      }
    ]
  },
  {
    _id: "5",
    name: "Mechanical Gaming Keyboard",
    image: "https://images.unsplash.com/photo-1587829191301-4b13aaf5a96e?w=400&h=400&fit=crop",
    description: "RGB mechanical keyboard with custom switches, programmable keys, and aluminum frame. Perfect for gaming and typing.",
    brand: "KeyMaster",
    category: "Electronics",
    price: 1799.99,
    countInStock: 20,
    rating: 4.6,
    numReviews: 42,
    reviews: [
      {
        _id: "r11",
        name: "Chris Martin",
        rating: 5,
        comment: "Best gaming keyboard I've ever used! The mechanical switches feel amazing and RGB lighting is beautiful.",
        createdAt: new Date("2024-01-13")
      }
    ]
  },
  {
    _id: "6",
    name: "Wireless Gaming Mouse",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop",
    description: "High-precision wireless gaming mouse with 16,000 DPI sensor, 70-hour battery, and ergonomic design.",
    brand: "MousePro",
    category: "Electronics",
    price: 799.99,
    countInStock: 25,
    rating: 4.5,
    numReviews: 38,
    reviews: [
      {
        _id: "r12",
        name: "David Wong",
        rating: 5,
        comment: "Precision is incredible! No lag and the battery lasts forever. Perfect for competitive gaming.",
        createdAt: new Date("2024-01-14")
      }
    ]
  }
];

module.exports = mockProducts;
