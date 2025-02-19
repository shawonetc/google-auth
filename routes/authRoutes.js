const express = require("express");
const router = express.Router();
const passport = require("passport");

// Protected route to get user profile
router.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  res.json({
    message: "User profile retrieved successfully",
    user: req.user, // User data from session
  });
});

// Google OAuth login
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // এখানে আর রিডিরেক্ট দেওয়া হচ্ছে না
    // শুধু সেশন তৈরির পর success বা failure response পাঠানো যেতে পারে
    res.send("Logged in successfully"); // সফল হলে এই বার্তা পাঠাবে
  }
);


// Logout route
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/"); // Redirect to homepage after logout
  });
});

module.exports = router;
