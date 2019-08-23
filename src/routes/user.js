const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const fs = require("fs");
const path = require("path");
const defaultAvatarPath = path.join(
  __dirname,
  "../../public/images/defaultAvatar.jpg"
);

//Users Sign up
router.post("/users/signup", async (req, res) => {
  try {
    const user = new User(req.body);
    const token = await user.getAuthToken();
    const defaultAvatar = fs.readFileSync(defaultAvatarPath);
    user.avatar = defaultAvatar.toString("base64");
    await user.save();
    res.status(201).send({ token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//User Login Route
router.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    const token = await user.getAuthToken();
    res.status(200).send({ token, user });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//user Log out from current session
router.post("/users/logout", auth, async (req, res) => {
  const user = req.user;
  user.tokens = user.tokens.filter(token => token.token !== req.token);
  await user.save();
  res.status(200).send({ message: "User Log Out Successfull" });
});

//user Log out from All Sessions
router.post("/users/logoutAll", auth, async (req, res) => {
  const user = req.user;
  user.tokens = [];
  await user.save();
  res
    .status(200)
    .send({ message: "User Log Out from All Sessions Successfull" });
});

//Get User Profile using User Handle(User Name)
router.get("/users/:username", auth, async (req, res) => {
  try {
    const handle = req.params.username;
    const user = await User.findOne({ handle });
    if (!user) throw new Error();
    res.status(200).send(user);
  } catch (error) {
    res.status(404).send({ error: "User Not Found" });
  }
});

module.exports = router;
