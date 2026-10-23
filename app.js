// if(process.env.NODE_ENV !="PRODUCTION"){
//   require('dotenv').config();


if (process.env.NODE_ENV != "PRODUCTION") {
  require("dotenv").config();
}

// ================= CORE =================
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

// ================= MODELS =================
const Listing = require("./models/listing.js");
const User = require("./models/user.js");

// ================= ROUTES =================
const listingsRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// ================= AUTH =================
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// ================= DB =================

// const dbUrl="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

if (!dbUrl) {
  console.error("❌ ATLASDB_URL is missing in .env");
  process.exit(1);
}

async function main() {
  await mongoose.connect(dbUrl);
  console.log("✅ Connected to MongoDB Atlas");
}

// ================= VIEW ENGINE =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ================= MIDDLEWARE =================
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));




// ================= SERVER START =================
const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    await main();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:");
    console.error(err.message);
    process.exit(1);
  }
}

startServer();

// ================= SESSION STORE =================
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (e) => {
  console.log("❌ Session store error:", e);
});

// ================= SESSION CONFIG =================
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,

  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ================= PASSPORT =================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================= GLOBAL VARIABLES =================
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// ================= HOME ROUTE =================
app.get("/", async (req, res, next) => {
  try {
    const listings = await Listing.find({});
    res.render("listings/index", {
      allListings: listings,
    });
  } catch (err) {
    next(err);
  }
});



// ================= SEARCH ROUTE =================
app.get("/search", async (req, res, next) => {
  try {
  const q =
  typeof req.query.q === "string"
    ? req.query.q.trim()
    : "";

    // Empty search query
    if (!q) {
      return res.render("search/results", {
        listings: [],
        q: "",
      });
    }

    // Escape special regex characters
  const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const listings = await Listing.find({
      $or: [
        { title: { $regex: escapedQ, $options: "i" } },
        { location: { $regex: escapedQ, $options: "i" } },
        { country: { $regex: escapedQ, $options: "i" } },
      ],
    }).limit(50);

    res.render("search/results", {
      listings,
      q,
    });
  } catch (err) {
    next(err);
  }
});

// ================= ROUTES =================
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;

  res.status(statusCode).render("error", {
    err,
  });
});

