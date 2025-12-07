import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import api from "./api/index.js";
import { checkDbConnection } from "./database.js";
import healthRouter from "./api/health.js"; // Health check router

import * as middlewares from "./middlewares.js";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoints at root level
app.use("/health", healthRouter);

/**
 * GET /ready (Readiness Check)
 * Returns 200 OK only if the database connection is established.
 */
app.get("/ready", async (_req, res) => {
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

app.get("/", (_req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;