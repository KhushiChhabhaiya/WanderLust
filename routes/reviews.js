import e from "express";
import wrapAsync from "../utils/wrapAsync.js";

import { isLoggedin, isReviewAuthor, validateReview } from "../middleware.js";
import reviewController from "../controllers/reviews.js";

const router = e.Router({ mergeParams: true });

//review form (post route)
router.post(
  "/",
  isLoggedin(),
  validateReview,
  wrapAsync(reviewController.postNewReview),
);

//review form (delete route)
router.delete(
  "/:reviewId",
  isLoggedin(),
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview),
);

export default router;
