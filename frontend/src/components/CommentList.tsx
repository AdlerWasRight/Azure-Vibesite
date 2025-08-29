import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Comment from './Comment'; // Import the Comment component
import CommentForm from './CommentForm'; // Import the CommentForm component
import { useAuth } from '../contexts/AuthContext';
import { CommentType } from '../types'; // Import shared type

// Re-define CommentType if types.ts wasn't created
/*
interface CommentType {
    id: number;
    post_id: number;
    user_id: number;
    comment_text: string;
    created_at: string;
    author_username: string;
}
*/ // Remove local definition

interface CommentListProps {
    postId: number;
}

const CommentList: React.FC<CommentListProps> = ({ postId }: CommentListProps) => { // Add explicit type for postId
    const [comments, setComments] = useState<CommentType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchComments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<CommentType[]>(`/api/posts/${postId}/comments`);
            setComments(response.data);
        } catch (err: any) {
            console.error(`Failed to fetch comments for post ${postId}:`, err);
            setError(err.response?.data?.message || 'Failed to load comments.');
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // Callback for when a new comment is created by CommentForm
    const handleCommentCreated = (newComment: CommentType) => {
        setComments((prevComments: CommentType[]) => [newComment, ...prevComments]); // Add explicit type for prevComments // Add to the top
    };

    if (loading) {
        return <div className="loading" style={{marginLeft: '1em'}}>Loading comments...</div>;
    }

    if (error) {
        return <div className="error-message" style={{marginLeft: '1em'}}>{error}</div>;
    }

    return (
        <div className="comment-section" style={{ marginTop: '1.5em' }}>
            {user && <CommentForm postId={postId} onCommentCreated={handleCommentCreated} />} 
            
            <h4 style={{ marginTop: '1.5em', borderTop: '1px dashed var(--terminal-border)', paddingTop: '1em' }}>
                {comments.length} Comment{comments.length !== 1 ? 's' : ''}
            </h4>
            {comments.length === 0 && !user ? (
                 <p style={{color: 'var(--terminal-secondary-text)'}}>No comments yet. Log in to add one.</p>
             ) : comments.length === 0 ? (
                 <p style={{color: 'var(--terminal-secondary-text)'}}>No comments yet.</p>
             ) : (
                <ul className="comment-list">
                    {comments.map((comment: CommentType) => ( // Add explicit type for comment
                        <Comment key={comment.id} comment={comment} />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CommentList; 