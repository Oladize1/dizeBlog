import { Post, Comment } from "../model/Post.js";

export const postRepository = {
  getAuthorPosts: async (userId) => {
    return await Post.find({ creator: userId });
  },
  createPost: async (title, description, content, userId) => {
    return await Post.create({ title, description, content, creator: userId });
  },
  posts: async (offset, limit) => {
    return await Post.find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("creator", "-password -bookmarks -posts -role -username")
      .populate({
        path: "comments",
        options: { sort: { updatedAt: -1 } },
      });
  },
  /**
   *
   * @param {string} id
   * @returns
   */
  getSinglePost: async (id) => {
    return await Post.findById(id).populate({
      path: "comments",
      options: { sort: { createdAt: -1 } },
    });
  },
  findPostById: async (id) => {
    return await Post.findById(id);
  },
  updatePost: async (id, title, description, content, userId) => {
    return await Post.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(content !== undefined && { content }),
          creator: userId,
        },
      },
      { new: true },
    );
  },
  deletePost: async (id, userId) => {
    return await Post.findByIdAndDelete(id, { creator: userId });
  },
  createComment: async (comment, userId, username, postId) => {
    return await Comment.create({
      comment,
      creator: userId,
      username,
      post: postId,
    });
  },
};
