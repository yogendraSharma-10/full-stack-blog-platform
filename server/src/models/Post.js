const mongoose = require('mongoose');
const slugify = require('slugify'); // For generating URL-friendly slugs

/**
 * @file server/src/models/Post.js
 * @description Mongoose model for blog posts.
 * Defines the schema for a blog post, including title, content, author,
 * slug, tags, and timestamps.
 */

const PostSchema = new mongoose.Schema({
    /**
     * The title of the blog post.
     * Must be a string, required, and unique to prevent duplicate post titles.
     */
    title: {
        type: String,
        required: [true, 'Post title is required.'],
        trim: true,
        unique: true,
        minlength: [3, 'Title must be at least 3 characters long.']
    },
    /**
     * The main content of the blog post.
     * This will store the rich text content from the editor.
     * Must be a string and required.
     */
    content: {
        type: String,
        required: [true, 'Post content is required.'],
        minlength: [10, 'Content must be at least 10 characters long.']
    },
    /**
     * Reference to the User who authored the post.
     * This creates a relationship between Post and User models.
     * Must be a MongoDB ObjectId and required.
     */
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the 'User' model
        required: [true, 'Post author is required.']
    },
    /**
     * A URL-friendly slug generated from the title.
     * Used for clean URLs (e.g., /posts/my-awesome-post-title).
     * Must be a string, unique, and indexed for faster lookups.
     */
    slug: {
        type: String,
        unique: true,
        index: true // Add an index for efficient slug-based lookups
    },
    /**
     * An array of strings for categorizing the post.
     * Optional field.
     */
    tags: [{
        type: String,
        trim: true
    }],
    /**
     * The date and time when the post was first created.
     * Automatically managed by Mongoose with `timestamps: true`.
     */
    // createdAt: Date,
    /**
     * The date and time when the post was last updated.
     * Automatically managed by Mongoose with `timestamps: true`.
     */
    // updatedAt: Date,
}, {
    timestamps: true // Mongoose automatically adds `createdAt` and `updatedAt` fields
});

/**
 * Pre-save hook to generate a slug from the post title.
 * This ensures that every post has a unique and URL-friendly slug.
 * The slug is generated only if the post is new or if the title has been modified.
 */
PostSchema.pre('save', function(next) {
    // Check if the document is new or if the title has been modified
    if (this.isNew || this.isModified('title')) {
        // Generate a slug from the title
        // slugify converts string to URL-friendly format (e.g., "My Post Title" -> "my-post-title")
        this.slug = slugify(this.title, {
            lower: true,      // Convert to lower case
            strict: true,     // Strip characters that are not allowed in URLs
            locale: 'en',     // Language for character mapping
            trim: true        // Trim leading/trailing whitespace
        });
    }
    next(); // Continue with the save operation
});

/**
 * Static method to find a post by its slug.
 * This provides a convenient way to retrieve posts using their URL-friendly identifier.
 * @param {string} slug - The slug of the post to find.
 * @returns {Promise<Post|null>} A promise that resolves to the found post or null if not found.
 */
PostSchema.statics.findBySlug = function(slug) {
    return this.findOne({ slug });
};

// Create the Mongoose model from the schema
const Post = mongoose.model('Post', PostSchema);

module.exports = Post;