import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || "User"}!</h1>
        <p>Manage your tasks and collaborate with your teams.</p>
      </div>

      <div className="dashboard-grid">
        <Link to="/teams" className="dashboard-card">
          <div className="card-icon">👥</div>
          <h3>Teams</h3>
          <p>Create and manage teams</p>
        </Link>

        <Link to="/tasks" className="dashboard-card">
          <div className="card-icon">✓</div>
          <h3>Tasks</h3>
          <p>View tasks assigned to you or created by you</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
