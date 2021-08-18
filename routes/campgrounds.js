//Requirements **************************************
const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const ExpressError = require("../utilities/expressError");
const Campground = require("../models/campground");
// const Review = require("./models/review");
const {campgroundSchema} = require("../schemas");
const {isLoggedIn} = require("../middleware");


//Functions ****************************************

// from model we expect campground object like
// campground : {
//   title: String,
//   image: String,
//   price: Number,
//   description: String,
//   location: String
// }
const validateCampground = (req,res,next) => {
  const {error} = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg, 400)
  } else {
    next();
  }
}


//Routes ******************************************
router.get("/", catchAsync(async (req,res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", {campgrounds})
}));

router.get("/new", isLoggedIn, (req,res) => {
  res.render("campgrounds/new")
});

router.post("/", isLoggedIn, validateCampground, catchAsync(async (req,res) => {
  // if (!req.body.campground) { throw new ExpressError("Invalid Campground Data", 400)}
  const campground = new Campground(req.body.campground);
  await campground.save();
  req.flash("success", "Successfully made a campground");
  res.redirect(`campgrounds/${campground._id}`)
}));

router.get("/:id", catchAsync(async (req,res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id).populate("reviews");
  if (!campground) {
    req.flash("error", "Can not find that campground");
    return res.redirect("/campgrounds");
  } else {
    res.render("campgrounds/show", {campground});
  }
}));

router.get("/:id/edit", isLoggedIn, catchAsync(async (req,res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
    if (!campground) {
    req.flash("error", "Can not find that campground");
    return res.redirect("/campgrounds");
  } else {
    res.render("campgrounds/edit", {campground})
  }
}));

router.put("/:id", isLoggedIn, validateCampground, catchAsync(async (req,res) => {
  const {id} = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
  req.flash("success", "Successfully updated campground");
  res.redirect(`/campgrounds/${campground._id}`)
}));

router.delete("/:id", isLoggedIn, catchAsync(async (req,res) => {
  const {id} = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground");
  res.redirect(`/campgrounds`)
}));



module.exports = router;