import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UpdatePasswordForm: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { updatePassword, loading, error: authError, clearError } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setFormError(null);
        setSuccessMessage(null);

        if (newPassword !== confirmNewPassword) {
            setFormError('New passwords do not match.');
            return;
        }
        if (!newPassword || newPassword.length < 6) { // Example validation
             setFormError('New password must be at least 6 characters long.');
            return;
        }
        if (currentPassword === newPassword) {
            setFormError('New password cannot be the same as the current password.');
            return;
        }

        try {
            await updatePassword(currentPassword, newPassword);
            setSuccessMessage('Password updated successfully!');
            // Clear fields after success
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            // Auth error is handled in AuthContext
            console.error('Password update attempt failed in component');
             if (!authError) { // Set generic form error if no specific auth error
              setFormError("An unexpected error occurred updating the password.");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '2em' }}>
             <h3>Update Password</h3>
            {(authError || formError) && (
                <div className="error-message">{authError || formError}</div>
            )}
            {successMessage && (
                 <div style={{ color: 'var(--terminal-accent)', marginBottom: '1em' }}>{successMessage}</div>
            )}
            <div className="form-group">
                <label htmlFor="current-password">Current Password:</label>
                <input
                    type="password"
                    id="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            <div className="form-group">
                <label htmlFor="new-password">New Password:</label>
                <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                />
            </div>
            <div className="form-group">
                <label htmlFor="confirm-new-password">Confirm New Password:</label>
                <input
                    type="password"
                    id="confirm-new-password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
            </button>
        </form>
    );
};

export default UpdatePasswordForm; 