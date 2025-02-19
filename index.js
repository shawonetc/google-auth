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

// ✅ Add CORS middleware
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3000", "https://uizen.vercel.app"], // ✅ Vercel origin add করুন
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // ✅ Cookies send করার অনুমতি দিন
  })
);

// ✅ Session Configuration with MongoDB
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "None",
  maxAge: 24 * 60 * 60 * 1000, // 1 দিন
}

  })
);


// ✅ Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use("/", authRoutes); // ✅ Use the auth routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
