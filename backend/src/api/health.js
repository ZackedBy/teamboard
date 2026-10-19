import express from "express";

const router = express.Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Liveness probe successful",
    timestamp: new Date().toISOString(),
  });
});

export default router;
