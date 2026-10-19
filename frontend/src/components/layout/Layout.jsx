import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import "./Layout.css";

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/dashboard" className="nav-logo">
            TeamBoard
          </Link>
          <div className="nav-menu">
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link to="/teams" className="nav-link">
              Teams
            </Link>
            <Link to="/tasks" className="nav-link">
              All Tasks
            </Link>
            {isAdmin && (
              <Link to="/users" className="nav-link">
                Users
              </Link>
            )}
            <div className="nav-user">
              <span className="user-name">{user?.name || "User"}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-logout"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
