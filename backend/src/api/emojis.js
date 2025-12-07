import express from "express";
import { env } from "../env.js";

const router = express.Router();

const emojis = ["😀", "😳", "🙄"];

router.get("/", (_req, res) => {
  res.json(emojis);
});

router.get("/random", (_req, res) => {
  //  Feature Flag Check
  if (!env.FEATURE_RANDOM_EMOJI) {
    return res.status(403).json({
      message: "Random emoji feature is currently disabled (Feature Flag).",
      code: "FEATURE_DISABLED",
    });
  }

  const randomIndex = Math.floor(Math.random() * emojis.length);
  res.json({ emoji: emojis[randomIndex] });
});

export default router;
