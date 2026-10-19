import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { query } from "../db/index.js";
import { env } from "../env.js";

const router = express.Router();

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  email: z.string().trim().email("Email must be valid").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(200),
});

const loginSchema = z.object({
  email: z.string().trim().email("Email must be valid"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: Boolean(user.is_admin),
  };
}

function signToken(user, rememberMe = false) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin: Boolean(user.is_admin),
    },
    env.JWT_SECRET,
    { expiresIn: rememberMe ? "30d" : "7d" },
  );
}

function validationError(res, error) {
  return res.status(400).json({
    message: error.issues[0]?.message || "Invalid request",
  });
}

router.post("/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error);
    }

    const { name, password } = parsed.data;
    const email = parsed.data.email.toLowerCase();

    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const countResult = await query("SELECT COUNT(*)::int AS count FROM users");
    const isFirstUser = countResult.rows[0].count === 0;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, email, password, is_admin)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, is_admin, created_at`,
      [name, email, hashedPassword, isFirstUser],
    );

    const user = result.rows[0];
    const token = signToken(user);

    res.status(201).json({
      message: "User created successfully",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error);
    }

    const { password, rememberMe } = parsed.data;
    const email = parsed.data.email.toLowerCase();

    const result = await query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.json({
      message: "Login successful",
      token: signToken(user, rememberMe),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
