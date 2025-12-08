import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Layout from "./components/layout/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import TaskList from "./components/tasks/TaskList.jsx";
import TeamList from "./components/teams/TeamList.jsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import Calendar from "./pages/Calendar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TeamTasks from "./pages/TeamTasks.jsx";
import TeamView from "./pages/TeamView.jsx";
import Users from "./pages/Users.jsx";
import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams"
        element={
          <ProtectedRoute>
            <Layout>
              <TeamList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams/:teamId/view"
        element={
          <ProtectedRoute>
            <TeamView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams/:teamId"
        element={
          <ProtectedRoute>
            <Layout>
              <TeamTasks />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Layout>
              <TaskList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Layout>
              <Calendar />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
