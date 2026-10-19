import express from "express";
import { query } from "../db/index.js";
import { attachCurrentUser, authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

const PRIORITIES = new Set(["low", "medium", "high"]);
const STATUSES = new Set(["todo", "in-progress", "done", "delayed", "blocked"]);

const TASK_FROM = `
  FROM tasks t
  LEFT JOIN users u ON t.assigned_to = u.id
  LEFT JOIN users creator ON t.created_by = creator.id
  LEFT JOIN teams team ON t.team_id = team.id
`;

router.use(authenticateToken);
router.use(attachCurrentUser);

function formatTask(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status || "todo",
    dueDate: task.due_date ? new Date(task.due_date).toISOString() : null,
    assignedTo: task.assigned_to_name || null,
    teamId: task.team_id,
    teamName: task.team_name || null,
    createdBy: task.created_by_name,
    createdAt: new Date(task.created_at).toISOString(),
    updatedAt: new Date(task.updated_at).toISOString(),
  };
}

function parsePositiveInt(value) {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === "string" && /^[1-9]\d*$/.test(value)) {
    return Number(value);
  }
  return null;
}

function parseDueDate(value) {
  if (value === undefined) return { omitted: true };
  if (value === null || value === "") return { date: null };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { error: "Due date is invalid" };
  return { date };
}

async function assertTeamAccess(teamId, user) {
  const team = await query("SELECT id FROM teams WHERE id = $1", [teamId]);
  if (team.rows.length === 0) {
    return { status: 404, message: "Team not found" };
  }
  if (user.isAdmin) return null;

  const member = await query(
    "SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2",
    [teamId, user.id],
  );
  if (member.rows.length === 0) {
    return { status: 403, message: "You are not a member of this team" };
  }
  return null;
}

async function resolveAssignee(assignedTo, teamId) {
  if (assignedTo === undefined) return { omitted: true };
  if (assignedTo === null || String(assignedTo).trim() === "") {
    return { id: null };
  }

  const raw = String(assignedTo).trim();
  let result;

  if (/^[1-9]\d*$/.test(raw)) {
    result = await query("SELECT id FROM users WHERE id = $1", [Number(raw)]);
  } else if (raw.includes("@")) {
    result = await query(
      "SELECT id FROM users WHERE lower(email) = lower($1)",
      [raw],
    );
  } else if (teamId) {
    result = await query(
      `SELECT u.id
       FROM users u
       JOIN team_members tm ON tm.user_id = u.id
       WHERE tm.team_id = $1 AND u.name = $2`,
      [teamId, raw],
    );
    if (result.rows.length > 1) {
      return {
        error: "Several teammates share this name. Assign by email or id.",
      };
    }
  } else {
    return { error: "Assign people by id or email" };
  }

  if (!result || result.rows.length === 0) {
    return { error: "Assignee not found" };
  }

  const assigneeId = result.rows[0].id;
  if (teamId) {
    const member = await query(
      "SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2",
      [teamId, assigneeId],
    );
    if (member.rows.length === 0) {
      return { error: "Assignee must be a member of the team" };
    }
  }

  return { id: assigneeId };
}

async function loadVisibleTask(id, user) {
  const result = await query(
    `SELECT t.*,
      u.name AS assigned_to_name,
      creator.name AS created_by_name,
      team.name AS team_name
     ${TASK_FROM}
     WHERE t.id = $1
       AND (
         $2::boolean
         OR t.created_by = $3
         OR t.assigned_to = $3
         OR EXISTS (
           SELECT 1 FROM team_members tm
           WHERE tm.team_id = t.team_id AND tm.user_id = $3
         )
       )`,
    [id, user.isAdmin, user.id],
  );
  return result.rows[0] || null;
}

router.get("/", async (req, res, next) => {
  try {
    const { teamId, all } = req.query;
    const user = req.user;

    if ((all === "true" || all === "1") && !user.isAdmin) {
      return res.status(403).json({
        message: "Only an admin can list every task",
      });
    }

    let result;
    if (teamId !== undefined) {
      const parsedTeamId = parsePositiveInt(teamId);
      if (!parsedTeamId) {
        return res.status(400).json({ message: "Team id is invalid" });
      }
      const accessError = await assertTeamAccess(parsedTeamId, user);
      if (accessError) {
        return res
          .status(accessError.status)
          .json({ message: accessError.message });
      }
      result = await query(
        `SELECT t.*,
          u.name AS assigned_to_name,
          creator.name AS created_by_name,
          team.name AS team_name
         ${TASK_FROM}
         WHERE t.team_id = $1
         ORDER BY t.created_at DESC`,
        [parsedTeamId],
      );
    } else if ((all === "true" || all === "1") && user.isAdmin) {
      result = await query(
        `SELECT t.*,
          u.name AS assigned_to_name,
          creator.name AS created_by_name,
          team.name AS team_name
         ${TASK_FROM}
         ORDER BY t.created_at DESC`,
      );
    } else {
      result = await query(
        `SELECT t.*,
          u.name AS assigned_to_name,
          creator.name AS created_by_name,
          team.name AS team_name
         ${TASK_FROM}
         WHERE t.created_by = $1
            OR t.assigned_to = $1
            OR EXISTS (
              SELECT 1 FROM team_members tm
              WHERE tm.team_id = t.team_id AND tm.user_id = $1
            )
         ORDER BY t.created_at DESC`,
        [user.id],
      );
    }

    res.json({ tasks: result.rows.map(formatTask) });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Task id is invalid" });

    const task = await loadVisibleTask(id, req.user);
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ task: formatTask(task) });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const title =
      typeof req.body.title === "string" ? req.body.title.trim() : "";
    if (!title) return res.status(400).json({ message: "Title is required" });
    if (title.length > 255) {
      return res.status(400).json({ message: "Title is too long" });
    }

    const priority = req.body.priority || "medium";
    const status = req.body.status || "todo";
    if (!PRIORITIES.has(priority)) {
      return res.status(400).json({ message: "Priority is invalid" });
    }
    if (!STATUSES.has(status)) {
      return res.status(400).json({ message: "Status is invalid" });
    }

    const due = parseDueDate(req.body.dueDate);
    if (due.error) return res.status(400).json({ message: due.error });

    let teamId = null;
    if (
      req.body.teamId !== undefined &&
      req.body.teamId !== null &&
      req.body.teamId !== ""
    ) {
      teamId = parsePositiveInt(req.body.teamId);
      if (!teamId)
        return res.status(400).json({ message: "Team id is invalid" });
      const accessError = await assertTeamAccess(teamId, req.user);
      if (accessError) {
        return res
          .status(accessError.status)
          .json({ message: accessError.message });
      }
    }

    const assignee = await resolveAssignee(req.body.assignedTo, teamId);
    if (assignee.error)
      return res.status(400).json({ message: assignee.error });

    const inserted = await query(
      `INSERT INTO tasks (title, description, priority, status, due_date, assigned_to, team_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        title,
        req.body.description?.trim() || null,
        priority,
        status,
        due.date || null,
        assignee.id || null,
        teamId,
        req.user.id,
      ],
    );

    const task = await loadVisibleTask(inserted.rows[0].id, req.user);
    res.status(201).json({
      message: "Task created successfully",
      task: formatTask(task),
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Task id is invalid" });

    const existing = await loadVisibleTask(id, req.user);
    if (!existing) return res.status(404).json({ message: "Task not found" });

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (req.body.title !== undefined) {
      const title =
        typeof req.body.title === "string" ? req.body.title.trim() : "";
      if (!title) return res.status(400).json({ message: "Title is required" });
      if (title.length > 255) {
        return res.status(400).json({ message: "Title is too long" });
      }
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (req.body.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(req.body.description?.trim() || null);
    }
    if (req.body.priority !== undefined) {
      if (!PRIORITIES.has(req.body.priority)) {
        return res.status(400).json({ message: "Priority is invalid" });
      }
      updates.push(`priority = $${paramCount++}`);
      values.push(req.body.priority);
    }
    if (req.body.status !== undefined) {
      if (!STATUSES.has(req.body.status)) {
        return res.status(400).json({ message: "Status is invalid" });
      }
      updates.push(`status = $${paramCount++}`);
      values.push(req.body.status);
    }
    if (req.body.dueDate !== undefined) {
      const due = parseDueDate(req.body.dueDate);
      if (due.error) return res.status(400).json({ message: due.error });
      updates.push(`due_date = $${paramCount++}`);
      values.push(due.date);
    }
    if (req.body.assignedTo !== undefined) {
      const assignee = await resolveAssignee(
        req.body.assignedTo,
        existing.team_id,
      );
      if (assignee.error)
        return res.status(400).json({ message: assignee.error });
      updates.push(`assigned_to = $${paramCount++}`);
      values.push(assignee.id);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);
    await query(
      `UPDATE tasks SET ${updates.join(", ")} WHERE id = $${paramCount}`,
      values,
    );

    const task = await loadVisibleTask(id, req.user);
    res.json({
      message: "Task updated successfully",
      task: formatTask(task),
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Task id is invalid" });

    const existing = await loadVisibleTask(id, req.user);
    if (!existing) return res.status(404).json({ message: "Task not found" });

    const canDelete = req.user.isAdmin || existing.created_by === req.user.id;
    if (!canDelete) {
      return res.status(403).json({
        message: "Only the creator or an admin can delete this task",
      });
    }

    await query("DELETE FROM tasks WHERE id = $1", [id]);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
