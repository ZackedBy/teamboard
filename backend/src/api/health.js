import express from "express";
import { checkDbConnection } from "./database.js"; // Import the DB check function

const router = express.Router();

/**
 * GET /health (Liveness Check)
 */
router.get("/health", (_req, res) => { // Роут явно /health
  res.status(200).json({
    status: "ok",
    message: "Liveness probe successful",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /ready (Readiness Check)
 */
router.get("/ready", async (_req, res) => { // Роут явно /ready
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