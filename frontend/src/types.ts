export interface ReplyType {
    id: number;
    comment_id: number;
    user_id: number;
    reply_text: string;
    created_at: string;
    author_username: string;
}

export interface CommentType {
    id: number;
    post_id: number;
    user_id: number;
    comment_text: string;
    created_at: string;
    author_username: string;
}