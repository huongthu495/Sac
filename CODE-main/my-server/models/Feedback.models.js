const mongoose = require("mongoose")

const FeedbackSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  message: String,
  replied: { type: Boolean, default: false }
})

module.exports = mongoose.model("Feedback", FeedbackSchema)