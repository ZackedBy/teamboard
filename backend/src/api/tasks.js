import express from "express";
import { query } from "../db/index.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all tasks (optionally filtered by team or show all tasks)
router.get("/", async (req, res, next) => {
  try {
    const { teamId, all } = req.query;
    const userId = req.user.id;

    let tasks;
    if (teamId) {
      // Get tasks for a specific team
      const result = await query(
        `SELECT t.*, 
         u.name as assigned_to_name,
         creator.name as created_by_name,
         team.name as team_name
         FROM tasks t
         LEFT JOIN users u ON t.assigned_to = u.id
         LEFT JOIN users creator ON t.created_by = creator.id
         LEFT JOIN teams team ON t.team_id = team.id
         WHERE t.team_id = $1
         ORDER BY t.created_at DESC`,
        [teamId],
      );
      tasks = result.rows;
    } else if (all === "true" || all === "1") {
      // Get all tasks from teams the user is a member of
      const result = await query(
        `SELECT DISTINCT t.*, 
         u.name as assigned_to_name,
         creator.name as created_by_name,
         team.name as team_name
         FROM tasks t
         LEFT JOIN users u ON t.assigned_to = u.id
         LEFT JOIN users creator ON t.created_by = creator.id
         LEFT JOIN teams team ON t.team_id = team.id
         WHERE t.team_id IN (
           SELECT team_id FROM team_members WHERE user_id = $1
           UNION
           SELECT id FROM teams WHERE created_by = $1
         )
         ORDER BY t.created_at DESC`,
        [userId],
      );
      tasks = result.rows;
    } else {
      // Get all tasks for the user (either assigned to them or created by them)
      const result = await query(
        `SELECT t.*, 
         u.name as assigned_to_name,
         creator.name as created_by_name,
         team.name as team_name
         FROM tasks t
         LEFT JOIN users u ON t.assigned_to = u.id
         LEFT JOIN users creator ON t.created_by = creator.id
         LEFT JOIN teams team ON t.team_id = team.id
         WHERE t.assigned_to = $1 OR t.created_by = $1
         ORDER BY t.created_at DESC`,
        [userId],
      );
      tasks = result.rows;
    }

    // Format the response
    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status || "todo",
      dueDate: task.due_date ? new Date(task.due_date).toISOString() : null,
      assignedTo: task.assigned_to_name || null,
      assignedToId: task.assigned_to || null,
      teamId: task.team_id,
      teamName: task.team_name || null,
      createdBy: task.created_by_name,
      createdAt: new Date(task.created_at).toISOString(),
      updatedAt: new Date(task.updated_at).toISOString(),
    }));

    res.json({ tasks: formattedTasks });
  } catch (error) {
    next(error);
  }
});

// Get task by ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT t.*, 
       u.name as assigned_to_name,
       creator.name as created_by_name,
       team.name as team_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN users creator ON t.created_by = creator.id
       LEFT JOIN teams team ON t.team_id = team.id
       WHERE t.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = result.rows[0];

    // Format the response
    const formattedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status || "todo",
      dueDate: task.due_date ? new Date(task.due_date).toISOString() : null,
      assignedTo: task.assigned_to_name || null,
      assignedToId: task.assigned_to || null,
      teamId: task.team_id,
      teamName: task.team_name || null,
      createdBy: task.created_by_name,
      createdAt: new Date(task.created_at).toISOString(),
      updatedAt: new Date(task.updated_at).toISOString(),
    };

    res.json({ task: formattedTask });
  } catch (error) {
    next(error);
  }
});

// Create task
router.post("/", async (req, res, next) => {
  try {
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      assignedTo,
      assignedToId,
      teamId,
    } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Handle assignedTo - prefer assignedToId (user ID) over assignedTo (name/email)
    let finalAssignedToId = null;
    if (assignedToId) {
      // Use provided user ID directly
      finalAssignedToId = parseInt(assignedToId, 10);
      // Verify user exists
      const userCheck = await query("SELECT id FROM users WHERE id = $1", [
        finalAssignedToId,
      ]);
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ message: "Assigned user not found" });
      }
    } else if (assignedTo) {
      // Fallback: find user by name/email (for backward compatibility)
      const userResult = await query(
        "SELECT id FROM users WHERE name = $1 OR email = $1",
        [assignedTo],
      );
      if (userResult.rows.length > 0) {
        finalAssignedToId = userResult.rows[0].id;
      }
    }

    const result = await query(
      `INSERT INTO tasks (title, description, priority, status, due_date, assigned_to, team_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title,
        description || null,
        priority || "medium",
        status || "todo",
        dueDate ? new Date(dueDate) : null,
        finalAssignedToId,
        teamId || null,
        userId,
      ],
    );

    const task = result.rows[0];

    // Get assigned user name
    let assignedToName = null;
    if (task.assigned_to) {
      const userResult = await query("SELECT name FROM users WHERE id = $1", [
        task.assigned_to,
      ]);
      if (userResult.rows.length > 0) {
        assignedToName = userResult.rows[0].name;
      }
    }

    // Get team name
    let teamName = null;
    if (task.team_id) {
      const teamResult = await query("SELECT name FROM teams WHERE id = $1", [
        task.team_id,
      ]);
      if (teamResult.rows.length > 0) {
        teamName = teamResult.rows[0].name;
      }
    }

    res.status(201).json({
      message: "Task created successfully",
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status || "todo",
        dueDate: task.due_date ? new Date(task.due_date).toISOString() : null,
        assignedTo: assignedToName,
        assignedToId: task.assigned_to || null,
        teamId: task.team_id,
        teamName,
        createdAt: new Date(task.created_at).toISOString(),
        updatedAt: new Date(task.updated_at).toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update task
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, dueDate, assignedTo, assignedToId } =
      req.body;

    // Check if task exists
    const taskCheck = await query(
      "SELECT created_by FROM tasks WHERE id = $1",
      [id],
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount++}`);
      values.push(priority);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (dueDate !== undefined) {
      updates.push(`due_date = $${paramCount++}`);
      values.push(dueDate ? new Date(dueDate) : null);
    }

    // Handle assignedTo - prefer assignedToId (user ID) over assignedTo (name/email)
    if (assignedToId !== undefined || assignedTo !== undefined) {
      let finalAssignedToId = null;
      
      if (assignedToId !== undefined && assignedToId !== null && assignedToId !== "") {
        // Use provided user ID directly
        finalAssignedToId = parseInt(assignedToId, 10);
        // Verify user exists
        const userCheck = await query("SELECT id FROM users WHERE id = $1", [
          finalAssignedToId,
        ]);
        if (userCheck.rows.length === 0) {
          return res.status(400).json({ message: "Assigned user not found" });
        }
      } else if (assignedTo !== undefined && assignedTo !== null && assignedTo !== "") {
        // Fallback: find user by name/email (for backward compatibility)
        const userResult = await query(
          "SELECT id FROM users WHERE name = $1 OR email = $1",
          [assignedTo],
        );
        if (userResult.rows.length > 0) {
          finalAssignedToId = userResult.rows[0].id;
        }
      }
      
      updates.push(`assigned_to = $${paramCount++}`);
      values.push(finalAssignedToId);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE tasks SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values,
    );

    const task = result.rows[0];

    // Get assigned user name
    let assignedToName = null;
    if (task.assigned_to) {
      const userResult = await query("SELECT name FROM users WHERE id = $1", [
        task.assigned_to,
      ]);
      if (userResult.rows.length > 0) {
        assignedToName = userResult.rows[0].name;
      }
    }

    // Get team name
    let teamName = null;
    if (task.team_id) {
      const teamResult = await query("SELECT name FROM teams WHERE id = $1", [
        task.team_id,
      ]);
      if (teamResult.rows.length > 0) {
        teamName = teamResult.rows[0].name;
      }
    }

    res.json({
      message: "Task updated successfully",
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status || "todo",
        dueDate: task.due_date ? new Date(task.due_date).toISOString() : null,
        assignedTo: assignedToName,
        assignedToId: task.assigned_to || null,
        teamId: task.team_id,
        teamName,
        updatedAt: new Date(task.updated_at).toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete task
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if task exists
    const taskCheck = await query(
      "SELECT created_by FROM tasks WHERE id = $1",
      [id],
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    await query("DELETE FROM tasks WHERE id = $1", [id]);

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
