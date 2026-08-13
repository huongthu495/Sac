const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: String,
  name: String,
  price: Number,
  quantity: Number,
  image: String
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);