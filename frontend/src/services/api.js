import apiRequest from "../config/api.js";

// Authentication API
export const authAPI = {
  register: async (userData) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials) => {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (teamId, showAll = false) => {
    let endpoint = "/tasks";
    const params = new URLSearchParams();
    if (teamId) {
      params.append("teamId", teamId);
    }
    if (showAll) {
      params.append("all", "true");
    }
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    return apiRequest(endpoint, {
      method: "GET",
    });
  },

  getById: async (taskId) => {
    return apiRequest(`/tasks/${taskId}`, {
      method: "GET",
    });
  },

  create: async (taskData) => {
    return apiRequest("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  },

  update: async (taskId, taskData) => {
    return apiRequest(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
  },

  updateStatus: async (taskId, status) => {
    return apiRequest(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  delete: async (taskId) => {
    return apiRequest(`/tasks/${taskId}`, {
      method: "DELETE",
    });
  },
};

// Teams API
export const teamsAPI = {
  getAll: async () => {
    return apiRequest("/teams", {
      method: "GET",
    });
  },

  getById: async (teamId) => {
    return apiRequest(`/teams/${teamId}`, {
      method: "GET",
    });
  },

  create: async (teamData) => {
    return apiRequest("/teams", {
      method: "POST",
      body: JSON.stringify(teamData),
    });
  },

  update: async (teamId, teamData) => {
    return apiRequest(`/teams/${teamId}`, {
      method: "PUT",
      body: JSON.stringify(teamData),
    });
  },

  delete: async (teamId) => {
    return apiRequest(`/teams/${teamId}`, {
      method: "DELETE",
    });
  },

  join: async (teamId) => {
    return apiRequest(`/teams/${teamId}/join`, {
      method: "POST",
    });
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    return apiRequest("/users", {
      method: "GET",
    });
  },

  getById: async (userId) => {
    return apiRequest(`/users/${userId}`, {
      method: "GET",
    });
  },

  delete: async (userId) => {
    return apiRequest(`/users/${userId}`, {
      method: "DELETE",
    });
  },
};

// Emojis API (existing endpoint)
export const emojisAPI = {
  getRandom: async () => {
    return apiRequest("/emojis/random", {
      method: "GET",
    });
  },
};

