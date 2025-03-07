const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const router = express.Router();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post("/auth/google", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const userId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    // Check if user exists in the database
    let user = await User.findOne({ googleId: userId });

    if (!user) {
      // Register new user with picture
      user = new User({
        googleId: userId,
        email,
        name,
        picture,
      });
      await user.save();
    } else {
      // Update picture if changed
      if (user.picture !== picture) {
        user.picture = picture;
        await user.save();
      }
    }

    // Generate JWT Token
    const jwtToken = jwt.sign(
      { id: user.id, email, name, picture },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "User authenticated",
      jwt_token: jwtToken,
      user: { id: user.id, email, name, picture },
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid token", message: error.message });
  }
});

router.get("/profile", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
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
        picture: user.picture,
      },
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid token", message: error.message });
  }
});

module.exports = router;
