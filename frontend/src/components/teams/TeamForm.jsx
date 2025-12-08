import { useEffect, useState } from "react";
import "./Teams.css";

const TeamForm = ({ team, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || "",
        description: team.description || "",
      });
    }
  }, [team]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="team-form-container">
      <form onSubmit={handleSubmit} className="team-form">
        <h3>{team ? "Edit Team" : "Create New Team"}</h3>
        <div className="form-group">
          <label htmlFor="name">Team Name *</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter team name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Enter team description"
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {team ? "Update Team" : "Create Team"}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeamForm;
