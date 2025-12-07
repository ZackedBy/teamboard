import express from "express";
import pool from "../database.js"; // ИСПРАВЛЕНО: путь к database.js в корне

import auth from "./auth.js";
import emojis from "./emojis.js";
// import health from "./health.js"; // УДАЛЕНО: уже подключено в app.js
import tasks from "./tasks.js";
import teams from "./teams.js";
import users from "./users.js";

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    message: "API - 窓月訣件",
  });
});

router.use("/auth", auth);
router.use("/emojis", emojis);
// router.use("/health", health); // УДАЛЕНО: избегаем дублирования /api/v1/health/health
router.use("/tasks", tasks);
router.use("/teams", teams);
router.use("/users", users);

// УДАЛЕНО: Роут /ready удален, так как он уже реализован в health.js и подключен в app.js

export default router;