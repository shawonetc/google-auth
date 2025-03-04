require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");

const passportConfig = require("./config/passportConfig");
const mongoConfig = require("./config/mongoConfig");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Add CORS middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret", // Make sure to set this in your .env
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: false, // Allow JavaScript to access the cookie
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: "lax", // Control cross-site cookie behavior
    },
  })
);
;

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret", // Make sure to set this in your .env
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Set secure cookie in production (Render)
      sameSite: "lax", // Control cross-site cookie behavior
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", authRoutes); // Use the auth routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
