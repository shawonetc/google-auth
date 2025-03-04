require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const MongoStore = require("connect-mongo");

// Import configuration modules
const passportConfig = require("./config/passportConfig");
const mongoConfig = require("./config/mongoConfig");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration with MongoDB Store
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      autoRemove: 'interval',
      autoRemoveInterval: 10 // Remove expired sessions every 10 minutes
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      domain: process.env.NODE_ENV === "production" 
        ? process.env.COOKIE_DOMAIN 
        : undefined
    }
  })
);

// CORS Configuration
const ALLOWED_ORIGINS = [
  "http://localhost:3000", 
  "http://localhost:3001",
  process.env.FRONTEND_VERCEL_URL,
  process.env.MAIN_DOMAIN
].filter(Boolean); // Remove any undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || ALLOWED_ORIGINS.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", authRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? {} : err.message
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Server Start
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Graceful Shutdown
process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;
