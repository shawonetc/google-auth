const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User"); // Ensure the correct path

const router = express.Router();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// 🔹 Google Login Route
router.post("/auth/google", async (req, res) => {
  const { token } = req.body;

  try {
    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture; // Google Profile Picture

    // 🔍 Check if the user exists
    let user = await User.findOne({ googleId });

    if (user) {
      console.log("User exists. Updating profile picture...");
      user.picture = picture; // Update the picture on every login
      await user.save();
    } else {
      console.log("New user. Creating an account...");
      user = new User({
        googleId,
        email,
        name,
        picture,
      });
      await user.save();
    }

    // Generate JWT Token
    const jwtToken = jwt.sign(
      { id: user.id, email, name, picture },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "User authenticated successfully",
      jwt_token: jwtToken,
      user: { id: user.id, email, name, picture },
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid token", message: error.message });
  }
});

// 🔹 Get Profile Route
router.get("/profile", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture, // Return the updated profile picture
      },
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid token", message: error.message });
  }
});

module.exports = router;
