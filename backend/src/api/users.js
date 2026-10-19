import express from "express";
import { query } from "../db/index.js";
import { requireAdmin } from "../middlewares/admin.js";
import { attachCurrentUser, authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticateToken);
router.use(attachCurrentUser);

function parseUserId(value) {
  if (typeof value === "string" && /^[1-9]\d*$/.test(value))
    return Number(value);
  return null;
}

function formatUser(user, { includeEmail }) {
  return {
    id: user.id,
    name: user.name,
    email: includeEmail ? user.email : undefined,
    isAdmin: Boolean(user.is_admin),
    createdAt: new Date(user.created_at).toISOString(),
    updatedAt: new Date(user.updated_at).toISOString(),
  };
}

router.get("/", requireAdmin, async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, email, is_admin, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`,
    );

    res.json({
      users: result.rows.map((user) =>
        formatUser(user, { includeEmail: true }),
      ),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = parseUserId(req.params.id);
    if (!id) return res.status(400).json({ message: "User id is invalid" });

    if (!req.user.isAdmin && id !== req.user.id) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await query(
      `SELECT id, name, email, is_admin, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: formatUser(result.rows[0], { includeEmail: true }),
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = parseUserId(req.params.id);
    if (!id) return res.status(400).json({ message: "User id is invalid" });

    if (id === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    const userCheck = await query("SELECT id FROM users WHERE id = $1", [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
