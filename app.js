// Requirements ******************

const express = require("express");
const app = express();

app.use(express.urlencoded({extended:true}));

const mongoose = require('mongoose');
mongoose.connect("mongodb://root:159753mel@localhost:27017/YelpCamp?authSource=admin", 
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true, useFindAndModify: false});
// .then(() => {
//   console.log("Mongo Connection Open")
// })
// .catch(err => {
//   console.log("Mongo Connection Error")
//   console.log(err)
// })
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Db is connected")
});

const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);


const ExpressError = require("./utilities/expressError");

const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");


const session = require("express-session");
const sessionConfig = {
  secret: "thisshouldbeabettersecret",
  resave:false,
  saveUninitialized: true,
  cookie : {
    httpOnly: true,
    expires: Date.now() + 1000 *60 * 60 * 24 * 7,
    maxAge: 1000 *60 * 60 * 24 * 7
  }
};
app.use(session(sessionConfig));

const flash = require("connect-flash");
app.use(flash());

app.use(express.static("public"));

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

app.use(passport.initialize());
app.use(passport.session());//must come after app.use(session(sessionConfig));
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
  console.log(req.session);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next()
});

//ROUTES *********************************************


app.use("/campgrounds", campgroundRoutes);

app.use("/campgrounds/:id/reviews", reviewRoutes);

app.use("/", userRoutes);

app.get("/", (req,res) => {
  res.render("home");
});

app.all("*", (req,res,next) => {
  next(new ExpressError("Page not found", 404))
})

app.use((err,req,res,next) => {
  const {statusCode = 500} = err;
  if (!err.message) {err.message = "Oh no! Something went wrong"};
  res.status(statusCode).render("error", {err})
})


// Listen *******************************************
app.listen(3000, () => {
  console.log("Port 3000")
})