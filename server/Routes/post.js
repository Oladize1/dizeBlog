import express from 'express';

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
    getCommentsForPost 
} from '../controllers/post.js';

import {isAuth} from "../middleware/isAuth.js"

export const postRouter = express.Router();

postRouter.get('/', getAllPosts);
postRouter.use(isAuth)
postRouter.get('/author', getPostsSpecificToAuthor); 
postRouter.post('/', createPost);
postRouter.get('/bookmarks', getBookmarks);
postRouter.get('/:id', getSinglePost);
postRouter.get('/comments/:id', getCommentsForPost);
postRouter.post('/bookmark/:id', addBookmark);
postRouter.post('/like/:id', likePost);
postRouter.delete('/bookmark/:id', removeBookmark);
postRouter.patch('/:id', updatePost);
postRouter.post('/comment/:id', commentOnPost);
postRouter.delete('/:id', deletePost);