import Review from "../models/review.js";
import ExpressError from "../utils/expressError.js";
import Listing from "../models/listing.js";

const postNewReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;

  listing.reviews.push(newReview);

  await listing.save();
  await newReview.save();

  req.flash("success", "New review added!");
  console.log("saved");
  res.redirect(`/listings/${listing._id}`);
};

const destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted!");
  res.redirect(`/listings/${id}`);
};

const reviewController = { postNewReview, destroyReview };
export default reviewController;
