require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const cors = require('cors');

const app = express();

// Robust MongoDB Connection Function
const connectDB = async () => {
  // Get MongoDB URI from environment variables
  const mongoURI = process.env.MONGODB_URI;

  // Validate MongoDB URI
  if (!mongoURI) {
    console.error('❌ CRITICAL: MongoDB Connection String is Missing!');
    console.error('Please set MONGODB_URI in your environment variables.');
    
    // Throw an error to prevent server startup
    throw new Error('MongoDB URI is not defined');
  }

  try {
    // Connect with detailed logging and options
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    
    // Log specific connection details for debugging
    console.error('Connection Details:', {
      uri: mongoURI.replace(/\/\/.*:(.*)@/, '//[REDACTED]:[REDACTED]@'), // Mask credentials
      nodeEnv: process.env.NODE_ENV
    });

    // Exit process with failure
    process.exit(1);
  }
};

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'https://your-production-domain.com',
    /\.vercel\.app$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration with Fallback
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_development_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    autoRemove: 'interval',
    autoRemoveInterval: 10
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 14 * 24 * 60 * 60 * 1000
  }
}));

// Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV !== 'production' ? err.message : {}
  });
});

// Connect to MongoDB before setting up routes
(async () => {
  try {
    await connectDB();

    // Routes (add after DB connection)
    const authRoutes = require('./routes/authRoutes');
    app.use('/', authRoutes);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();

// Vercel Serverless Function Export
module.exports = app;
