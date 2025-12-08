import { useCallback, useEffect, useState } from "react";
import { tasksAPI } from "../services/api.js";
import "./Calendar.css";

const Calendar = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      // Load all tasks from user's teams
      const data = await tasksAPI.getAll(null, true);
      setTasks(data.tasks || data || []);
      setError("");
    } catch (err) {
      setError("Failed to load tasks. Please try again.");
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split("T")[0];
      return taskDate === dateStr;
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const isToday = (date) =>
    date &&
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

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

  if (loading) {
    return <div className="loading">Loading calendar...</div>;
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Task Calendar</h1>
        <div className="calendar-controls">
          <button onClick={goToToday} className="btn-secondary">
            Today
          </button>
          <button onClick={() => navigateMonth(-1)} className="btn-nav">
            ‹
          </button>
          <h2>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={() => navigateMonth(1)} className="btn-nav">
            ›
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="calendar">
        <div className="calendar-weekdays">
          {dayNames.map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-days">
          {days.map((date, index) => {
            const dayTasks = getTasksForDate(date);
            return (
              <div
                key={index}
                className={`calendar-day ${!date ? "empty" : ""} ${
                  isToday(date) ? "today" : ""
                }`}
              >
                {date && (
                  <>
                    <div className="calendar-day-number">{date.getDate()}</div>
                    <div className="calendar-day-tasks">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="calendar-task-item"
                          style={{
                            borderLeftColor: getPriorityColor(task.priority),
                          }}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="calendar-task-more">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: "#ff4444" }}
          ></span>
          <span>High Priority</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: "#ffaa00" }}
          ></span>
          <span>Medium Priority</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: "#00aa00" }}
          ></span>
          <span>Low Priority</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
