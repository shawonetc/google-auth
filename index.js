require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const MongoStore = require("connect-mongo");

const passportConfig = require("./config/passportConfig");
const mongoConfig = require("./config/mongoConfig");
const authRoutes = require("./routes/authRoutes");

const app = express();

const CLIENT_ORIGIN = [
  "http://localhost:3001",
  "http://localhost:3000",
  "https://uizen.vercel.app",
];

// ✅ CORS Configuration
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Session Configuration (Localhost + Production Support)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // Store session in MongoDB
      ttl: 14 * 24 * 60 * 60, // Session expires in 14 days
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Production-এ true, Localhost-এ false
      sameSite: "Lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", authRoutes); // Use authentication routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
