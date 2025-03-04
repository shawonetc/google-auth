require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");

const passportConfig = require("./config/passportConfig");
const authRoutes = require("./routes/authRoutes");

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Connection Error:", err));

// CORS Configuration
// Allow requests from your frontend origin
app.use(cors({
  origin: 'http://localhost:3001', // Replace with your frontend's URL if it's different
  methods: ['GET', 'POST'], // Specify the methods you want to allow
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
}));


// Session Configuration (with MongoDB store)
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
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", authRoutes); // Using auth routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
