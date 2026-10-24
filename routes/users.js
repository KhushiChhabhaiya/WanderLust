import e from "express";
import wrapAsync from "../utils/wrapAsync.js";
import passport from "passport";
import { saveRedirectUrl } from "../middleware.js";
import userController from "../controllers/users.js";
const router = e.Router();

router
  .route("/signup")
  .get(userController.renderSignup)
  .post(wrapAsync(userController.signup));

// Google signup and login
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome to WanderLust!");
    res.redirect("/listings");
  },
);

router.get("/verify-email/:token", wrapAsync(userController.verifyEmail));

router
  .route("/login")
  .get(userController.renderLogin)
  // .post(
  //   saveRedirectUrl,
  //   passport.authenticate("local", {
  //     failureRedirect: "/login",
  //     failureFlash: true,
  //   }),
  //   userController.login,
  // );
  .post(saveRedirectUrl, (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        req.flash("error", info?.message || "Invalid username or password.");
        return res.redirect("/login");
      }

      if (!user.emailVerified) {
        req.flash("error", "Please verify your email before logging in.");
        return res.redirect("/login");
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }

        return userController.login(req, res);
      });
    })(req, res, next);
  });

router.get("/logout", userController.logout);

export default router;
