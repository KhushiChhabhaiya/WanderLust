import User from "../models/user.js";
import crypto from "crypto";
import transporter from "../utils/mailer.js";

const renderSignup = (req, res) => {
  res.render("users/signup.ejs");
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
    const { username, email, password } = req.body;

    // Create a verification token
    const token = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      username,
      email,
      emailVerified: false,
      emailVerificationToken: crypto
        .createHash("sha256")
        .update(token)
        .digest("hex"),
      emailVerificationExpires: Date.now() + 15 * 60 * 1000,
    });

    // Register the user
    await User.register(newUser, password);

    // Create the verification link
    const verifyURL = `https://wanderlust-project-vwgq.onrender.com/verify-email/${token}`;
    // const verifyURL = `http://localhost:8080/verify-email/${token}`; // for locally before deploying

    // Send the verification email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Verify your WanderLust email",
      text: `Hello ${username}, please verify your email by clicking this link: ${verifyURL}`,
    });

    req.flash(
      "success",
      "Account created! Please check your email to verify your account.",
    );

    res.redirect("/login");
  } catch (e) {
    if (e.name === "UserExistsError") {
      req.flash("error", "Username already registered.");
      return res.redirect("/signup");
    }

    next(e);
  }
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
  renderLogin,
  renderSignup,
  login,
  logout,
  verifyEmail,
};
export default userController;
