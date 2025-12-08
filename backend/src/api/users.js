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
      `SELECT id, name, email, created_at, updated_at 
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
      `SELECT id, name, email, created_at, updated_at 
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
