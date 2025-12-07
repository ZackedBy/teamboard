import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import api from "./api/index.js";
// Убрали лишние импорты
import healthRouter from "./health.js"; // Import the Health Check Router
import * as middlewares from "./middlewares.js";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors()); 
app.use(express.json());

// ИСПРАВЛЕНИЕ: Используем healthRouter БЕЗ ПРЕФИКСА.
// Теперь роуты из health.js будут доступны прямо с корня (/health, /ready).
app.use(healthRouter); 

// УДАЛЕНА ЛОГИКА /ready из app.js, так как она теперь в health.js

app.get("/", (_req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;