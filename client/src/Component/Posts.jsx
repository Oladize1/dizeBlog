import React, {useEffect, useState} from "react";
import InfiniteScroll from 'react-infinite-scroll-component'
import PostCard from "./PostCard";
import { usePostStore, useAuthStore } from "../store";
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Spinner from '../Component/Spinner'
const POSTS_PER_PAGE = 10
const Posts = () => {
  const { posts, error, isLoading, getAllPosts, getSinglePost } = usePostStore()
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()
 

  const [displayedPosts, setDisplayedPosts] = useState([])
  const [currentOffset, setCurrentOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)



  useEffect(() => {
    getAllPosts()
  }, [getAllPosts])

  useEffect(() => {
    if(posts) {
      const initialPosts = posts.slice(0, POSTS_PER_PAGE)
      setDisplayedPosts(initialPosts)
      setCurrentOffset(POSTS_PER_PAGE)
      setHasMore(posts.length > POSTS_PER_PAGE)
    }
  }, [posts])

  const handleSinglePost = async (id) => {
    try {
      if (!user) {
        navigate('/login')
        return 
      }
      await getSinglePost(id)
      navigate(`/post/${id}`)
    } catch (error) {
      toast(error.response?.data)
      if (error.response?.data?.message.includes('jwt expired')) {
        logout()
        navigate('/login')
      }
    }
  }

  const fetchMorePosts = () => {
    if(posts) {
      const nextOffset = currentOffset + POSTS_PER_PAGE
      const nextPosts = posts.slice(currentOffset, nextOffset)
      setDisplayedPosts(prev => [...prev, ...nextPosts])
      setCurrentOffset(nextOffset)
      if (nextOffset >= posts.length) {
        setHasMore(false)
      }
    }
  }

  return (
    <div className="container mx-auto mt-10 mb-5 px-4">
      {/* Show Loading Skeleton */}
      {isLoading ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-gray-200 animate-pulse p-5 rounded-lg shadow-lg">
              <div className="h-6 w-3/4 bg-gray-300 rounded mb-3"></div>
              <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
              <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-gray-300 rounded mb-4"></div>
              <div className="h-6 w-24 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">Error loading posts.</p>
      ) : (
        <InfiniteScroll
            dataLength={displayedPosts.length}
            next={fetchMorePosts}
            hasMore={hasMore}
            loader={<Spinner/>}
            endMessage={<p className="font-semibold text-center">No more Posts</p>}
          >

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedPosts? displayedPosts?.map((post) => (
            <PostCard key={post._id} post={post} onClick={() => {handleSinglePost(post._id)}} />
          )): <p className="text-center text-3xl">Empty Posts</p>}
        </div>
          </InfiniteScroll>
      )}
    </div>
  );
};

export default Posts;
