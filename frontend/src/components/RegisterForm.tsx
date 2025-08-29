import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState<string | null>(null); // Specific form errors like password mismatch
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // Added success message state
    const { register, loading, error: authError, clearError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError(); // Clear auth errors
        setFormError(null); // Clear form errors
        setSuccessMessage(null); // Clear previous success message

        if (password !== confirmPassword) {
            setFormError('Passwords do not match.');
            return;
        }

        try {
            const message = await register(username, email, password);
            // Registration successful, but user is NOT logged in.
            // Show success message and redirect to login page after a delay.
            setSuccessMessage(`${message} Redirecting to login...`);
            setTimeout(() => {
                 navigate('/login'); // Redirect to login page
            }, 3000); // Wait 3 seconds before redirecting

        } catch (err) {
            // Auth error is handled in AuthContext and stored in authError
            console.error('Registration attempt failed in component');
            // If there's no specific authError message from context, set a generic form error
            if (!authError) {
              setFormError("An unexpected error occurred during registration.");
            }
            // Keep the form inputs enabled unless loading is true
        }
    };

    // Don't disable form if only showing success message
    const isProcessing = loading;

    return (
        <form onSubmit={handleSubmit}>
            {successMessage && <div className="success-message">{successMessage}</div>}
            {(authError || formError) && !successMessage && (
                <div className="error-message">{authError || formError}</div>
            )}
            <div className="form-group">
                <label htmlFor="register-username">Username:</label>
                <input
                    type="text"
                    id="register-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3} // Example validation
                    disabled={isProcessing}
                />
            </div>
            <div className="form-group">
                <label htmlFor="register-email">Email:</label>
                <input
                    type="email"
                    id="register-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isProcessing}
                />
            </div>
            <div className="form-group">
                <label htmlFor="register-password">Password:</label>
                <input
                    type="password"
                    id="register-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6} // Example validation
                    disabled={isProcessing}
                />
            </div>
            <div className="form-group">
                <label htmlFor="register-confirm-password">Confirm Password:</label>
                <input
                    type="password"
                    id="register-confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isProcessing}
                />
            </div>
            {/* Hide button if registration was successful */} 
            {!successMessage && (
                <button type="submit" disabled={isProcessing}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            )}
        </form>
    );
};

export default RegisterForm; 