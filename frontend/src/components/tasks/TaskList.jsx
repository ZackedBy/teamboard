import { useCallback, useEffect, useState } from "react";
import { tasksAPI } from "../../services/api.js";
import TaskCard from "./TaskCard.jsx";
import TaskForm from "./TaskForm.jsx";
import "./Tasks.css";

const TaskList = ({ teamId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showAllTasks, setShowAllTasks] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tasksAPI.getAll(teamId, showAllTasks);
      setTasks(data.tasks || data || []);
      setError("");
    } catch (err) {
      setError("Failed to load tasks. Please try again.");
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [teamId, showAllTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreate = async (taskData) => {
    try {
      await tasksAPI.create({ ...taskData, teamId });
      await loadTasks();
      setShowForm(false);
    } catch (err) {
      setError("Failed to create task. Please try again.");
      console.error("Error creating task:", err);
    }
  };

  const handleUpdate = async (taskData) => {
    try {
      await tasksAPI.update(editingTask.id, taskData);
      await loadTasks();
      setEditingTask(null);
    } catch (err) {
      setError("Failed to update task. Please try again.");
      console.error("Error updating task:", err);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await tasksAPI.delete(taskId);
      await loadTasks();
    } catch (err) {
      setError("Failed to delete task. Please try again.");
      console.error("Error deleting task:", err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      // Optimistically update the task in the list
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task,
        ),
      );
    } catch (err) {
      setError("Failed to update task status. Please try again.");
      console.error("Error updating task status:", err);
      // Reload tasks to revert optimistic update
      await loadTasks();
      throw err;
    }
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <div>
          <h2>Tasks</h2>
          {!teamId && (
            <label className="toggle-all-tasks">
              <input
                type="checkbox"
                checked={showAllTasks}
                onChange={(e) => setShowAllTasks(e.target.checked)}
              />
              <span>Show all tasks from my team</span>
            </label>
          )}
        </div>
        <button
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          + New Task
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}

      <div className="task-grid">
        {tasks.length === 0 ? (
          <p className="empty-state">No tasks yet. Create your first task!</p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(task) => {
                setEditingTask(task);
                setShowForm(true);
              }}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
