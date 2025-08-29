import React from 'react';
import LoginForm from '../components/LoginForm';
import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
    return (
        <div>
            <h2>Login Terminal Access</h2>
            <LoginForm />
            <p style={{ marginTop: '1em', textAlign: 'center' }}>
                Need access? <Link to="/register">Register Here</Link>
            </p>
        </div>
    );
};

export default LoginPage; 