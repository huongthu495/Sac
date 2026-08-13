const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  slug: { type: String, unique: true },
  short_description: { type: String },
  description: { type: String },
  unit_price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  stocked_quantity: { type: Number, default: 0 },
  sizes: [{ size: String, stock: Number }],
  images: [{ type: String }],
  material: { type: String },
  origin: { type: String },
  product_dept: { type: String },
  rating: { type: Number, default: 4 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', ProductSchema);
