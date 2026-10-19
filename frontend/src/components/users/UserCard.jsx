import "./Users.css";

const UserCard = ({ user, isAdmin, onDelete, currentUserId }) => {
  const createdDate = new Date(user.createdAt).toLocaleDateString();
  const canDelete = isAdmin && user.id !== currentUserId;

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`,
      )
    ) {
      onDelete(user.id);
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
          {user.email && <p className="user-email">{user.email}</p>}
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="user-delete-btn"
            aria-label="Delete user"
            title="Delete user"
          >
            🗑️
          </button>
        )}
      </div>
      <div className="user-card-footer">
        <span className="user-date">Joined: {createdDate}</span>
      </div>
    </div>
  );
};

export default UserCard;
