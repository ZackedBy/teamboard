import express from "express";

const router = express.Router();

/**
 * GET /health
 * Basic health check endpoint - always returns 200 OK if the server is running
 */
router.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default router;

