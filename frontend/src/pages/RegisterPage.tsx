import React from 'react';
import RegisterForm from '../components/RegisterForm';
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
    return (
        <div>
            <h2>Register New User</h2>
            <RegisterForm />
             <p style={{ marginTop: '1em', textAlign: 'center' }}>
                Already registered? <Link to="/login">Login Here</Link>
            </p>
        </div>
    );
};

export default RegisterPage; 