import { query } from "../db/index.js";

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Access token required" });
    }

    const result = await query("SELECT is_admin FROM users WHERE id = $1", [
      req.user.id,
    ]);

    if (result.rows.length === 0 || !result.rows[0].is_admin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.user.isAdmin = true;
    next();
  } catch (error) {
    next(error);
  }
};
