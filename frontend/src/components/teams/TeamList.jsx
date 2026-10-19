import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { teamsAPI } from "../../services/api.js";
import TeamCard from "./TeamCard.jsx";
import TeamForm from "./TeamForm.jsx";
import "./Teams.css";

const TeamList = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await teamsAPI.getAll();
      setTeams(data.teams || data || []);
      setError("");
    } catch (err) {
      setError("Failed to load teams. Please try again.");
      console.error("Error loading teams:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const handleCreate = async (teamData) => {
    try {
      await teamsAPI.create(teamData);
      await loadTeams();
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Failed to create team. Please try again.");
      console.error("Error creating team:", err);
    }
  };

  const handleUpdate = async (teamData) => {
    try {
      await teamsAPI.update(editingTeam.id, teamData);
      await loadTeams();
      setShowForm(false);
      setEditingTeam(null);
    } catch (err) {
      setError(err.message || "Failed to update team. Please try again.");
      console.error("Error updating team:", err);
    }
  };

  const handleDelete = async (teamId) => {
    if (
      !confirm(
        "Are you sure you want to delete this team? This will also delete all tasks associated with this team. This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await teamsAPI.delete(teamId);
      await loadTeams();
    } catch (err) {
      setError(err.message || "Failed to delete team. Please try again.");
      console.error("Error deleting team:", err);
    }
  };

  if (loading) {
    return <div className="loading">Loading teams...</div>;
  }

  return (
    <div className="team-list-container">
      <div className="team-list-header">
        <h2>Teams</h2>
        <button
          type="button"
          onClick={() => {
            setEditingTeam(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          + Create Team
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <TeamForm
          team={editingTeam}
          onSubmit={editingTeam ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingTeam(null);
          }}
        />
      )}

      <div className="team-grid">
        {teams.length === 0 ? (
          <p className="empty-state">No teams yet. Create your first team!</p>
        ) : (
          teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onEdit={(team) => {
                setEditingTeam(team);
                setShowForm(true);
              }}
              onDelete={handleDelete}
              currentUserId={currentUser?.id}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TeamList;
