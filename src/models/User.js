const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (!validator.isAlpha(value)) {
        throw new Error("must contain only alphabet");
      }
    }
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (!validator.isAlpha(value)) {
        throw new Error("must contain only alphabet");
      }
    }
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("must be a vaild email address");
      }
    }
  },
  handle: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  gender: {
    type: String,
    default: "male",
    enum: ["male", "female"]
  },
  mobile: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isMobilePhone(value)) {
        throw new Error("must be a vaild phone number");
      }
    }
  },
  avatar: {
    type: Buffer
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate(value) {
      if (validator.contains(value.toLowerCase(), "password")) {
        throw new Error("cannot contain phrase password");
      }
    }
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      }
    }
  ]
});

userSchema.methods.getAuthToken = async function() {
  const user = this;
  const token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar
    },
    process.env.AUTH_SECRET
  );
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to Login");
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Unable to Login");
  return user;
};

userSchema.pre("save", async function(next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
