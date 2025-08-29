import React from 'react';
import { Link } from 'react-router-dom';
import { communities } from '../config/communities';

interface CommunitySidebarProps {
    selectedCommunity: string | null;
    onSelectCommunity: (communityId: string | null) => void; // null for 'All'
}

const CommunitySidebar: React.FC<CommunitySidebarProps> = ({ selectedCommunity, onSelectCommunity }) => {
    return (
        <div className="community-sidebar" style={{ borderRight: '1px solid #ccc', padding: '1em', marginRight: '1em', minWidth: '200px' }}>
            <h4>Communities</h4>
            <ul>
                <li key="all" style={{ fontWeight: selectedCommunity === null ? 'bold' : 'normal', marginBottom: '0.5em' }}>
                    {/* Option 1: Use onClick handler */}
                    <button onClick={() => onSelectCommunity(null)} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}>
                        All Communities
                    </button>
                    {/* Option 2: Use Link (if setting up routes like /community/...) */}
                    {/* <Link to="/" onClick={() => onSelectCommunity(null)}>All Communities</Link> */}
                </li>
                {communities.map(comm => (
                    <li key={comm.id} style={{ fontWeight: selectedCommunity === comm.id ? 'bold' : 'normal', marginBottom: '0.5em' }}>
                        {/* Option 1: Use onClick handler */}
                        <button onClick={() => onSelectCommunity(comm.id)} title={comm.description} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}>
                            {comm.id} - {comm.name}
                        </button>
                        {/* Option 2: Use Link (if setting up routes like /community/...) */}
                        {/* <Link 
                            to={`/community/${encodeURIComponent(comm.id)}`} 
                            onClick={() => onSelectCommunity(comm.id)}
                            title={comm.description}
                        >
                            {comm.id} - {comm.name}
                        </Link> */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CommunitySidebar;
