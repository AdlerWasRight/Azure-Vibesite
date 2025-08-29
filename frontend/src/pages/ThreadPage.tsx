import React from 'react';
import { useParams } from 'react-router-dom';
import PostView from '../components/PostView'; // Assuming PostView handles fetching its own data based on postId

const ThreadPage: React.FC = () => {
    const { postId } = useParams<{ postId: string }>();

    if (!postId) {
        return <div>Error: Post ID not found.</div>;
    }

    // PostView component will fetch the post, comments, and replies based on the postId
    return <PostView postId={parseInt(postId, 10)} />;
};

export default ThreadPage; 