import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import api from "./api/index.js";
import { checkDbConnection } from "./database.js";
import healthRouter from "./api/health.js";
import { env } from "./env.js";

import * as middlewares from "./middlewares.js";

const app = express();

app.use(morgan("dev"));
app.use(helmet());

// Configure CORS with allowed origins
const allowedOrigins = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : env.NODE_ENV === "production"
    ? []
    : ["http://localhost:80", "http://localhost:3000", "http://127.0.0.1:80"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

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