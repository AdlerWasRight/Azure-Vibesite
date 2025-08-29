import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReplyList from './ReplyList';
import ReplyForm from './ReplyForm';
import { useAuth } from '../contexts/AuthContext';
import { CommentType, ReplyType } from '../types'; // Import shared types

// Re-define CommentType and ReplyType if types.ts wasn't created
/*
interface ReplyType {
    id: number;
    comment_id: number;
    user_id: number;
    reply_text: string;
    created_at: string;
    author_username: string;
}
interface CommentType {
    id: number;
    post_id: number;
    user_id: number;
    comment_text: string;
    created_at: string;
    author_username: string;
}
*/ // Remove local definitions

interface CommentProps {
    comment: CommentType;
}

const Comment: React.FC<CommentProps> = ({ comment }: CommentProps) => { // Add explicit type for comment
    const [replies, setReplies] = useState<ReplyType[]>([]);
    const [showReplies, setShowReplies] = useState<boolean>(false);
    const [loadingReplies, setLoadingReplies] = useState<boolean>(false);
    const [errorReplies, setErrorReplies] = useState<string | null>(null);
    const [showReplyForm, setShowReplyForm] = useState<boolean>(false);
    const { user } = useAuth();

    const fetchReplies = useCallback(async () => {
        if (!showReplies || replies.length > 0) return; // Only fetch if showing and not already fetched
        
        setLoadingReplies(true);
        setErrorReplies(null);
        try {
            const response = await axios.get<ReplyType[]>(`/api/comments/${comment.id}/replies`);
            setReplies(response.data);
        } catch (err: any) {
            console.error(`Failed to fetch replies for comment ${comment.id}:`, err);
            setErrorReplies(err.response?.data?.message || 'Failed to load replies.');
        } finally {
            setLoadingReplies(false);
        }
    }, [comment.id, showReplies, replies.length]);

    // Fetch replies when showReplies becomes true
    useEffect(() => {
        if (showReplies) {
            fetchReplies();
        }
    }, [showReplies, fetchReplies]);

    // Add a new reply to the state when created
    const handleReplyCreated = (newReply: ReplyType) => {
        setReplies((prevReplies: ReplyType[]) => [newReply, ...prevReplies]); // Add explicit type for prevReplies
        setShowReplyForm(false); // Hide form after successful reply
        setShowReplies(true); // Ensure replies are shown
    };

    const toggleReplies = () => {
        setShowReplies(!showReplies);
    };

    const toggleReplyForm = () => {
        setShowReplyForm(!showReplyForm);
    };

    return (
        <li className="comment">
            <div className="comment-header">
                <strong>{comment.author_username}</strong> commented on {new Date(comment.created_at).toLocaleString()} (ID: {comment.id})
            </div>
            <div className="comment-text">{comment.comment_text}</div>
            
            {/* Reply Button - only show if logged in */} 
             {user && (
                <button onClick={toggleReplyForm} className="reply-toggle">
                    {showReplyForm ? 'Cancel Reply' : 'Reply'}
                </button>
             )}

            {/* Reply Form - conditionally shown */} 
            {showReplyForm && user && (
                <ReplyForm 
                    commentId={comment.id} 
                    onReplyCreated={handleReplyCreated} 
                    onCancel={toggleReplyForm} // Use toggle function to hide form on cancel
                />
            )}

            {/* Toggle Replies Button - show if needed (e.g., if there might be replies) */} 
            {/* You might adjust logic: maybe always show if replies exist, or fetch count first */} 
            <button onClick={toggleReplies} className="reply-toggle" style={{ marginLeft: user ? '1em' : '0' }}>
                 {showReplies ? 'Hide Replies' : 'Show Replies'}
                 {loadingReplies && ' (Loading...)'} 
            </button>

            {/* Replies Section - conditionally shown */} 
            {showReplies && (
                <div className="replies-section">
                    {errorReplies && <div className="error-message">{errorReplies}</div>}
                    {!loadingReplies && !errorReplies && <ReplyList replies={replies} />} 
                    {!loadingReplies && !errorReplies && replies.length === 0 && <p style={{fontSize: '0.9em', color: 'var(--terminal-secondary-text)', marginLeft: '2em'}}>No replies yet.</p>}
                </div>
            )}
        </li>
    );
};

export default Comment; 