import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../services/api.js";

const AuthContext = createContext(null);

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return true;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function readStoredUser() {
  const token = localStorage.getItem("authToken");
  const storedUser = localStorage.getItem("user");
  if (!token || !storedUser || isTokenExpired(token)) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Error parsing stored user:", error);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    return null;
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(readStoredUser());
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      if (response.token) {
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user);
        return { success: true };
      }
      return { success: false, error: "Invalid response from server" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      if (response.token) {
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user);
        return { success: true };
      }
      return { success: false, error: "Invalid response from server" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
