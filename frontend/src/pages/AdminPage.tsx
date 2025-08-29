import React, { useState, useEffect, useCallback } from 'react';
import axios from '../setupAxios';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth to get current admin ID

// Define the User structure matching the backend API response
interface AdminUserView {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string; // Dates usually come as strings
}

const AdminPage: React.FC = () => {
  const { user: adminUser } = useAuth(); // Get the currently logged-in admin user
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<AdminUserView[]>('/api/users');
      setUsers(response.data);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.message || 'Could not load user data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Function to handle role change
  const handleChangeRole = async (userId: number, newRole: 'admin' | 'user') => {
    if (!adminUser || userId === adminUser.id) {
      setError('Cannot change your own role.'); // Basic client-side check
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Backend expects PUT /api/users/:userId with full user data (username, email, role)
      // Fetch current data first to only change role (or adjust backend to accept partial update)
      const currentUserData = users.find(u => u.id === userId);
      if (!currentUserData) throw new Error('User data not found');

      await axios.put(`/api/users/${userId}`, {  // Changed path to /api/users/:userId
          username: currentUserData.username, // Send existing username
          email: currentUserData.email,       // Send existing email
          role: newRole                    // Send new role
      });
      // Refresh the user list after successful update
      await fetchUsers();
    } catch (err: any) {
      console.error(`Failed to change role for user ${userId}:`, err);
      setError(err.response?.data?.message || 'Failed to update user role.');
      setLoading(false); // Ensure loading is false on error
    }
    // setLoading(false); // Moved inside finally in fetchUsers
  };

  return (
    <div className="container terminal-style admin-panel">
      <h2>Admin Panel - User Management</h2>

      {loading && <p>Loading users...</p>}
      {error && <p className="error-message">Error: {error}</p>}

      {!loading && !error && (
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  {adminUser && user.id !== adminUser.id && (
                    <>
                      {user.role === 'user' ? (
                        <button onClick={() => handleChangeRole(user.id, 'admin')} disabled={loading}>
                          Make Admin
                        </button>
                      ) : (
                        <button onClick={() => handleChangeRole(user.id, 'user')} disabled={loading}>
                          Make User
                        </button>
                      )}
                      {/* Add Delete/Ban buttons here later if needed */}
                    </>
                  )}
                  {adminUser && user.id === adminUser.id && (
                    <span>(Current Admin)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPage; 