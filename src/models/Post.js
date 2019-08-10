const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true
    },
    postImage: {
      contentType: {
        type: String
      },
      file: {
        type: Buffer
      }
    },
    owner: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User"
    }
  },
  { timestamps: true }
);

postSchema.methods.toJSON = function() {
  const post = this;
  post.postImage.file = post.postImage.file.toString("base64");
  const postObject = post.toObject();
  return postObject;
};

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
