import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import RichTextEditor from '../components/RichTextEditor';

/**
 * CreatePostPage Component
 *
 * Allows authenticated users to create a new blog post.
 * Features a form with fields for title, summary, content (using a rich text editor),
 * and an optional thumbnail image. Handles form submission, API calls,
 * loading states, error handling, and redirects upon successful post creation.
 */
const CreatePostPage = () => {
  // State for form fields
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState(''); // HTML content from RichTextEditor
  const [thumbnail, setThumbnail] = useState(null); // File object for thumbnail

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Context for authentication status
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect unauthenticated users to the login page
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  /**
   * Handles changes from the RichTextEditor component.
   * @param {string} newContent - The HTML content from the editor.
   */
  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  /**
   * Handles file selection for the post thumbnail.
   * @param {Object} e - The event object from the file input.
   */
  const handleThumbnailChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0]);
    } else {
      setThumbnail(null);
    }
  };

  /**
   * Handles the form submission for creating a new post.
   * @param {Object} e - The event object from the form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Create FormData to handle text fields and file upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('summary', summary);
      formData.append('content', content);
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      // Make API call to create the post
      const response = await apiClient.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });

      setSuccess(true);
      // Redirect to the newly created post's detail page
      navigate(`/posts/${response.data.post._id}`);
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If not authenticated, show a loading/redirect message or null
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Create New Post</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        {/* Title Input */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Summary Input */}
        <div className="mb-6">
          <label htmlFor="summary" className="block text-gray-700 text-sm font-bold mb-2">
            Summary (Optional)
          </label>
          <textarea
            id="summary"
            rows="3"
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="A short summary of your post"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            disabled={loading}
          ></textarea>
        </div>

        {/* Rich Text Editor for Content */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <RichTextEditor value={content} onChange={handleContentChange} readOnly={loading} />
        </div>

        {/* Thumbnail Upload */}
        <div className="mb-6">
          <label htmlFor="thumbnail" className="block text-gray-700 text-sm font-bold mb-2">
            Thumbnail Image (Optional)
          </label>
          <input
            type="file"
            id="thumbnail"
            accept="image/*"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={handleThumbnailChange}
            disabled={loading}
          />
          {thumbnail && (
            <p className="mt-2 text-sm text-gray-600">Selected: {thumbnail.name}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> Post created successfully. Redirecting...</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Creating Post...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostPage;