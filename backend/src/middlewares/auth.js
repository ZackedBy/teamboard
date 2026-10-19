import jwt from "jsonwebtoken";
import { query } from "../db/index.js";
import { env } from "../env.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

export async function attachCurrentUser(req, res, next) {
  try {
    const result = await query(
      "SELECT id, email, is_admin FROM users WHERE id = $1",
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      isAdmin: Boolean(result.rows[0].is_admin),
    };
    next();
  } catch (error) {
    next(error);
  }
}
