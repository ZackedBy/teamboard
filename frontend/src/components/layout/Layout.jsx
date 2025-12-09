import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import "./Layout.css";

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
          <button
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className={`nav-menu ${mobileMenuOpen ? "active" : ""}`}>
            <Link
              to="/dashboard"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/teams"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Teams
            </Link>
            <Link
              to="/tasks"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              All Tasks
            </Link>
            <Link
              to="/calendar"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Calendar
            </Link>
            <Link
              to="/users"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Users
            </Link>
            <div className="nav-user">
              <span className="user-name">{user?.name || "User"}</span>
              <button onClick={handleLogout} className="btn-logout">
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
