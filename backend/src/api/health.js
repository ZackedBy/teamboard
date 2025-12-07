import express from "express";

const router = express.Router();

/**
 * GET /health (Liveness Check)
 * Basic health check endpoint - always returns 200 OK if the server process is running.
 */
router.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Liveness probe successful",
    timestamp: new Date().toISOString(),
  });
});

export default router;