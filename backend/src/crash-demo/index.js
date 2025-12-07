import express from "express";
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ App is running fine. Visit /crash to simulate failure.");
});

// Intentional crash route
app.get("/crash", (req, res) => {
  res.send("💥 Crashing now...");
  console.log("Simulating crash...");
  setTimeout(() => process.exit(1), 500); // exit with code 1
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
