import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import apiClient from '../api/apiClient';

/**
 * HomePage Component
 * Displays a list of all blog posts. Fetches posts from the API on component mount.
 */
const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * Fetches all blog posts from the backend API.
     */
    const fetchPosts = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        const response = await apiClient.get('/posts');
        setPosts(response.data);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
        setPosts([]); // Ensure posts array is empty on error
      } finally {
        setLoading(false); // Set loading to false after fetching (success or error)
      }
    };

    fetchPosts();
  }, []); // Empty dependency array means this effect runs once after the initial render

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-gray-600">Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Latest Posts</h1>
      {posts.length === 0 ? (
        <p className="text-center text-xl text-gray-600">No posts found. Be the first to create one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;