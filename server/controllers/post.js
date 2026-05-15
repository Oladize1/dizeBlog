import { Post, Comment } from "../model/Post.js";
import { User } from "../model/User.js";
import { getTokenFrom } from "../utils/token.js";
import { postService } from "../services/post.service.js";

import jwt from "jsonwebtoken";

export const getPostsSpecificToAuthor = async (req, res, next) => {
  try {
    const { userRole, userId } = req.user;
    if (userRole !== "author") {
      return res.status(403).json({ message: "User is not an author " });
    }
    const postsOfAuthor = await postService.getAuthorsPost(userId, res);

    return res.status(200).json(postsOfAuthor);
  } catch (error) {
    return next(error);
  }
};

export const getAllPosts = async (req, res) => {
  try {
    let { offset } = req.query;
    offset = parseInt(offset) || 0;
    const limit = 10;
    const posts = await postService.getAllPosts(offset, limit, res);
    return res.status(200).json(posts);
  } catch (error) {
    return next(error);
  }
};

export const getSinglePost = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const post = await postService.getSinglePost(id, userId, next);
    return res.status(200).json(post);
  } catch (error) {
    return res.next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const { userId, userRole } = req.user;

    const body = req.body;
    if (!body.title || !body.description || !body.content) {
      return res
        .status(400)
        .json({ message: "Title, description and content are required" });
    }

    const post = await postService.createPost(
      body.title,
      body.description,
      body.content,
      userId,
      userRole,
      next,
    );

    return res.status(201).json(post);
  } catch (error) {
    return next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const { userId, userRole } = req.user;
    const { id } = req.params;
    const { title, description, content } = req.body;

    if (userRole !== "author") {
      const error = new Error("User is not allowed to delete post");
      error.statusCode = 403;
      return next(error);
    }

    const updatedPost = await postService.updatePost(
      id,
      userId,
      title,
      description,
      content,
      next,
    );
    return res.status(200).json(updatedPost);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { userId, userRole } = req.user;
    const { id } = req.params;

    if (userRole !== "author") {
      const error = new Error("User is not allowed to delete post");
      error.statusCode = 403;
      return next(error);
    }

    const deletePost = await postService.deletePost(id, userId, next);
    return res.status(200).json(deletePost);
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const commentOnPost = async (req, res, next) => {
  try {
    const { userId, userName } = req.user;
    const { id } = req.params;
    const { comment } = req.body;
    if (!comment) {
      const error = new Error("comment field is empty");
      error.statusCode = 400;
      return next(error);
    }

    const newComment = await postService.comment(
      comment,
      userId,
      userName,
      id,
      next,
    );

    return res.status(201).json(newComment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getCommentsForPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await postService.getPostComments(id, res, next);
    return res.status(200).json(post);
  } catch (error) {
    return next(error);
  }
};

export const addBookmark = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const bookmark = await postService.bookmark(id, userId, res, next);

    return res.status(200).json(bookmark);
  } catch (error) {
    return next(error);
  }
};

export const removeBookmark = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const removedBookmark = await postService.removeBookmarked(
      userId,
      id,
      next,
    );
    return res
      .status(200)
      .json({ message: "Bookmark removed", bookmarks: removedBookmark });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getBookmarks = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const bookmarks = await postService.getBookmarks(userId, res, next);
    return res.status(200).json(bookmarks);
  } catch (error) {
    return next(error);
  }
};

export const likePost = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    
    const post = await postService.likePost(userId, id, next)
    return res.status(200).json(post);
  } catch (error) {
    return next(error)
  }
};
