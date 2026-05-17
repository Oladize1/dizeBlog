import mongoose from "mongoose";

// Post Schema
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 50,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    watched: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Comment Schema
const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true },
);

// Virtual field to populate comments on a Post
postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
});

// Ensure virtuals are included when converting to JSON or Objects
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

// Pre-hook: when deleting a post, also delete its comments.
postSchema.pre("findOneAndDelete", async function (next) {
  try {
    // Get the post that is about to be deleted.
    const doc = await this.model.findOne(this.getFilter());
    if (doc) {
      // Delete all comments with post: doc._id using the registered model.
      await mongoose.model("Comment").deleteMany({ post: doc._id });
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Register models
export const Post = mongoose.model("Post", postSchema);
export const Comment = mongoose.model("Comment", commentSchema);
