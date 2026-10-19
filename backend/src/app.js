import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import healthRouter from "./api/health.js";
import api from "./api/index.js";
import { checkDbConnection } from "./db/index.js";
import { env } from "./env.js";
import * as middlewares from "./middlewares.js";

const app = express();

app.use(morgan("dev"));
app.use(helmet());

const allowedOrigins = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : env.NODE_ENV === "production"
    ? []
    : [
        "http://localhost",
        "http://localhost:80",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);

app.use(express.json());

app.use("/health", healthRouter);

app.get("/ready", async (_req, res) => {
  const isDbReady = await checkDbConnection();

  if (isDbReady) {
    res.status(200).json({
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.status(503).json({
    status: "not ready",
    database: "disconnected",
    error: "Database connection failed. Service is not ready.",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (_req, res) => {
  res.json({
    message: "TeamBoard API",
  });
});

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
