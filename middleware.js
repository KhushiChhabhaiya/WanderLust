import Listing from "./models/listing.js";
import Review from "./models/review.js";
import ExpressError from "./utils/expressError.js";
import { listingSchema } from "./schema.js";
import { reviewSchema } from "./schema.js";

const isLoggedin = (message = "You must be logged in to do that!") => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      if (req.method === "GET") {
        req.session.redirectUrl = req.originalUrl;
      }

      req.flash("error", "You must be logged in!");
      return res.redirect("/login");
    }

    next();
  };
};

const saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

const isOwner = async (req, res, next) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "Only owner can do that.");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

const isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;

  let review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review does not exist!");
    return res.redirect("/listings");
  }

  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "Only author can do that.");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

const validateListing = (req, res, next) => {
  console.log("body:", req.body, "file:", req.file);
  let { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error.details[0].message);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error.details[0].message);
  } else {
    next();
  }
};

export {
  isLoggedin,
  saveRedirectUrl,
  isOwner,
  validateListing,
  validateReview,
  isReviewAuthor,
};
