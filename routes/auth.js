const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Ensure the User model path is correct

const router = express.Router();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Middleware to parse JSON request bodies
router.use(express.json());  // This is important to parse the body as JSON

router.post("/auth/google", async (req, res) => {
  const { token } = req.body;  // Destructure token from req.body

  // Log the incoming request body for debugging purposes
  console.log(req.body);

  if (!token) {
    return res.status(400).json({ error: "Token is missing from the request body" });
  }

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

    // Check if user already exists in the database
    let user = await User.findOne({ googleId: userId });

    if (!user) {
      // Register new user
      user = new User({
        googleId: userId,
        email,
        name,
        profilePicture: picture, // Updated to match the schema field name
      });
      await user.save();
    } else {
      // Always update all user information to ensure everything is in sync
      const updatedFields = {
        name: name, // Update name in case it changed in Google
        email: email, // Update email in case it changed in Google
        profilePicture: picture, // Update profile picture
      };

      // Apply updates to user object
      Object.assign(user, updatedFields);

      // Save the updated user
      await user.save();
    }

    // Generate JWT Token
    const jwtToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        profilePicture: user.profilePicture 
      }, 
      JWT_SECRET, 
      {
        expiresIn: "1h", // Modify the duration if needed
      }
    );

    res.json({
      message: "User authenticated",
      jwt_token: jwtToken,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        profilePicture: user.profilePicture 
      },
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid token", message: error.message });
  }
});

// Profile route to fetch user details
router.get("/profile", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Get the JWT token from the authorization header

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Verify the token and extract user information
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch the user from MongoDB using the decoded user ID
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user profile data with all available fields
    res.json({
      user: {
        id: user.id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid token", message: error.message });
  }
});

module.exports = router;
