import express from "express";
import { checkDbConnection } from "../database.js";

const router = express.Router();

/**
 * GET /health (Liveness Check)
 * Basic health check endpoint - always returns 200 OK if the server is running
 * When mounted at root: /health
 * When mounted at /api/v1/health: /api/v1/health
 */
router.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Liveness probe successful",
    timestamp: new Date().toISOString(),
  });
});

export default router;
