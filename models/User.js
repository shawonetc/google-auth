const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true }, // Unique Google ID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  picture: { type: String }, // Store Google profile picture URL
}, { timestamps: true }); // Auto timestamps (createdAt, updatedAt)

module.exports = mongoose.model("User", userSchema);
