import { create } from 'zustand'
import axios from 'axios'
// const BASE_URL = 'https://dizeblog.onrender.com/api/blog'
const BASE_URL = 'http://localhost:3000/api/blog'
export const useAuthStore = create((set) => ({
    user: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
    error:null,
    isLoading:false,

    register: async (name, username, password, role='user') => {
        let payload = {name, username, password, role}
        set({isLoading: true, error: null});
        try {
            await axios.post(`${BASE_URL}/register`, payload)
            set({error: null, isLoading: false })
        } catch (error) {
            set({error: error.response?.data, isLoading: false})
            throw error;
        }
    },

    login: async (username, password) => {
      set({isLoading: true, error: null}) 
      try {
        const res = await axios.post(`${BASE_URL}/login`, {username, password})
        localStorage.setItem("userInfo", JSON.stringify(res.data))
        set({user: res.data, error:null, isLoading: false})       
      } catch (error) {
        set({error: error.response?.data || "An error occurred", isLoading:false})
        throw error
      } 
    },
    logout: async() => {
        localStorage.removeItem('userInfo')
        set({user: null, error: null})
    },
    // getUser: async(id) =>  {
    //     set({isLoading: true, error: null})
    //     try {
    //         const user = await axios.get(`http://localhost:3000/api/blog/${id}`)
    //         set({isLoading: false, error: null})
    //         return user.data?.username
    //     } catch (error) {
    //         set({isLoading: false, error: error?.response?.data})
    //         throw error
    //     }
    // }

}))

export const usePostStore = create((set, get) => ({
    posts: [],
    authorPosts: [],
    isLoading: false,
    error: null,
    selectedPost: {},
    postToEdit: {},
    bookmarks: localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo')).bookmarks
  : [], 

    getAllPosts: async() => {
        set({isLoading: true, error: null})        
        try {
            const post = await axios.get(`${BASE_URL}/post`)
            set({posts: post.data, error:null, isLoading:false})   
        } catch (error) {
            set({isLoading:false, error: error.response?.data})
            throw error
        }
    },
    getSinglePost: async(id) => {
        set({isLoading: true, error: null})
        try {
            const token = useAuthStore.getState().user?.token; 
            const singlePost = await axios.get(`${BASE_URL}/post/${id}`, {
              headers : {
                Authorization: `Bearer ${token}`
              }
            })
            
            set({isLoading: false, error: null, selectedPost:singlePost.data, postToEdit: singlePost.data})
        } catch (error) {
            set({isLoading: false, error:error.response?.data })
            throw error
        }
    },
    createPost: async(title, description, content) =>  {
        set({isLoading: true, error:null})
        try {
            const token = useAuthStore.getState().user?.token; 
            const newPost = await axios.post(`${BASE_URL}/post`, {title, description, content}, {
                headers : {
                    Authorization: `Bearer ${token}`
                }
            })
            set((state) => ({
                posts: [...state.posts, newPost.data],
                error: null,
                isLoading: false
            }));

        } catch (error) {
            set({isLoading:false, error: error.response?.data}) 
            throw error
        }
    }, 
    editPost: async(id, title, description, content) => {
        set({isLoading: true, error: null})
        try {
            const token = useAuthStore.getState().user?.token; 
            await axios.patch(`${BASE_URL}/post/${id}`, {title, description, content} ,{
              headers : {
                Authorization: `Bearer ${token}`
              }
            })
            set({isLoading: false, error: null})
        } catch (error) {
            set({isLoading: false, error: error.response?.data})
            throw error
        }
    },
    getAuthorPosts: async() => {
        set({isLoading: true, error: null})
        try {
            const token = useAuthStore.getState().user?.token
            const posts = await axios.get(`${BASE_URL}/post/author`, {
                headers : {
                    Authorization : `Bearer ${token}`
                }
            })
            set({isLoading: false, error: null, authorPosts: posts.data})
        } catch (error) {
            if (error.response && error.response.status === 404) {
                set({ isLoading: false, error: null, authorPosts: [] });
                throw error
            } else {
                set({ isLoading: false, error: error.response?.data || "An error occurred" });
                throw error
             }
        }
    },
    deletePost: async(id) => {
        set({isLoading: true, error: null})
        try {
            const token = useAuthStore.getState().user?.token; 
            await axios.delete(`${BASE_URL}/post/${id}`, {
                headers : {
                    Authorization: `Bearer ${token}`
                }
            })
            
            set(state => ({
                bookmarks: state.bookmarks.filter(bookmark => bookmark !== id),
                isLoading: false,
                 error: null
            }))
        } catch (error) {
            set({isLoading: false, error: error.response?.data})
            throw error
        }
    },
    likePost: async(id) => {
        set({isLoading: true, error: null})
        try {
            const token = useAuthStore.getState().user?.token
            const likedPost = await axios.post(`${BASE_URL}/post/like/${id}`, null ,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const updatedPost = likedPost.data
             set((state) => ({
                posts: state.posts.map((post) =>
                  post._id === id ? updatedPost : post
                ),
                // Optionally, update the selectedPost if it's the same one
                selectedPost: state.selectedPost._id === id ? updatedPost : state.selectedPost,
                isLoading: false,
                error: null
            }));
        } catch (error) {
            set({isLoading: false, error: error.response?.data})
            throw error
        }
    },
    // existingBookmarks: async() => {
    //     set({isLoading: true, error: null})
    //     try {
    //         const token = useAuthStore.getState().user?.token
    //         const myBookmarks = await axios.get('http://localhost:3000/api/blog/post/bookmarks', {
    //             headers : {
    //                 Authorization: `Bearer ${token}`
    //             }
    //         })
            
    //         set({isLoading: false, error: null, bookmarks: myBookmarks.data })
    //     } catch (error) {
    //         set({isLoading: false, error: error.response?.data})
    //         throw error
    //     }
    // },
    addBookmark: async(id) => {
        set({isLoading: true, error: null})
        try {
            const token = useAuthStore.getState().user?.token;            
            const bookmark = await axios.post(`${BASE_URL}/post/bookmark/${id}`, null, {
                headers: {
                    Authorization : `Bearer ${token}`
                }
            })
            
            
             set((state) => ({
                bookmarks: bookmark.data,
                isLoading: false,
                error: null 
             }));
        } catch (error) {
            set({isLoading: false, error: error.response?.data})
            throw error
        }
    },
    removeBookmark: async(id) => {
        set({isLoading: true, error: null})
        try {
            const token = useAuthStore.getState().user?.token
            await axios.delete(`${BASE_URL}/post/bookmark/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            set(state => ({
                bookmarks: state.bookmarks.filter(bookmark => bookmark !== id),
                isLoading: false,
                 error: null
            }))
        } catch (error) {
            set({isLoading: false, error: error.response?.data})
            throw error
        }
    },
    addComment: async(id, comment) => {
        set({isLoading: true, error: null})
        try {
            const token = useAuthStore.getState().user?.token
            const addNewComment = await axios.post(`${BASE_URL}/post/comment/${id}`, {comment}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
               set((state) => ({
                selectedPost: {
                  ...state.selectedPost,
                  comments: state.selectedPost.comments
                    ? [addNewComment.data, ...state.selectedPost.comments]
                    : [addNewComment.data]
                },
                isLoading: false,
                error: null
            }))
        } catch (error) {
            set({isLoading: false, error: error.response?.data})
            throw error
        }
    }
}))