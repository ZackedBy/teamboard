import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import api from "./api/index.js";
// Удаляем import { checkDbConnection } from "./database.js";
// ИСПРАВЛЕНО: Убираем /api/ из пути, если health.js находится рядом с app.js
import healthRouter from "./health.js"; 
import * as middlewares from "./middlewares.js";

const app = express();

app.use(morgan("dev"));
app.use(helmet());

// NOTE: Using simplified cors() for chat brevity; use your provided corsOptions if needed.
app.use(cors()); 
app.use(express.json());

// ИСПРАВЛЕНО: Подключаем роутер БЕЗ ПРЕФИКСА, чтобы роуты /health и /ready работали на корневом уровне
app.use(healthRouter); 

// УДАЛЕНА ЛОГИКА app.get("/ready", ...)

app.get("/", (_req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;