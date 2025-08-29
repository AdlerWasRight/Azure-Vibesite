import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError(); // Clear previous errors
        try {
            await login(username, password);
            navigate('/'); // Redirect to home page on successful login
        } catch (err) {
            // Error is handled and set in AuthContext, just log it here if needed
            console.error('Vault Terminal Login attempt failed in component');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="error-message">ERROR: {error}</div>}
            <div className="form-group">
                <label htmlFor="login-username">Username:</label>
                <input
                    type="text"
                    id="login-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            <div className="form-group">
                <label htmlFor="login-password">Password:</label>
                <input
                    type="password"
                    id="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? 'Logging In...' : 'Sign In'}
            </button>
        </form>
    );
};

export default LoginForm;