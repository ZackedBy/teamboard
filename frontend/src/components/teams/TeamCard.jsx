import { Link } from "react-router-dom";
import "./Teams.css";

const TeamCard = ({
  team,
  onJoin,
  onLeave,
  onEdit,
  onDelete,
  currentUserId,
  isAdmin,
}) => {
  const isCreator = team.createdById === currentUserId;
  const isMember = team.isMember || false;
  const canEdit = isCreator || isAdmin;
  const canDelete = isCreator || isAdmin;
  const canLeave = isMember && !isCreator; // Can't leave if you're the creator

  const handleDelete = () => {
    if (onDelete) {
      onDelete(team.id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(team);
    }
  };

  return (
    <div className="team-card">
      <div className="team-card-header">
        <h3>{team.name}</h3>
        {canEdit && (
          <div className="team-card-actions">
            <button
              onClick={handleEdit}
              className="team-action-btn"
              aria-label="Edit team"
              title="Edit team"
            >
              ✏️
            </button>
            {canDelete && (
              <button
                onClick={handleDelete}
                className="team-action-btn"
                aria-label="Delete team"
                title="Delete team"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
      {team.description && (
        <p className="team-description">{team.description}</p>
      )}
      <div className="team-meta">
        <span>Members: {team.memberCount || 0}</span>
        {team.createdBy && <span>Created by: {team.createdBy}</span>}
      </div>
      <div className="team-actions">
        {isMember ? (
          <>
            <Link to={`/teams/${team.id}/view`} className="btn-secondary">
              View Team
            </Link>
            <Link to={`/teams/${team.id}`} className="btn-secondary">
              View Tasks
            </Link>
            {canLeave && onLeave && (
              <button onClick={() => onLeave(team.id)} className="btn-secondary">
                Leave Team
              </button>
            )}
          </>
        ) : (
          onJoin && (
            <button onClick={() => onJoin(team.id)} className="btn-primary">
              Join Team
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default TeamCard;
