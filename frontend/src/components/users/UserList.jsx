import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { usersAPI } from "../../services/api.js";
import UserCard from "./UserCard.jsx";
import "./Users.css";

const UserList = () => {
  const { isAdmin, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAll();
      setUsers(data.users || data || []);
      setError("");
    } catch (err) {
      setError("Failed to load users. Please try again.");
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDelete = async (userId) => {
    try {
      await usersAPI.delete(userId);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Failed to delete user. Please try again.");
      console.error("Error deleting user:", err);
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h2>All Users</h2>
        <p className="user-count">Total: {users.length} users</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="user-grid">
        {users.length === 0 ? (
          <p className="empty-state">No users found.</p>
        ) : (
          users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              currentUserId={currentUser?.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;
