const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");

const upload = multer({
  limits: {
    fileSize: 10000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  }
});

//Create Post
router.post("/posts", auth, upload.single("file"), async (req, res) => {
  try {
    const post = new Post({ content: req.body.content, owner: req.user._id });
    if (req.file) {
      const buffer = await sharp(req.file.buffer)
        .png()
        .resize(500, 500)
        .toBuffer();
      post.postImage = buffer.toString("base64");
    }
    await post.save();
    const posts = await Post.find({ owner: req.user._id });
    res.status(201).send(posts);
  } catch (error) {
    res.status(400).send({ error: "Post creation Unsucessful" });
  }
});

//Get All Posts
router.get("/posts", auth, async (req, res) => {
  try {
    const posts = await Post.find({});
    if (!posts) {
      throw new Error();
    }
    res.status(200).send(posts);
  } catch (error) {
    res.status(404).send({ error: "No Posts Found" });
  }
});

//Get User Posts
router.get("/posts/:username", auth, async (req, res) => {
  try {
    const user = await User.findOne({ handle: req.params.username });
    const posts = await Post.find({ owner: user._id });
    if (!posts) {
      throw new Error();
    }
    res.status(200).send(posts);
  } catch (error) {
    res.status(404).send({ error: "No Posts Found" });
  }
});

//Get Post by id
router.get("/posts/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!post) {
      throw new Error();
    }
    res.status(200).send(post);
  } catch (error) {
    res.status(404).send({ error: "Post not found" });
  }
});

//Update Post by id
router.patch(
  "/posts/:id",
  auth,
  upload.single("postImage"),
  async (req, res) => {
    const _id = req.params.id;
    try {
      const post = await Post.findOne({ _id, owner: req.user._id });
      if (!post) throw new Error();
      post.content = req.body.content;
      if (req.file) {
        const buffer = await sharp(req.file.buffer)
          .png()
          .resize(500, 500)
          .toBuffer();
        post.postImage.file = buffer;
      }
      await post.save();
      res.status(200).send({ message: "Post Updated" });
    } catch (error) {
      res.status(400).send({ error: "Failed updating the post" });
    }
  }
);

//Delete Post by id
router.delete("/posts/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!post) throw new Error();
    res.status(200).send({ message: "Post is deleted sucessfully" });
  } catch (error) {
    res.status(400).send({ error: "Failed deleting the post" });
  }
});

//Delete all Posts by specific User
router.delete("/posts", auth, async (req, res) => {
  try {
    await Post.deleteMany({ owner: req.user._id });
    res.status(200).send({ message: "All Posts by the user are deleted" });
  } catch (error) {
    res.status(400).send({ error: "Failed deleting all posts" });
  }
});

module.exports = router;
