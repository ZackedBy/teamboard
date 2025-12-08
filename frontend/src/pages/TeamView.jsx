import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import { teamsAPI } from "../services/api.js";
import "./TeamView.css";

const TeamView = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTeam = async () => {
      try {
        setLoading(true);
        const data = await teamsAPI.getById(teamId);
        setTeam(data.team);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load team details.");
        console.error("Error loading team:", err);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      loadTeam();
    }
  }, [teamId]);

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading team details...</div>
      </Layout>
    );
  }

  if (error || !team) {
    return (
      <Layout>
        <div className="team-view-container">
          <div className="error-message">{error || "Team not found"}</div>
          <Link to="/teams" className="btn-secondary">
            Back to Teams
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="team-view-container">
        <div className="team-view-header">
          <div>
            <button
              onClick={() => navigate("/teams")}
              className="back-button"
              aria-label="Back to teams"
            >
              ← Back
            </button>
            <h1>{team.name}</h1>
            {team.description && (
              <p className="team-description">{team.description}</p>
            )}
          </div>
          <Link to={`/teams/${team.id}`} className="btn-primary">
            View Tasks
          </Link>
        </div>

        <div className="team-stats">
          <div className="stat-card">
            <div className="stat-value">{team.memberCount || 0}</div>
            <div className="stat-label">Members</div>
          </div>
          {team.createdBy && (
            <div className="stat-card">
              <div className="stat-value">By</div>
              <div className="stat-label">{team.createdBy}</div>
            </div>
          )}
        </div>

        <div className="team-members-section">
          <h2>Team Members</h2>
          {team.members && team.members.length > 0 ? (
            <div className="members-grid">
              {team.members.map((member) => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-info">
                    <h3>{member.name}</h3>
                    <p className="member-email">{member.email}</p>
                    <p className="member-joined">
                      Joined: {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No members in this team yet.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TeamView;
