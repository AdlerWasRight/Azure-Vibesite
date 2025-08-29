import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { CommentType } from '../types'; // Import shared type

// Define CommentType if types.ts wasn't created
/*
interface CommentType {
    id: number;
    post_id: number;
    user_id: number;
    comment_text: string;
    created_at: string;
    username: string; // Note: Original used 'username', shared type uses 'author_username'
}
*/ // Remove local definition

interface CommentFormProps {
    postId: number;
    onCommentCreated: (newComment: CommentType) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ postId, onCommentCreated }: CommentFormProps) => { // Add explicit type for postId
    const [commentText, setCommentText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !user) {
            setError('Comment cannot be empty and you must be logged in.');
            return;
        }
        setError(null);
        setLoading(true);

        try {
            // Ensure API response matches the imported CommentType (with author_username)
            const response = await axios.post<CommentType>(`/api/posts/${postId}/comments`, { 
                content: commentText 
            });
            setCommentText(''); // Clear form
            onCommentCreated(response.data); // Notify parent
        } catch (err: any) {
            console.error('Failed to create comment:', err);
            setError(err.response?.data?.message || 'Failed to post comment.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <p>Please log in to comment.</p>;
    }

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '1em', borderStyle: 'dotted' }}>
            <h4>Add Comment</h4>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
                <label htmlFor={`comment-text-${postId}`} style={{ display: 'none'}}>Comment:</label> {/* Hidden label for accessibility */}
                <textarea
                    id={`comment-text-${postId}`}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                    disabled={loading}
                    rows={3}
                    placeholder="Enter your comment..."
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? 'Posting...' : 'Post Comment'}
            </button>
        </form>
    );
};

export default CommentForm; 