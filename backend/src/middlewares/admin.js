import { query } from "../db/index.js";

export const requireAdmin = async (req, res, next) => {
  try {
    // Check if user is admin from JWT token
    if (!req.user?.isAdmin) {
      // Double-check from database to be safe
      const result = await query("SELECT is_admin FROM users WHERE id = $1", [
        req.user.id,
      ]);

      if (result.rows.length === 0 || !result.rows[0].is_admin) {
        return res.status(403).json({
          message: "Admin access required",
        });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Error checking admin status",
    });
  }
};

