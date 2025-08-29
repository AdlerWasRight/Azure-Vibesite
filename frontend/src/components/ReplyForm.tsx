import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Re-define ReplyType if types.ts wasn't created
interface ReplyType {
    id: number;
    comment_id: number;
    user_id: number;
    reply_text: string;
    created_at: string;
    author_username: string;
}

interface ReplyFormProps {
    commentId: number;
    onReplyCreated: (newReply: ReplyType) => void;
    // Optional: Function to call to hide the form after submission/cancel
    onCancel?: () => void; 
}

const ReplyForm: React.FC<ReplyFormProps> = ({ commentId, onReplyCreated, onCancel }) => {
    const [replyText, setReplyText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { user } = useAuth(); // Assuming user must be logged in to reply

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !user) {
            setError('Reply cannot be empty and you must be logged in.');
            return;
        }
        setError(null);
        setLoading(true);

        try {
            const response = await axios.post<ReplyType>(`/api/comments/${commentId}/replies`, {
                content: replyText
            });
            setReplyText(''); // Clear form
            onReplyCreated(response.data); // Notify parent (Comment component)
            if (onCancel) onCancel(); // Hide form if cancel function provided
        } catch (err: any) {
            console.error(`Failed to create reply for comment ${commentId}:`, err);
            setError(err.response?.data?.message || 'Failed to post reply.');
        } finally {
            setLoading(false);
        }
    };

    // Don't render form if user isn't logged in (handled by parent component potentially)
    if (!user) return null; 

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '0.5em', marginLeft: '1em', paddingLeft: '1em', borderLeft: '2px solid var(--terminal-border)' }}>
            {error && <div className="error-message" style={{fontSize: '0.9em'}}>{error}</div>}
            <div className="form-group" style={{marginBottom: '0.5em'}}>
                 <label htmlFor={`reply-text-${commentId}`} style={{ display: 'none'}}>Reply:</label> {/* Hidden label */}
                <textarea
                    id={`reply-text-${commentId}`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                    disabled={loading}
                    rows={2}
                    placeholder="Enter your reply..."
                    style={{fontSize: '0.9em'}}
                />
            </div>
            <button type="submit" disabled={loading} style={{fontSize: '0.85em', padding: '0.4em 0.8em'}}>
                {loading ? 'Posting...' : 'Post Reply'}
            </button>
            {onCancel && (
                <button 
                    type="button" 
                    onClick={onCancel} 
                    disabled={loading} 
                    style={{fontSize: '0.85em', padding: '0.4em 0.8em', marginLeft: '0.5em', background: 'var(--terminal-secondary-text)', color: 'var(--terminal-bg)'}}
                 >
                    Cancel
                </button>
            )}
        </form>
    );
};

export default ReplyForm; 