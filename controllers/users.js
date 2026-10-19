import User from "../models/user.js";

const renderSignup = (req, res) => {
  res.render("users/signup.ejs");
};

const signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    const upperuser = username?.toUpperCase();

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      } else {
        req.flash("success", `Welcome to WanderLust ${upperuser}!`);
        res.redirect("/listings");
      }
    });
  } catch (e) {
    req.flash("error", "This username is already registered.");
    res.redirect("/signup");
  }
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
  renderSignup,
  renderLogin,
  renderSignup,
  login,
  logout,
};
export default userController;
