import e from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { isLoggedin, isOwner, validateListing } from "../middleware.js";
import listingController from "../controllers/listing.js";
import multer from "multer";
import { storage } from "../cloudConfig.js";
import Listing from "../models/listing.js";

const router = e.Router({ mergeParams: true });
const upload = multer({ storage });

//Index route and Create route
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedin(),
    upload.single("listing[image][url]"),
    validateListing,
    wrapAsync(listingController.postListing),
  );

//new route
router.get("/new", isLoggedin(), listingController.renderNewForm);

//Edit route
router.get(
  "/:id/edit",
  isLoggedin(),
  isOwner,
  wrapAsync(listingController.renderEditForm),
);

//search listings
router.get("/search", listingController.searchListing);

//show, update and delete route
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedin(),
    isOwner,
    upload.single("listing[image][url]"),
    validateListing,
    wrapAsync(listingController.updateListing),
  )
  .delete(isLoggedin(), isOwner, wrapAsync(listingController.destroyListing));

router.get(
  "/category/:category",
  wrapAsync(async (req, res) => {
    const { category } = req.params;

    const listings = await Listing.find({ category });

    res.render("listings/index.ejs", {
      allListings: listings,
      selectedCategory: category,
    });
  }),
);

export default router;
