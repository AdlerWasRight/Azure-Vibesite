import React from 'react';
import Reply from './Reply'; // Import the Reply component

// Re-define ReplyType if types.ts wasn't created
interface ReplyType {
    id: number;
    comment_id: number;
    user_id: number;
    reply_text: string;
    created_at: string;
    author_username: string;
}

interface ReplyListProps {
    replies: ReplyType[];
}

const ReplyList: React.FC<ReplyListProps> = ({ replies }) => {
    if (!replies || replies.length === 0) {
        return null; // Don't render anything if there are no replies
    }

    return (
        <ul className="reply-list">
            {replies.map(reply => (
                <Reply key={reply.id} reply={reply} />
            ))}
        </ul>
    );
};

export default ReplyList; 