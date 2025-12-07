import express from "express";
import { checkDbConnection } from "./database.js"; // Импортируем функцию проверки БД

const router = express.Router();

/**
 * GET /health (Liveness Check)
 * Явно определяем путь как /health
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
 * Явно определяем путь как /ready и добавляем логику БД
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