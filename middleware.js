module.exports.isLoggedIn = (req,res,next) => {
  if(!req.isAuthenticated()) {
    //store the url when they are req
    req.session.returnTo = req.originalUrl
    req.flash("error", "You must be signes in");
    return res.redirect("/login")
  } else {
    next();
  }
}