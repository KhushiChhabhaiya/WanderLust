import Listing from "../models/listing.js";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding.js";

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const index = async (req, res) => {
  const allListings = await Listing.find();
  res.render("listings/index", { allListings });
};

const renderNewForm = (req, res) => {
  res.render("listings/new");
};

const showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    });

  if (!listing) {
    req.flash("error", "Listing does not exists!");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};

const postListing = async (req, res) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  const newListing = new Listing(req.body.listing);

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  newListing.owner = req.user._id;
  const feature = response.body?.features?.[0];

  if (!feature) {
    req.flash(
      "error",
      "Could not find that location. Please check the location and try again.",
    );
    return res.redirect("/listings/new");
  }

  newListing.geometry = feature.geometry;

  let savedlisting = await newListing.save();
  console.log(savedlisting);

  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

const renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exists!");
    return res.redirect("/listings");
  }

  let originalImgURL = listing.image.url;
  let previewImg = originalImgURL;

  // Seed listings use Unsplash URLs, which resize through query parameters.
  if (originalImgURL.includes("images.unsplash.com")) {
    const previewURL = new URL(originalImgURL);
    previewURL.searchParams.set("w", "250");
    previewImg = previewURL.toString();
  } else {
    // Cloudinary URLs resize through transformations after `/upload/`.
    previewImg = originalImgURL.replace(
      "/upload/",
      "/upload/w_250,h_250,c_fill/",
    );
  }
  res.render("listings/edit", { listing, previewImg });
};

const updateListing = async (req, res) => {
  let { id } = req.params;
  const updates = { ...req.body.listing };

  const response = await geocodingClient
    .forwardGeocode({
      query: updates.location,
      limit: 1,
    })
    .send();

  const feature = response.body?.features?.[0];

  if (!feature) {
    req.flash(
      "error",
      "Could not find that location. Please check it and try again.",
    );
    return res.redirect(`/listings/${id}/edit`);
  }

  updates.geometry = feature.geometry;
  if (req.file) {
    updates.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }
  await Listing.findByIdAndUpdate(id, updates);
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

const destroyListing = async (req, res) => {
  let { id } = req.params;
  const deletedId = await Listing.findByIdAndDelete(id);
  console.log(deletedId);
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};

const searchListing = async (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();

  if (!q) {
    req.flash("error", "Enter a destination to search.");
    return res.redirect("/listings");
  }

  let listings = await Listing.find();

  let allListings = listings.filter((listing) => {
    return (
      listing.title.toLowerCase().includes(q) ||
      listing.location.toLowerCase().includes(q) ||
      listing.country.toLowerCase().includes(q)
    );
  });

  if (allListings.length === 0) {
    req.flash("error", `No matching destinations found from ${q}!`);
    return res.redirect("/listings");
  } else {
    return res.render("listings/index.ejs", {
      allListings,
      searchQuery: q,
    });
  }
};

const listingController = {
  index,
  renderNewForm,
  showListing,
  postListing,
  renderEditForm,
  updateListing,
  destroyListing,
  searchListing,
};
export default listingController;
