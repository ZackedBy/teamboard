import express from "express";
import { checkDbConnection } from "./database.js"; // IMPORT: Database check function

const router = express.Router();

/**
 * GET /health (Liveness Check)
 * Basic health check endpoint - always returns 200 OK if the server process is running.
 */
router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Liveness probe successful",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /ready (Readiness Check)
 * Returns 200 OK only if the database connection is established.
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
    // Service Unavailable/Not Ready (HTTP 503)
    res.status(503).json({
      status: "not ready",
      database: "disconnected",
      error: "Database connection failed. Service is not ready.",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;