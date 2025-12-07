import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import api from "./api/index.js";
import { checkDbConnection } from "./database.js";
import healthRouter from "./api/health.js"; // Import the Health Check Router
import * as middlewares from "./middlewares.js";

const app = express();

app.use(morgan("dev"));
app.use(helmet());

// NOTE: Using simplified cors() for chat brevity; use your provided corsOptions if needed.
app.use(cors()); 
app.use(express.json());

// ROUTE: Health and Readiness Checks (connects to /health and /ready)
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
    // Service Unavailable/Not Ready (HTTP 503)
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