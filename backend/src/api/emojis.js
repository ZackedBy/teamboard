import express from "express";

const router = express.Router();

const emojis = ["😀", "😳", "🙄"];

router.get("/", (_req, res) => {
  res.json(emojis);
});

router.get("/random", (_req, res) => {
  const randomIndex = Math.floor(Math.random() * emojis.length);
  res.json({ emoji: emojis[randomIndex] });
});

export default router;
