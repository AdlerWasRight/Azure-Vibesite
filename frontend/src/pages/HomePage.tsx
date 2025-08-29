import React, { useState } from 'react';
import PostForm from '../components/PostForm';
import PostList from '../components/PostList';
import CommunitySidebar from '../components/CommunitySidebar';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
    const { user } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
    const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

    const handlePostSuccess = () => {
        console.log('Post successful, triggering refresh...');
        setRefreshTrigger(prev => prev + 1);
        // Optionally reset to 'All Communities' after posting, or stay in the current view
        // setSelectedCommunity(null); 
    };

    const handleSelectCommunity = (communityId: string | null) => {
        console.log('Selecting community:', communityId);
        setSelectedCommunity(communityId);
        setRefreshTrigger(prev => prev + 1); // Also trigger refresh when filter changes
    };

    return (
        <div style={{ display: 'flex' }}>
            <CommunitySidebar 
                selectedCommunity={selectedCommunity} 
                onSelectCommunity={handleSelectCommunity} 
            />
            <div style={{ flexGrow: 1 }}>
                <h2>Discussion Threads {selectedCommunity ? `in ${selectedCommunity}` : ''}</h2>
                {user && <PostForm onPostSuccess={handlePostSuccess} />}
                <PostList 
                    key={refreshTrigger} 
                    communityFilter={selectedCommunity} 
                /> 
            </div>
        </div>
    );
};

export default HomePage;