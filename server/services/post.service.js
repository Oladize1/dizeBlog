import { postRepository } from "../repositories/post.repository.js";
import { userRepository } from "../repositories/user.repository.js";

export const postService = {
  createPost: async (title, description, content, userId, role, next) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      const error = new Error("Un Authorized: please login");
      error.statusCode = 401;
      return next(error);
    }
    if (role !== "author") {
      const error = new Error("User is not allowed to create posts");
      error.statusCode = 401;
      return next(error);
    }
    const newPost = await postRepository.createPost(
      title,
      description,
      content,
      userId,
    );
    if (!newPost) {
      const error = new Error("Failed to create Post");
      error.statusCode = 400;
      return next(error);
    }

    user.posts = user.posts.concat(newPost._id);
    await user.save();
    return newPost;
  },
  getAuthorsPost: async (userId, res) => {
    const authorPosts = await postRepository.getAuthorPosts(userId);
    if (authorPosts.length === 0) {
      return res.status(200).json({ message: "No posts found" });
    }
    return authorPosts;
  },
  getAllPosts: async (offset, limit, res) => {
    const allPosts = await postRepository.posts(offset, limit);
    if (!allPosts) {
      return res.status(200).json("No Post at the moment");
    }
    return allPosts;
  },
  getSinglePost: async (id, userId, next) => {
    const getPost = await postRepository.getSinglePost(id);
    if (!getPost) {
      const error = new Error("Post not Found");
      error.statusCode = 404;
      return next(error);
    }
    if (!getPost.watched.includes(userId)) {
      getPost.watched.push(userId);
      await getPost.save();
    }
    return getPost;
  },
  updatePost: async (id, userId, title, description, content, next) => {
    const post = await postRepository.findPostById(id);
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      return next(error);
    }
    if (post.creator.toString() !== userId.toString()) {
      const error = new Error("User is not allowed to update this post");
      error.statusCode = 403;
      return next(error);
    }
    const updatedPost = await postRepository.updatePost(
      id,
      title,
      description,
      content,
      userId,
    );
    return updatedPost;
  },
  deletePost: async (id, userId, next) => {
    const post = await postRepository.findPostById(id);
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      return next(error);
    }
    if (post.creator.toString() !== userId.toString()) {
      const error = new Error("User is not allowed to update this post");
      error.statusCode = 403;
      return next(error);
    }
    const deletePost = await postRepository.deletePost(id, userId);
    return deletePost;
  },
  comment: async (comment, userId, username, postId, next) => {
    const post = await postRepository.findPostById(postId);
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      return next(error);
    }
    const newComment = await postRepository.createComment(
      comment,
      userId,
      username,
      post._id,
    );
    if (!newComment) {
      const error = new Error("Failed to create comment");
      error.statusCode = 500;
      return next(error);
    }
    return newComment;
  },
  getPostComments: async (id, res, next) => {
    const post = await postRepository.getSinglePost(id);
    if (!post) {
      const error = new Error("Post Not Found");
      error.statusCode = 404;
      return next(error);
    }

    if (post.comments.length === 0) {
      res.status(200).json({ message: "No comments at the moment" });
      return;
    }
    return post.comments;
  },
  bookmark: async (postId, userId, res, next) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      const error = new Error("UnAuthorized: please sign in");
      error.statusCode = 401;
      return next(error);
    }
    if (user.bookmarks.map(String).includes(postId)) {
      return res.status(200).json({ message: "Post already bookmarked" });
    }
    user.bookmarks = user.bookmarks.concat(postId);
    await user.save();
    return user.bookmarks;
  },
  removeBookmarked: async (userId, postId, next) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      const error = new Error("UnAuthorized: please sign in");
      error.statusCode = 401;
      return next(error);
    }
    user.bookmarks = user.bookmarks.filter((b) => b.toString() !== postId);
    await user.save();
    return user.bookmarks;
  },
  getBookmarks: async (userId, res, next) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      const error = new Error("UnAuthorized: Please sign in");
      error.statusCode = 401;
      return next(error);
    }
    const bookmarks = user.bookmarks;
    if (bookmarks.length === 0) {
      res.status(200).json({ message: "No bookmark at the moment" });
      return;
    }
    return bookmarks;
  },
  likePost: async (userId, postId, next) => {
    const post = await postRepository.findPostById(postId);
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      return next(error);
    }
    const userIndex = post.likes.indexOf(userId);

    if (userIndex === -1) {
      // User hasn't liked the post yet, so like it
      post.likes.push(userId);
    } else {
      // User has already liked it, so unlike it
      post.likes.splice(userIndex, 1);
    }

    await post.save();
    return post;
  },
};
