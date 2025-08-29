import React from 'react';

// Re-define ReplyType if types.ts wasn't created
interface ReplyType {
    id: number;
    comment_id: number;
    user_id: number;
    reply_text: string;
    created_at: string;
    author_username: string;
}

interface ReplyProps {
    reply: ReplyType;
}

const Reply: React.FC<ReplyProps> = ({ reply }) => {
    return (
        <li className="reply">
            <div className="reply-header">
                <strong>{reply.author_username}</strong> replied on {new Date(reply.created_at).toLocaleString()}
            </div>
            <div className="reply-text">{reply.reply_text}</div>
        </li>
    );
};

export default Reply; 