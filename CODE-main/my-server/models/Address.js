const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true   // mỗi user chỉ có 1 address
  },

  phone: {
    type: String,
    required: true
  },

  address: {
    type: String,
    required: true
  },

  ward: {
    type: String
  },

  district: {
    type: String
  },

  city: {
    type: String
  },

  lat: {
    type: Number
  },

  lng: {
    type: Number
  }

});

module.exports = mongoose.model("Address", AddressSchema);