import app from "./app.js";
import { initializeDatabase } from "./db/schema.js";
import { env } from "./env.js";

// Retry function for database connection
async function retryDatabaseInit(maxRetries = 10, delay = 3000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await initializeDatabase();
      console.log("Database initialized successfully");
      return;
    } catch (error) {
      if (i === maxRetries - 1) {
        console.error("Failed to initialize database after retries:", error);
        process.exit(1);
      }
      console.log(
        `Database connection attempt ${i + 1} failed, retrying in ${delay}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Initialize database schema with retry logic
retryDatabaseInit().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});

const server = app.listen(env.PORT, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${env.PORT}`);
  /* eslint-enable no-console */
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${env.PORT} is already in use. Please choose another port or stop the process using it.`,
    );
  } else {
    console.error("Failed to start server:", err);
  }
  process.exit(1);
});
