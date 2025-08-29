import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { communities, defaultCommunityId } from '../config/communities';

interface PostFormProps {
    onPostSuccess?: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ onPostSuccess }) => {
    const authContext = useContext(AuthContext);
    const token = authContext?.token;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [community, setCommunity] = useState<string>(defaultCommunityId);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        let uploadedImageUrl = imageUrl; // Use previously uploaded URL if available

        if (!title.trim() || !content.trim()) {
            setError('Title and content are required.');
            setLoading(false);
            return;
        }

        // Check for token before proceeding
        if (!token) {
            setError('You must be logged in to post.');
            setLoading(false);
            return;
        }

        // Upload image first if a new one is selected
        if (imageFile && !uploadedImageUrl) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('image', imageFile);
            try {
                const uploadRes = await axios.post<{ imageUrl: string }>('/api/upload-image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                uploadedImageUrl = uploadRes.data.imageUrl;
                setImageUrl(uploadedImageUrl); // Store for potential retry
            } catch (uploadErr: any) {
                console.error('Image upload failed:', uploadErr);
                setError(uploadErr.response?.data?.message || 'Image upload failed. Please try again.');
                setIsUploading(false);
                setLoading(false);
                return;
            } finally {
                setIsUploading(false);
            }
        }

        try {
            // Include community and token in the request
            const response = await axios.post(
                '/api/posts',
                {
                    title,
                    content,
                    imageUrl: uploadedImageUrl,
                    community // Include selected community
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}` // Send JWT token
                    }
                }
            );
            // Clear form
            setTitle('');
            setContent('');
            setCommunity(defaultCommunityId); // Reset community to default
            setImageFile(null);
            setImageUrl(null);
            // Call the success callback AFTER clearing the form
            if (onPostSuccess) {
                onPostSuccess();
            }
        } catch (err: any) {
            console.error('Failed to create post:', err);
            setError(err.response?.data?.message || 'Failed to create post. Are you logged in?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2em' }}>
            <h3>Create New Thread</h3>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
                <label htmlFor="post-title">Title:</label>
                <input
                    type="text"
                    id="post-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={loading}
                    maxLength={255}
                />
            </div>
            <div className="form-group">
                <label htmlFor="post-content">Content:</label>
                <textarea
                    id="post-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            {/* Add Community Dropdown */}
            <div className="form-group">
                <label htmlFor="post-community">Community:</label>
                <select
                    id="post-community"
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    required
                    disabled={loading}
                >
                    {communities.map((comm) => (
                        <option key={comm.id} value={comm.id}>
                            {comm.id} - {comm.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="post-image">Image (Optional):</label>
                <input
                    type="file"
                    id="post-image"
                    accept="image/*"
                    onChange={(e) => {
                        setImageFile(e.target.files ? e.target.files[0] : null);
                        setImageUrl(null); // Reset stored URL if new file selected
                    }}
                    disabled={loading || isUploading}
                />
                {isUploading && <span> Uploading image...</span>}
            </div>
            <button type="submit" disabled={loading || isUploading}>
                {loading ? (isUploading ? 'Uploading...' : 'Submitting...') : 'Create Thread'}
            </button>
        </form>
    );
};

export default PostForm;