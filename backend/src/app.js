import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import api from "./api/index.js";
import healthRouter from "./health.js"; // Import the Health Check Router
import * as middlewares from "./middlewares.js";

const app = express();

app.use(morgan("dev"));
app.use(helmet());

app.use(cors()); 
app.use(express.json());

// ИСПРАВЛЕНО: Подключаем роутер БЕЗ ПРЕФИКСА. Теперь роуты /health и /ready будут доступны с корня.
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