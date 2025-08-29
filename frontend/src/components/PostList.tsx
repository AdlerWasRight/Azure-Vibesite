import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

interface PostListProps {
    communityFilter: string | null;
}

interface Post {
    id: number;
    user_id: number;
    title: string;
    content: string;
    created_at: string;
    author_username: string;
    image_url?: string | null;
    comment_count: number;
    reply_count: number;
    community?: string;
}

const PostList: React.FC<PostListProps> = ({ communityFilter }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const authContext = useContext(AuthContext);
    const user = authContext?.user;
    const token = authContext?.token;

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let apiUrl = '/api/posts';
            const params = new URLSearchParams();

            if (communityFilter) {
                params.append('community', communityFilter);
            }

            if (params.toString()) {
                apiUrl += `?${params.toString()}`;
            }
            
            console.log(`Fetching posts from: ${apiUrl}`);

            const response = await axios.get<Post[]>(apiUrl);
            setPosts(response.data);
        } catch (err: any) {
            console.error('Failed to fetch posts:', err);
            setError(err.response?.data?.message || 'Failed to load discussion threads.');
        } finally {
            setLoading(false);
        }
    }, [communityFilter]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleDelete = async (postId: number) => {
        if (!token) {
            setError("Authentication required to delete posts.");
            return;
        }
        if (!window.confirm('Are you sure you want to delete this thread and all its replies? This cannot be undone.')) {
            return;
        }

        try {
            const response = await axios.delete(`/api/posts/${postId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                // Remove the post from the local state
                setPosts(currentPosts => currentPosts.filter(p => p.id !== postId));
                // Optionally show a success message
            } else {
                setError(response.data?.message || 'Failed to delete post.');
            }
        } catch (err: any) {
            console.error('Error deleting post:', err);
            setError(err.response?.data?.message || 'An error occurred while deleting the post.');
        }
    };

    // TODO: Implement way to add new post from PostForm to the top of this list
    // Maybe PostForm can call fetchPosts() after success? Or pass data up?

    if (loading) {
        return <div className="loading">Loading threads...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (posts.length === 0) {
        return <div>No threads started yet.</div>;
    }

    return (
        <ul className="post-list">
            {posts.map(post => (
                <li key={post.id} className="post-list-item">
                    <h3>
                        <Link to={`/thread/${post.id}`}>{post.title}</Link>
                    </h3>
                    {post.image_url && (
                        <div className="post-image-container" style={{ marginBottom: '1em' }}>
                            <img src={post.image_url} alt="Post image" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', border: '1px solid var(--terminal-border)' }} />
                        </div>
                    )}
                    <div className="post-meta">
                        {post.community && <span style={{ fontSize: '0.9em', color: '#888', marginRight: '1em' }}>({post.community})</span>}
                        Started by {post.author_username} on {new Date(post.created_at).toLocaleString()}
                    </div>
                    <p style={{ marginTop: '0.5em', marginBottom: '1em' }}>
                        <span style={{ marginRight: '1em' }}>Comments: {post.comment_count}</span>
                        <span>Replies: {post.reply_count}</span>
                    </p>
                    {/* Delete button - shown only if the logged-in user is the author */}
                    {user && post.user_id === user.id && (
                        <button
                            onClick={() => handleDelete(post.id)}
                            className="delete-button"
                            style={{ marginLeft: '1em', cursor: 'pointer' }} // Basic styling
                        >
                            Delete Thread
                        </button>
                    )}
                    {/* View Comments Button */}
                    <Link to={`/thread/${post.id}`} style={{ marginLeft: '1em' }}>
                        <button className="view-comments-button">View Comments</button>
                    </Link>
                    {/* Optionally show first few lines of content or stats */}
                    {/* <p>{post.content.substring(0, 100)}...</p> */}
                </li>
            ))}
        </ul>
    );
};

export default PostList;