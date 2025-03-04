require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const cors = require('cors');

const app = express();

// Advanced MongoDB Connection Function
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('❌ CRITICAL: MongoDB URI is Missing!');
    throw new Error('MongoDB URI must be provided');
  }

  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // 10 seconds
    socketTimeoutMS: 45000, // 45 seconds
    connectTimeoutMS: 10000, // 10 seconds connection timeout
  };

  try {
    await mongoose.connect(mongoURI, connectionOptions);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', {
      message: error.message,
      name: error.name,
      code: error.code
    });

    // Detailed connection debugging
    console.error('Connection Details:', {
      uri: mongoURI.replace(/\/\/.*:(.*)@/, '//[REDACTED]:[REDACTED]@'),
      nodeEnv: process.env.NODE_ENV
    });

    // Provide more context about potential issues
    if (error.name === 'MongoServerSelectionError') {
      console.error('Possible Reasons:');
      console.error('1. IP Address not whitelisted in MongoDB Atlas');
      console.error('2. Network connectivity issues');
      console.error('3. Incorrect connection string');
      console.error('4. Firewall blocking connection');
    }

    throw error; // Rethrow to prevent server startup
  }
};

// CORS Configuration with Dynamic Origins
const corsOptions = {
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,https://your-app.vercel.app')
    .split(',')
    .map(origin => origin.trim()),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration with Comprehensive Options
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

// Database Connection and Server Setup
const initializeServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Load routes after successful connection
    const authRoutes = require('./routes/authRoutes');
    app.use('/', authRoutes);

  } catch (error) {
    console.error('❌ Server Initialization Failed:', error);
    process.exit(1);
  }
};

// Initialize Server
initializeServer();

// Vercel Serverless Function Export
module.exports = app;
