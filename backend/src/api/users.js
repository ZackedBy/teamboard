import express from "express";
import { query } from "../db/index.js";
import { requireAdmin } from "../middlewares/admin.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all users
router.get("/", async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, email, is_admin, created_at, updated_at 
       FROM users 
       ORDER BY created_at DESC`,
    );

    const users = result.rows.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.is_admin || false,
      createdAt: new Date(user.created_at).toISOString(),
      updatedAt: new Date(user.updated_at).toISOString(),
    }));

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, name, email, is_admin, created_at, updated_at 
       FROM users 
       WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin || false,
        createdAt: new Date(user.created_at).toISOString(),
        updatedAt: new Date(user.updated_at).toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update user (admin only)
router.put("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, isAdmin } = req.body;
    const currentUserId = req.user.id;

    // Prevent admin from removing their own admin status
    if (parseInt(id) === currentUserId && isAdmin === false) {
      return res.status(400).json({
        message: "You cannot remove your own admin status",
      });
    }

    // Check if user exists
    const userCheck = await query("SELECT id FROM users WHERE id = $1", [id]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (email !== undefined) {
      // Check if email is already taken by another user
      const emailCheck = await query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [email.toLowerCase(), id],
      );
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ message: "Email already in use" });
      }
      updates.push(`email = $${paramCount}`);
      values.push(email.toLowerCase());
      paramCount++;
    }

    if (isAdmin !== undefined) {
      updates.push(`is_admin = $${paramCount}`);
      values.push(isAdmin);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const updateQuery = `
      UPDATE users 
      SET ${updates.join(", ")} 
      WHERE id = $${paramCount}
      RETURNING id, name, email, is_admin, created_at, updated_at
    `;

    const result = await query(updateQuery, values);

    res.json({
      message: "User updated successfully",
      user: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email,
        isAdmin: result.rows[0].is_admin || false,
        createdAt: new Date(result.rows[0].created_at).toISOString(),
        updatedAt: new Date(result.rows[0].updated_at).toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete user (admin only)
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    // Prevent admin from deleting themselves
    if (parseInt(id) === currentUserId) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    // Check if user exists
    const userCheck = await query("SELECT id FROM users WHERE id = $1", [id]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user (cascade will handle related records)
    await query("DELETE FROM users WHERE id = $1", [id]);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
