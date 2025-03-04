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

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // Secure is true for production, false for local
      httpOnly: false, // Allow client-side access to cookies
      sameSite: "none", // Fix for cross-origin issues
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
