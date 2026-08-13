const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({

  product_name: {
    type: String,
    required: true
  },

  slug: {
    type: String,
    unique: true
  },



  // mô tả chi tiết
  description: {
    type: String
  },

  // giá
  unit_price: {
    type: Number,
    required: true
  },

  // giảm giá %
  discount: {
    type: Number,
    default: 0
  },



  // Danh sách size và số lượng tồn kho cho từng size
  sizes: [
    {
      size: {
        type: String,
        enum: ["S", "M", "L", "XL"],
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 0
      }
    }
  ],

  // danh sách ảnh
  images: [
    {
      type: String
    }
  ],

  // chất liệu
  material: {
    type: String
  },

  // xuất xứ
  origin: {
    type: String
  },

  // category
  product_dept: {
    type: String
  },

  rating: {
    type: Number,
    default: 4
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

  ,
  // For items without sizes (e.g., accessories), store a single stock number
  stock: {
    type: Number,
    default: 0,
    min: 0
  }

});

module.exports = mongoose.model("Product", ProductSchema);