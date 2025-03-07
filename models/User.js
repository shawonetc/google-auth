const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true }, // Unique Google ID
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profilePicture: { type: String }, // ✅ 'picture' ফিল্ডের পরিবর্তে 'profilePicture'
  },
  { timestamps: true } // Auto timestamps (createdAt, updatedAt)
);

module.exports = mongoose.model("User", userSchema);
