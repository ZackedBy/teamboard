import { useEffect, useState } from "react";
import { usersAPI } from "../../services/api.js";
import "./Tasks.css";

const TaskForm = ({ task, onSubmit, onCancel, teamMembers = [] }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    dueDate: "",
    assignedTo: "",
    assignedToId: "",
    teamId: "",
  });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    // Fetch all users for assignment
    const loadUsers = async () => {
      try {
        const data = await usersAPI.getAll();
        setUsers(data.users || []);
      } catch (err) {
        console.error("Error loading users:", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (task) {
      // Find user ID if assignedTo is a name
      let assignedToId = "";
      if (task.assignedTo) {
        const user = users.find(
          (u) => u.name === task.assignedTo || u.email === task.assignedTo,
        );
        if (user) {
          assignedToId = user.id.toString();
        }
      }

      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        status: task.status || "todo",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        assignedTo: task.assignedTo || "",
        assignedToId: assignedToId || task.assignedToId || "",
        teamId: task.teamId || "",
      });
    }
  }, [task, users]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert assignedToId to number or null
    const submitData = {
      ...formData,
      assignedToId: formData.assignedToId ? parseInt(formData.assignedToId, 10) : null,
    };
    onSubmit(submitData);
  };

  return (
    <div className="task-form-container">
      <form onSubmit={handleSubmit} className="task-form">
        <h3>{task ? "Edit Task" : "Create New Task"}</h3>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter task title"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Enter task description"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
              <option value="delayed">Delayed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="assignedToId">Assign To</label>
          <select
            id="assignedToId"
            name="assignedToId"
            value={formData.assignedToId}
            onChange={handleChange}
            disabled={loadingUsers}
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} {user.isAdmin && "(Admin)"}
              </option>
            ))}
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {task ? "Update Task" : "Create Task"}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
