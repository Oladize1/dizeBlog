import { postRepository } from "../repositories/post.repository.js";
import { userRepository } from "../repositories/user.repository.js";

export const postService = {
  createPost: async (title, description, content, userId, role) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      const error = new Error("Un Authorized: please login");
      error.statusCode = 401;
      throw error;
    }
    if (role !== "author") {
      const error = new Error("User is not allowed to create posts");
      error.statusCode = 401;
      throw error;
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
      throw error;
    }

    user.posts = user.posts.concat(newPost._id);
    await user.save();
    return newPost;
  },
  getAuthorsPost: async (userId) => {
    const authorPosts = await postRepository.getAuthorPosts(userId);

    return authorPosts;
  },
  getAllPosts: async (offset, limit) => {
    const allPosts = await postRepository.posts(offset, limit);

    return allPosts;
  },
  getSinglePost: async (id, userId) => {
    const getPost = await postRepository.getSinglePost(id);
    if (!getPost) {
      const error = new Error("Post not Found");
      error.statusCode = 404;
      throw error;
    }
    if (!getPost.watched.includes(userId)) {
      getPost.watched.push(userId);
      await getPost.save();
    }
    return getPost;
  },
  updatePost: async (id, userId, title, description, content) => {
    const post = await postRepository.findPostById(id);
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== userId.toString()) {
      const error = new Error("User is not allowed to update this post");
      error.statusCode = 403;
      throw error;
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
  deletePost: async (id, userId) => {
    const post = await postRepository.findPostById(id);
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== userId.toString()) {
      const error = new Error("User is not allowed to update this post");
      error.statusCode = 403;
      throw error;
    }
    const deletePost = await postRepository.deletePost(id, userId);
    return deletePost;
  },
  comment: async (comment, userId, username, postId) => {
    const post = await postRepository.findPostById(postId);
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
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
      throw error;
    }
    return newComment;
  },
  getPostComments: async (id) => {
    const post = await postRepository.getSinglePost(id);
    if (!post) {
      const error = new Error("Post Not Found");
      error.statusCode = 404;
      throw error;
    }
    return post.comments;
  },
  bookmark: async (postId, userId, res) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      const error = new Error("UnAuthorized: please sign in");
      error.statusCode = 401;
      throw error;
    }
    if (user.bookmarks.map(String).includes(postId)) {
      return res.status(200).json({ message: "Post already bookmarked" });
    }
    user.bookmarks = user.bookmarks.concat(postId);
    await user.save();
    return user.bookmarks;
  },
  removeBookmarked: async (userId, postId) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      const error = new Error("UnAuthorized: please sign in");
      error.statusCode = 401;
      throw error;
    }
    user.bookmarks = user.bookmarks.filter((b) => b.toString() !== postId);
    await user.save();
    return user.bookmarks;
  },
  getBookmarks: async (userId) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      const error = new Error("UnAuthorized: Please sign in");
      error.statusCode = 401;
      throw error;
    }
    const bookmarks = user.bookmarks;

    return bookmarks;
  },
  likePost: async (userId, postId) => {
    const post = await postRepository.findPostById(postId);
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
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
