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
  cors({
    origin: [
      "http://localhost:3001",  // Localhost frontend URL
      "http://localhost:3000",  // Localhost frontend URL
      process.env.FRONTEND_URL, // Frontend URL on Render
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies to be sent with requests
  })
);

https://google-auth-1.onrender.com/auth/google


app.use(passport.initialize());
app.use(passport.session());

app.use("/", authRoutes); // Use the auth routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
