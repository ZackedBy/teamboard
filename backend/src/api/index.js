import express from "express";
import { checkDbConnection } from "../database.js";

import auth from "./auth.js";
import emojis from "./emojis.js";
import health from "./health.js";
import tasks from "./tasks.js";
import teams from "./teams.js";
import users from "./users.js";

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/auth", auth);
router.use("/emojis", emojis);
router.use("/health", health);
router.use("/tasks", tasks);
router.use("/teams", teams);
router.use("/users", users);

/**
 * GET /ready
 * Readiness check endpoint - verifies database connectivity
 * Returns 200 OK if database is accessible, 503 Service Unavailable if not
 */
router.get("/ready", async (_req, res) => {
  const isDbReady = await checkDbConnection();

  if (isDbReady) {
    res.status(200).json({
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: "not ready",
      database: "disconnected",
      error: "Database connection failed. Service is not ready.",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
