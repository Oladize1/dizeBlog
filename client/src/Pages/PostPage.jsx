import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import DOMPurify from "dompurify";
import { useParams, useNavigate } from "react-router-dom";
import { usePostStore } from "../store";
import { format } from "timeago.js";
import Spinner from "../Component/Spinner";
import { toast } from "react-toastify";

const COMMENTS_PER_PAGE = 10;

const PostPage = () => {
  const { isLoading, selectedPost, error, getSinglePost, addComment } =
    usePostStore();

  const { id } = useParams();
  const [commentInput, setCommentInput] = useState("");
  // const [commentss, setComments] = useState([]);

  const navigate = useNavigate();

  // State for pagination/infinite scroll
  const [displayedComments, setDisplayedComments] = useState([]);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Fetch the post details
  useEffect(() => {
    getSinglePost(id);
  }, [id]);

  // Once the post is fetched, set the initial comments (if any)
  // useEffect(() => {
  //   if (selectedPost && selectedPost.comments) {
  //     setComments(selectedPost.comments);
  //   }
  // }, [selectedPost]);

  // When the post is loaded (or when its comments change), set up the initial comments.
  useEffect(() => {
    if (selectedPost && selectedPost.comments) {
      // Comments are already sorted descending by createdAt (newest first)
      const initialComments = selectedPost.comments.slice(0, COMMENTS_PER_PAGE);
      setDisplayedComments(initialComments);
      setCurrentOffset(COMMENTS_PER_PAGE);
      setHasMore(selectedPost.comments.length > COMMENTS_PER_PAGE);
    }
  }, [selectedPost]);

  if (isLoading) return <Spinner />;
  if (error) return toast(error);

  const {
    title,
    creator,
    likes,
    watched,
    guestWatched,
    createdAt,
    updatedAt,
    content,
    comments,
  } = selectedPost;
  const safeContent = DOMPurify.sanitize(content);

  const totalViews = watched?.length || 0;

  // Function to load more comments
  const fetchMoreComments = () => {
    if (comments) {
      const nextOffset = currentOffset + COMMENTS_PER_PAGE;
      const nextComments = comments.slice(currentOffset, nextOffset);
      setDisplayedComments((prev) => [...prev, ...nextComments]);
      setCurrentOffset(nextOffset);
      if (nextOffset >= comments.length) {
        setHasMore(false);
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      await addComment(id, commentInput);
      setDisplayedComments((prev) => [...prev]);
      setCommentInput("");
      toast.success("comment created successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add comment");
    }
    // Create a new comment object (here we simply use Date.now() as a temporary ID)
    // const newComment = {
    //   id: Date.now(),
    //   text: commentInput,
    //   createdAt: new Date().toISOString(),
    //   user: "Anonymous" // Replace with actual user info if available
    // };
    // // Optionally, you could call an API to save this comment and then update your state.
    // setComments([newComment, ...commentss]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Post Title */}
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>

      {/* Post Metadata */}
      <div className="text-sm text-gray-600 mb-6">
        <span>Created by: {creator}</span> •{" "}
        <span>Created at: {format(createdAt)}</span> •{" "}
        <span>Last updated: {format(updatedAt)}</span>
      </div>

      {/* Post Content */}
      <div className="prose prose-lg text-gray-800 mb-8">
        <div dangerouslySetInnerHTML={{ __html: safeContent }} />
      </div>

      {/* Likes and Watched */}
      <div className="flex space-x-6 text-sm text-gray-600 mb-8">
        <div>
          <span className="font-semibold">{likes?.length}</span> Likes
        </div>
        <div>
          <span className="font-semibold">{totalViews}</span> Watched
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>
        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="mb-4">
          <textarea
            className="textarea textarea-bordered w-full mb-2"
            placeholder="Write your comment here..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            rows="3"
          />
          <button type="submit" className="btn btn-primary">
            Submit Comment
          </button>
        </form>
        {/* Infinite Scroll for Comments */}
        {displayedComments.length > 0 ? (
          <InfiniteScroll
            dataLength={displayedComments.length}
            next={fetchMoreComments}
            hasMore={hasMore}
            loader={<Spinner />}
            endMessage={
              <p className="text-center">
                <b>No more comments</b>
              </p>
            }
          >
            <ul className="space-y-4">
              {displayedComments.map((comment) => (
                <li
                  key={comment._id}
                  className="p-4 bg-white rounded-lg shadow"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">
                      {comment.username || "Anonymous"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.comment}</p>
                </li>
              ))}
            </ul>
          </InfiniteScroll>
        ) : (
          <p className="text-gray-500">No comments yet.</p>
        )}
      </div>
    </div>
  );
};

export default PostPage;
