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

// Add CORS middleware
app.use(
  cors({
    origin: [
      "http://localhost:3001",  // Localhost frontend URL
      "http://localhost:3000",  // Localhost frontend URL
      "https://uizen.vercel.app",
      process.env.FRONTEND_URL, // Frontend URL on Render
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies to be sent with requests
  })
);


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
