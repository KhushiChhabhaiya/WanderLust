import User from "../models/user.js";
import crypto from "crypto";
import transporter from "../utils/mailer.js";

const renderSignup = (req, res) => {
  res.render("users/signup.ejs");
};

const sendVerificationEmail = async (user) => {
  const appUrl = process.env.APP_URL?.replace(/\/$/, "");
  if (!appUrl) {
    throw new Error("APP_URL is not configured.");
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.emailVerified = false;
  user.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  user.emailVerificationExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: user.email,
    subject: "Verify your WanderLust email",
    text: `Hello ${user.username}, please verify your email by clicking this link: ${appUrl}/verify-email/${token}`,
  });
};

// const signup = async (req, res, next) => {
//   try {
//     let { username, email, password } = req.body;
//     const newUser = new User({ username, email });
//     const registeredUser = await User.register(newUser, password);
//     console.log(registeredUser);
//     const upperuser = username?.toUpperCase();

//     req.login(registeredUser, (err) => {
//       if (err) {
//         return next(err);
//       } else {
//         req.flash("success", `Welcome to WanderLust ${upperuser}!`);
//         res.redirect("/listings");
//       }
//     });
//   } catch (e) {
//     req.flash("error", "This username is already registered.");
//     res.redirect("/signup");
//   }
// };

const signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const email = req.body.email?.trim();
    if (!email) {
      req.flash("error", "Please enter a valid email address.");
      return res.redirect("/signup");
    }

    let user;
    try {
      user = await User.register(
        new User({ username, email, emailVerified: false }),
        password,
      );
    } catch (e) {
      if (e.name !== "UserExistsError") throw e;

      user = await User.findOne({ username });
      if (
        !user ||
        user.email.toLowerCase() !== email.toLowerCase() ||
        user.emailVerified
      ) {
        req.flash("error", "Username already registered.");
        return res.redirect("/signup");
      }
    }

    try {
      await sendVerificationEmail(user);
      req.flash(
        "success",
        "Check your email for a verification link. It expires in 15 minutes.",
      );
    } catch (mailError) {
      console.error("Verification email could not be sent:", mailError.message);
      req.flash(
        "error",
        "Your account is saved, but the verification email could not be sent. Check the mail settings and request another link below.",
      );
    }

    return res.redirect("/login");
  } catch (e) {
    next(e);
  }
};

const resendVerification = async (req, res) => {
  const email = req.body.email?.trim();
  if (!email) {
    req.flash("error", "Enter the email address you used to sign up.");
    return res.redirect("/login");
  }

  const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const user = await User.findOne({
    email: new RegExp(`^${escapedEmail}$`, "i"),
    emailVerified: false,
  });

  if (!user) {
    req.flash(
      "success",
      "If that address has an unverified account, a verification email will be sent.",
    );
    return res.redirect("/login");
  }

  try {
    await sendVerificationEmail(user);
    req.flash(
      "success",
      "A new verification link was sent if the email address belongs to this account. It expires in 15 minutes.",
    );
  } catch (mailError) {
    console.error("Verification email could not be resent:", mailError.message);
    req.flash(
      "error",
      "The verification email could not be sent. Please check the mail settings and try again.",
    );
  }

  return res.redirect("/login");
};

const verifyEmail = async (req, res) => {
  console.log("VERIFY EMAIL ROUTE HIT");
  const tokenHash = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) {
    req.flash(
      "error",
      "Invalid or expired verification link. Please sign up again.",
    );
    return res.redirect("/login");
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save();

  req.flash("success", "Email verified successfully! You can now log in.");

  res.redirect("/login");
};

const renderLogin = (req, res) => {
  res.render("users/login.ejs");
};

const login = async (req, res) => {
  req.flash("success", "Welcome back!");
  res.redirect(res.locals.redirectUrl || "/listings");
};

const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};

const userController = {
  signup,
  resendVerification,
  renderLogin,
  renderSignup,
  login,
  logout,
  verifyEmail,
};
export default userController;
