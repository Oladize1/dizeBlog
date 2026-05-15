import React, { useState, useEffect } from 'react';
import { usePostStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from '../Component/Spinner';

const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  const navigate = useNavigate();
  const { createPost, isLoading, error } = usePostStore();

  if (isLoading) return <Spinner />;
  if (error) return toast(error);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Only enable save if all fields are non-empty
  const canSave = Boolean(title) && Boolean(description) && Boolean(content);

  const handleCreatePost = async (e) => {
    e.preventDefault();

    // For plain text content, just trim the input.
    const plainContent = content.trim();

    if (plainContent.length < 50) {
      toast.error('Content must be at least 50 characters long.');
      return;
    }

    try {
      // Create the post with the plain text content.
      await createPost(title, description, plainContent);
      if (!error) {
        setTitle("");
        setDescription("");
        setContent("");
        toast.success("Post created successfully");
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data);
      // If token is expired, you might want to logout and navigate to login.
      // if (error?.message?.name === 'TokenExpiredError') {
      //   logout();
      //   navigate('/login');
      // }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-center text-4xl mb-6">Create Post</h2>
      <form
        className="flex flex-col gap-4 justify-center items-center w-full max-w-3xl mx-auto"
        onSubmit={handleCreatePost}
      >
        <div className="w-full">
          <input
            type="text"
            placeholder="Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input input-lg w-full"
          />
        </div>
        <div className="w-full">
          <input
            type="text"
            placeholder="Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input input-lg w-full"
          />
        </div>
        <div className="w-full">
          <textarea
            placeholder="Write your post content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="textarea textarea-bordered w-full"
            rows="10"
          />
        </div>
        <button type="submit" className="btn btn-primary mt-4 w-full" disabled={!canSave}>
          Create Post
        </button>
      </form>
    </div>
  );
};

export default CreatePostPage;
