import express from "express";
import { query } from "../db/index.js";
import { requireAdmin } from "../middlewares/admin.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all teams (with membership status)
router.get("/", async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get ALL teams (no filtering by membership)
    // Then check membership status for each team
    const teamsResult = await query(
      `SELECT 
       t.id,
       t.name,
       t.description,
       t.created_by,
       t.created_at,
       t.updated_at,
       creator.name as created_by_name
       FROM teams t
       LEFT JOIN users creator ON t.created_by = creator.id
       ORDER BY t.created_at DESC`,
    );

    // Get member counts for all teams
    const memberCountsResult = await query(
      `SELECT team_id, COUNT(user_id) as count
       FROM team_members
       GROUP BY team_id`,
    );

    // Get user's team memberships
    const userMembershipsResult = await query(
      `SELECT team_id FROM team_members WHERE user_id = $1`,
      [userId],
    );

    const memberCountsMap = new Map();
    memberCountsResult.rows.forEach((row) => {
      memberCountsMap.set(row.team_id, parseInt(row.count, 10));
    });

    const userMembershipsSet = new Set();
    userMembershipsResult.rows.forEach((row) => {
      userMembershipsSet.add(row.team_id);
    });

    const teams = teamsResult.rows.map((team) => ({
      id: team.id,
      name: team.name,
      description: team.description,
      createdBy: team.created_by_name,
      createdById: team.created_by,
      memberCount: memberCountsMap.get(team.id) || 0,
      isMember: userMembershipsSet.has(team.id),
      createdAt: new Date(team.created_at).toISOString(),
    }));

    res.json({ teams });
  } catch (error) {
    next(error);
  }
});

// Get team by ID (available to all authenticated users)
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `SELECT t.*, 
       creator.name as created_by_name,
       COUNT(DISTINCT tm.user_id) as member_count
       FROM teams t
       LEFT JOIN team_members tm ON t.id = tm.team_id
       LEFT JOIN users creator ON t.created_by = creator.id
       WHERE t.id = $1
       GROUP BY t.id, creator.name`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    const team = result.rows[0];

    // Get team members
    const membersResult = await query(
      `SELECT u.id, u.name, u.email, tm.joined_at
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = $1
       ORDER BY tm.joined_at`,
      [id],
    );

    const teamData = {
      id: team.id,
      name: team.name,
      description: team.description,
      createdBy: team.created_by_name,
      memberCount: parseInt(team.member_count, 10),
      members: membersResult.rows.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        joinedAt: new Date(member.joined_at).toISOString(),
      })),
      createdAt: new Date(team.created_at).toISOString(),
    };

    res.json({ team: teamData });
  } catch (error) {
    next(error);
  }
});

// Create team
router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    // Create team
    const result = await query(
      `INSERT INTO teams (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, userId],
    );

    const team = result.rows[0];

    // Automatically add creator as a team member
    await query(
      `INSERT INTO team_members (team_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (team_id, user_id) DO NOTHING`,
      [team.id, userId],
    );

    // Get creator name
    const creatorResult = await query("SELECT name FROM users WHERE id = $1", [
      userId,
    ]);
    const createdByName = creatorResult.rows[0]?.name || null;

    res.status(201).json({
      message: "Team created successfully",
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        createdBy: createdByName,
        memberCount: 1,
        createdAt: new Date(team.created_at).toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Join team
router.post("/:id/join", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if team exists
    const teamCheck = await query("SELECT id FROM teams WHERE id = $1", [id]);

    if (teamCheck.rows.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is already a member
    const memberCheck = await query(
      "SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2",
      [id, userId],
    );

    if (memberCheck.rows.length > 0) {
      return res.status(409).json({
        message: "You are already a member of this team",
      });
    }

    // Add user to team
    await query(
      `INSERT INTO team_members (team_id, user_id)
       VALUES ($1, $2)`,
      [id, userId],
    );

    res.json({ message: "Successfully joined team" });
  } catch (error) {
    next(error);
  }
});

// Leave team
router.post("/:id/leave", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if team exists
    const teamCheck = await query("SELECT created_by FROM teams WHERE id = $1", [id]);

    if (teamCheck.rows.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Prevent creator from leaving their own team
    if (teamCheck.rows[0].created_by === userId) {
      return res.status(400).json({
        message: "Team creator cannot leave the team. Transfer ownership or delete the team instead.",
      });
    }

    // Check if user is a member
    const memberCheck = await query(
      "SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2",
      [id, userId],
    );

    if (memberCheck.rows.length === 0) {
      return res.status(404).json({
        message: "You are not a member of this team",
      });
    }

    // Remove user from team
    await query(
      "DELETE FROM team_members WHERE team_id = $1 AND user_id = $2",
      [id, userId],
    );

    res.json({ message: "Successfully left team" });
  } catch (error) {
    next(error);
  }
});

// Update team (creator or admin only)
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    // Check if team exists and get creator info
    const teamCheck = await query(
      "SELECT created_by FROM teams WHERE id = $1",
      [id],
    );

    if (teamCheck.rows.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    const teamCreatorId = teamCheck.rows[0].created_by;

    // Check if user is creator or admin
    const isCreator = teamCreatorId === userId;
    const isAdmin = req.user.isAdmin || false;

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: "Only team creator or admin can update this team",
      });
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Team name cannot be empty" });
      }
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE teams SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values,
    );

    const team = result.rows[0];

    // Get creator name
    const creatorResult = await query("SELECT name FROM users WHERE id = $1", [
      team.created_by,
    ]);
    const createdByName = creatorResult.rows[0]?.name || null;

    // Get member count
    const memberCountResult = await query(
      "SELECT COUNT(*) as count FROM team_members WHERE team_id = $1",
      [team.id],
    );
    const memberCount = parseInt(memberCountResult.rows[0].count, 10);

    res.json({
      message: "Team updated successfully",
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        createdBy: createdByName,
        memberCount,
        createdAt: new Date(team.created_at).toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete team (creator or admin only)
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if team exists and get creator info
    const teamCheck = await query(
      "SELECT created_by FROM teams WHERE id = $1",
      [id],
    );

    if (teamCheck.rows.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    const teamCreatorId = teamCheck.rows[0].created_by;

    // Check if user is creator or admin
    const isCreator = teamCreatorId === userId;
    const isAdmin = req.user.isAdmin || false;

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: "Only team creator or admin can delete this team",
      });
    }

    // Delete team (cascade will handle related records)
    await query("DELETE FROM teams WHERE id = $1", [id]);

    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
