const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true
    },
    postImage: {
      type: String
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
  const user = post.user;
  const postObject = post.toObject();
  return { ...postObject, user };
};

postSchema.pre("find", function() {
  this.populate("user");
});

postSchema.virtual("user", {
  ref: "User",
  localField: "owner",
  foreignField: "_id"
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
