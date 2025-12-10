import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import { query } from "../db/index.js";
import { env } from "../env.js";

const router = express.Router();

// Register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if this is the first user (make them admin automatically)
    const userCount = await query("SELECT COUNT(*) as count FROM users");
    const isFirstUser = parseInt(userCount.rows[0].count) === 0;

    // Create user (make first user admin automatically)
    const result = await query(
      "INSERT INTO users (name, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, name, email, is_admin, created_at",
      [name, email.toLowerCase(), hashedPassword, isFirstUser],
    );

    const user = result.rows[0];

    // Generate JWT token (include admin status)
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.is_admin || false },
      env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(201).json({
      message: isFirstUser
        ? "User created successfully. First user is now an administrator."
        : "User created successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin || false,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const result = await query("SELECT * FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate JWT token with longer expiration if "Remember Me" is checked
    // 7 days for normal login, 30 days for "Remember Me"
    const expiresIn = rememberMe ? "30d" : "7d";
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.is_admin || false },
      env.JWT_SECRET,
      {
        expiresIn,
      },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin || false,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
