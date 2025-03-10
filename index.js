require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");

const passportConfig = require("./config/passportConfig");
const mongoConfig = require("./config/mongoConfig");
const auth = require("./routes/auth"); // Ensure this path is correct

const app = express();

// Manually set CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Replace with your front-end domain
  res.setHeader("Access-Control-Allow-Credentials", "true"); // Allow credentials (cookies, authorization headers, etc.)
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // Allow these HTTP methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow these headers

  next(); // Proceed to the next middleware or route handler
});

// Set up express session
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

// Use auth routes
app.use("/", auth); // Ensure the 'auth' route is correctly set up

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

const PORT = process.env.PORT || 5000; // Port should be 5000 for backend
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
