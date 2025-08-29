import React from 'react';
import UpdatePasswordForm from '../components/UpdatePasswordForm';

const SettingsPage: React.FC = () => {
    return (
        <div>
            <h2>User Settings</h2>
            <UpdatePasswordForm />
            {/* Add other settings components here if needed */}
        </div>
    );
};

export default SettingsPage; 