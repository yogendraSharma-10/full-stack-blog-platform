/**
 * @file postController.js
 * @description Controller for handling blog post-related operations.
 * This file contains functions for creating, retrieving, updating, and deleting blog posts.
 * It interacts with the Post and User models to perform database operations.
 */

const Post = require('../models/Post');
const User = require('../models/User'); // Potentially needed for populating author details

/**
 * @route POST /api/posts
 * @description Create a new blog post.
 * @access Private (requires authentication)
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing post data (title, content, tags, coverImage).
 * @param {Object} req.user - The authenticated user object (added by authMiddleware).
 * @param {Object} res - The response object.
 */
exports.createPost = async (req, res) => {
  try {
    const { title, content, tags, coverImage } = req.body;
    const author = req.user.id; // User ID from the authenticated token

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required to create a post.' });
    }

    const newPost = new Post({
      title,
      content,
      author,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [], // Split comma-separated tags
      coverImage,
    });

    const savedPost = await newPost.save();

    // Populate the author field to return user details
    const populatedPost = await Post.findById(savedPost._id)
      .populate('author', 'username email'); // Only return username and email of the author

    res.status(201).json({ message: 'Post created successfully', post: populatedPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
};

/**
 * @route GET /api/posts
 * @description Get all blog posts.
 * @access Public
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getAllPosts = async (req, res) => {
  try {
    // Fetch all posts and populate the author field with selected user details
    const posts = await Post.find({})
      .populate('author', 'username email') // Populate author with username and email
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    res.status(200).json({ posts });
  } catch (error) {
    console.error('Error fetching all posts:', error);
    res.status(500).json({ message: 'Failed to retrieve posts', error: error.message });
  }
};

/**
 * @route GET /api/posts/:id
 * @description Get a single blog post by ID.
 * @access Public
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters containing the post ID.
 * @param {Object} res - The response object.
 */
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate('author', 'username email'); // Populate author with username and email

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    res.status(200).json({ post });
  } catch (error) {
    console.error(`Error fetching post with ID ${req.params.id}:`, error);
    // Check for invalid MongoDB ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid post ID format.' });
    }
    res.status(500).json({ message: 'Failed to retrieve post', error: error.message });
  }
};

/**
 * @route PUT /api/posts/:id
 * @description Update an existing blog post.
 * @access Private (requires authentication and ownership)
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters containing the post ID.
 * @param {Object} req.body - The request body containing updated post data.
 * @param {Object} req.user - The authenticated user object (added by authMiddleware).
 * @param {Object} res - The response object.
 */
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags, coverImage } = req.body;
    const userId = req.user.id; // Authenticated user's ID

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Check if the authenticated user is the author of the post
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this post.' });
    }

    // Update post fields
    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags ? tags.split(',').map(tag => tag.trim()) : post.tags;
    post.coverImage = coverImage || post.coverImage;
    post.updatedAt = Date.now(); // Update the updatedAt timestamp

    const updatedPost = await post.save();

    // Populate the author field to return user details
    const populatedPost = await Post.findById(updatedPost._id)
      .populate('author', 'username email');

    res.status(200).json({ message: 'Post updated successfully', post: populatedPost });
  } catch (error) {
    console.error(`Error updating post with ID ${req.params.id}:`, error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid post ID format.' });
    }
    res.status(500).json({ message: 'Failed to update post', error: error.message });
  }
};

/**
 * @route DELETE /api/posts/:id
 * @description Delete a blog post.
 * @access Private (requires authentication and ownership)
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters containing the post ID.
 * @param {Object} req.user - The authenticated user object (added by authMiddleware).
 * @param {Object} res - The response object.
 */
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Authenticated user's ID

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Check if the authenticated user is the author of the post
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this post.' });
    }

    await Post.deleteOne({ _id: id }); // Use deleteOne for clarity

    res.status(204).json({ message: 'Post deleted successfully' }); // 204 No Content for successful deletion
  } catch (error) {
    console.error(`Error deleting post with ID ${req.params.id}:`, error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid post ID format.' });
    }
    res.status(500).json({ message: 'Failed to delete post', error: error.message });
  }
};<ctrl63>