import { usersAPI } from "../../services/api.js";
import "./Users.css";

const UserCard = ({ user, isAdmin, onDelete, onUpdate, currentUserId }) => {
  const createdDate = new Date(user.createdAt).toLocaleDateString();
  const canDelete = isAdmin && user.id !== currentUserId;
  const canManage = isAdmin && user.id !== currentUserId; // Can't manage yourself

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`,
      )
    ) {
      onDelete(user.id);
    }
  };

  const handleToggleAdmin = async () => {
    const action = user.isAdmin ? "remove admin rights from" : "grant admin rights to";
    if (
      confirm(
        `Are you sure you want to ${action} "${user.name}"?`,
      )
    ) {
      try {
        await usersAPI.toggleAdmin(user.id, !user.isAdmin);
        if (onUpdate) {
          onUpdate();
        }
      } catch (error) {
        alert(error.message || "Failed to update user. Please try again.");
      }
    }
  };

  return (
    <div className="user-card">
      <div className="user-card-header">
        <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div className="user-info">
          <div className="user-name-row">
            <h3>{user.name}</h3>
            {user.isAdmin && (
              <span className="admin-badge" title="Administrator">
                Admin
              </span>
            )}
          </div>
          <p className="user-email">{user.email}</p>
        </div>
        {canManage && (
          <div className="user-actions">
            <button
              onClick={handleToggleAdmin}
              className="user-admin-btn"
              aria-label={user.isAdmin ? "Remove admin" : "Make admin"}
              title={user.isAdmin ? "Remove admin rights" : "Grant admin rights"}
            >
              {user.isAdmin ? "👑" : "⭐"}
            </button>
            <button
              onClick={handleDelete}
              className="user-delete-btn"
              aria-label="Delete user"
              title="Delete user"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
      <div className="user-card-footer">
        <span className="user-date">Joined: {createdDate}</span>
      </div>
    </div>
  );
};

export default UserCard;
