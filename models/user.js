import mongoose from "mongoose";
import passportLocalMongooseModule from "passport-local-mongoose";
import passport from "passport";

const passportLocalMongoose = passportLocalMongooseModule.default;

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },

  emailVerified: {
    type: Boolean,
    default: false,
  },

  emailVerificationToken: {
    type: String,
  },

  emailVerificationExpires: {
    type: Date,
  },

  googleId: {
    type: String,
    sparse: true,
  },

  githubId: {
    type: String,
    sparse: true,
  },
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

export default User;
