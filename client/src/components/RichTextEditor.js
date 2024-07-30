import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's CSS for the 'snow' theme
import apiClient from '../api/apiClient'; // Assuming an API client for image uploads

/**
 * RichTextEditor Component
 * A reusable rich text editor component built with ReactQuill.
 * It provides a comprehensive set of text formatting options and supports image uploads
 * directly into the editor content.
 *
 * @param {object} props - The component props.
 * @param {string} props.value - The current HTML content of the editor. This makes it a controlled component.
 * @param {function(string): void} props.onChange - Callback function triggered when the editor content changes.
 *                                                  It receives the new HTML content as an argument.
 * @param {string} [props.placeholder="Start writing your amazing post..."] - Placeholder text displayed when the editor is empty.
 * @param {string} [props.className=""] - Additional CSS class names to apply to the editor's root container.
 */
const RichTextEditor = ({ value, onChange, placeholder = "Start writing your amazing post...", className = "" }) => {
  // useRef to get a direct reference to the ReactQuill component,
  // which allows access to the underlying Quill editor instance.
  const quillRef = useRef(null);

  /**
   * Custom image handler for Quill.
   * This function is triggered when the image button in the toolbar is clicked.
   * It prompts the user to select an image file, uploads it to the server,
   * and then inserts the returned image URL into the editor.
   */
  const imageHandler = useCallback(async () => {
    // Create a hidden file input element
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*'); // Accept only image files
    input.click(); // Programmatically click the input to open the file dialog

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) {
        return; // No file selected
      }

      const formData = new FormData();
      formData.append('image', file); // 'image' should match the backend's expected field name for the file

      try {
        // Assuming an API endpoint for image uploads, e.g., /api/upload/image
        // The backend should handle saving the image and returning its public URL.
        const response = await apiClient.post('/api/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for file uploads
          },
        });

        // Extract the image URL from the backend response.
        // Adjust 'response.data.imageUrl' based on your actual backend response structure.
        const imageUrl = response.data.imageUrl;

        // Get the Quill editor instance
        const quill = quillRef.current.getEditor();
        // Get the current selection range to insert the image at the cursor position
        const range = quill.getSelection(true);

        // Insert the image into the editor at the current cursor position
        quill.insertEmbed(range.index, 'image', imageUrl);
        // Move the cursor after the inserted image
        quill.setSelection(range.index + 1);

      } catch (error) {
        console.error('Error uploading image:', error);
        // Provide user feedback on upload failure
        alert('Failed to upload image. Please try again.');
      }
    };
  }, []); // Empty dependency array ensures this function is created only once

  // Define Quill modules for the toolbar and other functionalities.
  // The toolbar configuration specifies which buttons and controls are available to the user.
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // Headers (h1-h6, normal)
        ['bold', 'italic', 'underline', 'strike'], // Basic text formatting
        [{ 'list': 'ordered' }, { 'list': 'bullet' }], // Ordered and unordered lists
        [{ 'script': 'sub' }, { 'script': 'super' }], // Subscript/Superscript
        [{ 'indent': '-1' }, { 'indent': '+1' }], // Indentation
        [{ 'direction': 'rtl' }], // Text direction
        [{ 'size': ['small', false, 'large', 'huge'] }], // Font size options
        [{ 'color': [] }, { 'background': [] }], // Text and background color pickers
        [{ 'font': [] }], // Font family dropdown
        [{ 'align': [] }], // Text alignment options
        ['link', 'image', 'video'], // Embeds: links, images, videos
        ['clean'] // Button to remove all formatting
      ],
      handlers: {
        // Assign our custom image handler to the 'image' button in the toolbar
        image: imageHandler,
      },
    },
    // Other modules can be added here, e.g., 'syntax' for code highlighting
  };

  // Define Quill formats that are allowed in the editor.
  // This list should correspond to the features enabled in the toolbar to prevent unexpected behavior.
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background', 'align', 'direction', 'script'
  ];

  // useEffect to ensure the custom image handler is correctly bound to the Quill instance.
  // This is necessary because ReactQuill's `modules` prop might not always correctly bind
  // custom handlers on initial render or updates.
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      // Explicitly set the image handler on the toolbar module.
      // This ensures that when the image button is clicked, our custom logic runs.
      quill.getModule('toolbar').addHandler('image', imageHandler);
    }
  }, [imageHandler]); // Re-run if the imageHandler function itself changes (though useCallback prevents this)

  return (
    <div className={`rich-text-editor-container ${className}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow" // Using the 'snow' theme for a clean UI
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="blog-post-editor" // Custom class for additional styling if needed
      />
    </div>
  );
};

export default RichTextEditor;