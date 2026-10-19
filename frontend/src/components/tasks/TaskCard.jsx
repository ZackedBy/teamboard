import { useState } from "react";
import "./Tasks.css";

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ff4444";
      case "medium":
        return "#ffaa00";
      case "low":
        return "#00aa00";
      default:
        return "#666";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "todo":
        return "#888";
      case "in-progress":
        return "#667eea";
      case "done":
        return "#00aa00";
      case "delayed":
        return "#ff8800";
      case "blocked":
        return "#ff4444";
      default:
        return "#888";
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setIsChangingStatus(true);
    try {
      await onStatusChange(task.id, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <div className="task-card">
      <div className="task-header">
        <h3>{task.title}</h3>
        <div className="task-badges">
          <select
            className="status-select"
            value={task.status || "todo"}
            onChange={handleStatusChange}
            disabled={isChangingStatus}
            style={{
              backgroundColor: getStatusColor(task.status || "todo"),
              color: "white",
            }}
            title="Change task status"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
            <option value="delayed">Delayed</option>
            <option value="blocked">Blocked</option>
          </select>
          <span
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          >
            {task.priority || "medium"}
          </span>
        </div>
      </div>
      <p className="task-description">{task.description}</p>
      <div className="task-assignment-info">
        {task.teamName && (
          <div className="task-team">
            <span className="task-team-icon">👥</span>
            <span className="task-team-name">{task.teamName}</span>
          </div>
        )}
        {task.assignedTo && (
          <div className="task-assignee-info">
            <span className="task-assignee-icon">👤</span>
            <span className="task-assignee-name">{task.assignedTo}</span>
          </div>
        )}
      </div>
      <div className="task-footer">
        <div className="task-meta">
          {task.dueDate && (
            <span className="task-date">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="task-actions">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="btn-icon"
            aria-label="Edit task"
          >
            ✏️
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="btn-icon"
            aria-label="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
