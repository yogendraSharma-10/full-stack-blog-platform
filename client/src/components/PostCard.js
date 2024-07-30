import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PostCard Component
 *
 * Displays a summary of a blog post in a card format.
 * It includes the post's title, a truncated content snippet,
 * the author's username, and the publication date.
 * The entire card acts as a link to the detailed post page.
 *
 * @param {object} props - The component props.
 * @param {object} props.post - The post object containing details like _id, title, content, author, and createdAt.
 * @returns {JSX.Element} A React component displaying a post card.
 */
const PostCard = ({ post }) => {
  // Destructure post properties for easier access
  const { _id, title, content, author, createdAt } = post;

  // Format the creation date for display
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Truncate content to a reasonable length for the card preview
  const truncateContent = (text, maxLength) => {
    if (!text) return '';
    const strippedText = text.replace(/<[^>]*>?/gm, ''); // Remove HTML tags
    if (strippedText.length <= maxLength) {
      return strippedText;
    }
    return strippedText.substring(0, maxLength) + '...';
  };

  const contentSnippet = truncateContent(content, 150); // Display first 150 characters

  return (
    <article className="post-card">
      {/* Link to the individual post detail page */}
      <Link to={`/posts/${_id}`} className="post-card-link">
        <h2 className="post-card-title">{title}</h2>
        <p className="post-card-meta">
          By <span className="post-card-author">{author?.username || 'Anonymous'}</span> on{' '}
          <time dateTime={createdAt} className="post-card-date">
            {formattedDate}
          </time>
        </p>
        <div className="post-card-content">
          <p>{contentSnippet}</p>
        </div>
        <span className="post-card-read-more">Read More &rarr;</span>
      </Link>
    </article>
  );
};

export default PostCard;