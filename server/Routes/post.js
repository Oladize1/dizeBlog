import express from "express";
import {
  getAllPosts,
  getSinglePost,
  createPost,
  updatePost,
  deletePost,
  getPostsSpecificToAuthor,
  commentOnPost,
  addBookmark,
  removeBookmark,
  likePost,
  getBookmarks,
  getCommentsForPost,
} from "../controllers/post.js";
import { isAuth } from "../middleware/isAuth.js";

export const postRouter = express.Router();


postRouter.get("/", getAllPosts);
postRouter.get("/comments/:id", getCommentsForPost);


postRouter.get("/author", isAuth, getPostsSpecificToAuthor);
postRouter.get("/bookmarks", isAuth, getBookmarks);
postRouter.post("/", isAuth, createPost);

postRouter.post("/bookmark/:id", isAuth, addBookmark);
postRouter.delete("/bookmark/:id", isAuth, removeBookmark);
postRouter.post("/like/:id", isAuth, likePost);
postRouter.post("/comment/:id", isAuth, commentOnPost);

postRouter.patch("/:id", isAuth, updatePost);
postRouter.delete("/:id", isAuth, deletePost);
postRouter.get("/:id", isAuth, getSinglePost);
