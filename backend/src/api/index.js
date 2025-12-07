import express from "express";

import auth from "./auth.js";
import emojis from "./emojis.js";
import tasks from "./tasks.js";
import teams from "./teams.js";
import users from "./users.js";

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/auth", auth);
router.use("/emojis", emojis);
router.use("/tasks", tasks);
router.use("/teams", teams);
router.use("/users", users);

export default router;
