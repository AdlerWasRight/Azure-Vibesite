import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CommentList from './CommentList'; // Import CommentList

// Re-define Post type if types.ts wasn't created
interface Post {
    id: number;
    user_id: number;
    title: string;
    content: string;
    created_at: string;
    author_username: string;
    image_url?: string | null; // Add image_url
}

interface PostViewProps {
    postId: number;
}

const PostView: React.FC<PostViewProps> = ({ postId }) => {
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPost = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch the single post details first
            const response = await axios.get<Post>(`/api/posts/${postId}`);
            setPost(response.data);
            // Comments (and their replies) will be handled by CommentList
        } catch (err: any) {
            console.error(`Failed to fetch post ${postId}:`, err);
            setError(err.response?.data?.message || 'Failed to load post.');
            setPost(null); // Ensure post is null on error
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    if (loading) {
        return <div className="loading">Loading thread...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!post) {
        return <div>Thread not found or could not be loaded.</div>;
    }

    return (
        <div className="thread-view">
            <div className="original-post">
                <h2>{post.title}</h2>
                <div className="post-meta">
                    Posted by {post.author_username} on {new Date(post.created_at).toLocaleString()} (ID: {post.id})
                </div>
                {post.image_url && (
                    <div className="post-image-container" style={{ margin: '1em 0' }}>
                        <img src={post.image_url} alt="Post image" style={{ maxWidth: '80%', maxHeight: '400px', objectFit: 'contain', display: 'block', margin: '0 auto', border: '1px solid var(--terminal-border)' }} />
                    </div>
                )}
                <div className="post-content" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
            </div>

            {/* Render the CommentList, which handles fetching and displaying comments/replies */}
            <CommentList postId={postId} />
        </div>
    );
};

export default PostView; 