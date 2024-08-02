import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';

/**
 * PostDetailPage Component
 *
 * Displays the full content of a single blog post.
 * Allows authenticated users who are the author of the post to edit or delete it.
 */
const PostDetailPage = () => {
  // Get the post ID from the URL parameters
  const { postId } = useParams();
  // Hook to programmatically navigate
  const navigate = useNavigate();
  // Access user authentication state from AuthContext
  const { user } = useContext(AuthContext);

  // State to store the fetched post data
  const [post, setPost] = useState(null);
  // State to manage loading status
  const [loading, setLoading] = useState(true);
  // State to store any error messages
  const [error, setError] = useState(null);

  /**
   * useEffect hook to fetch post data when the component mounts or postId changes.
   */
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        setError(null); // Clear any previous errors

        // Make an API call to get the specific post
        const response = await apiClient.get(`/posts/${postId}`);
        setPost(response.data); // Update post state with fetched data
      } catch (err) {
        console.error('Error fetching post:', err);
        // Set an error message if the API call fails
        setError('Failed to load post. Please try again later.');
        setPost(null); // Clear post data on error
      } finally {
        setLoading(false); // Set loading to false after fetch attempt
      }
    };

    fetchPost(); // Call the fetch function
  }, [postId]); // Dependency array: re-run effect if postId changes

  /**
   * Handles the deletion of a post.
   * Prompts the user for confirmation before making the API call.
   */
  const handleDelete = async () => {
    // Confirm with the user before proceeding with deletion
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return; // If user cancels, stop the function
    }

    try {
      // Make an API call to delete the post
      await apiClient.delete(`/posts/${postId}`);
      alert('Post deleted successfully!'); // Inform user of success
      navigate('/'); // Redirect to the home page after successful deletion
    } catch (err) {
      console.error('Error deleting post:', err);
      // Set an error message if deletion fails
      setError('Failed to delete post. Please try again.');
    }
  };

  /**
   * Handles navigation to the post editing page.
   * Navigates to the CreatePostPage, passing the post ID as a query parameter
   * so that the CreatePostPage can pre-fill the form for editing.
   */
  const handleEdit = () => {
    navigate(`/create-post?id=${postId}`);
  };

  // --- Conditional Rendering based on loading and error states ---

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg font-semibold text-gray-700">Loading post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-600">
        <p className="text-lg font-semibold">{error}</p>
      </div>
    );
  }

  if (!post) {
    // This case should ideally be covered by `error` if fetch fails,
    // but acts as a fallback if `post` is null after loading.
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg font-semibold text-gray-700">Post not found.</p>
      </div>
    );
  }

  // Determine if the currently logged-in user is the author of the post
  // `post.author` is expected to be an object with an `_id` property, populated by the backend.
  const isAuthor = user && post.author && user._id === post.author._id;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <article className="bg-white shadow-lg rounded-lg p-6 mb-8">
        {/* Post Title */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{post.title}</h1>

        {/* Post Metadata (Author and Date) */}
        <div className="text-gray-600 text-sm mb-6 flex items-center space-x-2">
          {post.author && (
            <span className="font-medium">By {post.author.username}</span>
          )}
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Post Content */}
        {/*
          The content is rendered using dangerouslySetInnerHTML because it comes from a rich text editor
          and contains HTML. The 'prose' class from @tailwindcss/typography is used to style the raw HTML content.
          Ensure @tailwindcss/typography is installed and configured in your Tailwind CSS setup.
        */}
        <div
          className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Edit and Delete Buttons (only visible to the author) */}
        {isAuthor && (
          <div className="mt-8 flex space-x-4">
            <button
              onClick={handleEdit}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200 ease-in-out"
              aria-label="Edit Post"
            >
              Edit Post
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-200 ease-in-out"
              aria-label="Delete Post"
            >
              Delete Post
            </button>
          </div>
        )}
      </article>
    </div>
  );
};

export default PostDetailPage;