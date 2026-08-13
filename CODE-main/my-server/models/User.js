const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const BCRYPT_SALT_ROUNDS = 10

const UserSchema = new mongoose.Schema({

  profileName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  gender: {
    type: String
  },

  birthDay: {
    type: Number
  },

  birthMonth: {
    type: Number
  },

  birthYear: {
    type: Number
  },

  marketing: {
    type: Boolean
  },
  phone: {
    type: String
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
    required: true
  },

  passwordResetTokenHash: {
    type: String,
    default: null
  },

  passwordResetExpiresAt: {
    type: Date,
    default: null
  },

})


// WARNING: Lưu mật khẩu dạng plain text (KHÔNG AN TOÀN, chỉ dùng cho test/demo)
UserSchema.pre("save", async function () {
  // Không mã hóa password nữa
  return;
})


UserSchema.pre("findOneAndUpdate", async function () {
  // Không mã hóa password nữa
  return;
})

module.exports = mongoose.model("User", UserSchema)