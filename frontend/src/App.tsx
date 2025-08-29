import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ThreadPage from './pages/ThreadPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';

// Components
import Layout from './components/Layout';

// Wrapper component for routes requiring login
const ProtectedRoute: React.FC = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Wrapper component for routes requiring admin role
const AdminRoute: React.FC = () => {
  const { user } = useAuth();
  // Check for user existence and admin role
  return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />; // Redirect non-admins to home
};

function App() {
  const { user, loading } = useAuth();

  // Optional: Show a loading indicator while checking session
  if (loading) {
    return <div className="loading">Initializing Session...</div>;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
          <Route path="/thread/:postId" element={<ThreadPage />} />
          
          {/* Protected Routes (Require Login) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Admin Routes (Require Login + Admin Role) */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          {/* Add other routes here */}
          
          {/* Fallback for unmatched routes */}
          <Route path="*" element={<Navigate to="/" replace />} /> 
        </Routes>
      </Layout>
    </Router>
  );
}

export default App; 