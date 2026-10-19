import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    fileParallelism: false,
    hookTimeout: 30000,
    testTimeout: 20000,
    env: {
      NODE_ENV: "test",
      JWT_SECRET:
        process.env.JWT_SECRET || "test-jwt-secret-must-be-32-chars-min",
      DB_HOST: process.env.DB_HOST || "localhost",
      DB_PORT: process.env.DB_PORT || "5432",
      DB_NAME: process.env.DB_NAME || "teamboard_test",
      DB_USER: process.env.DB_USER || "postgres",
      DB_PASSWORD: process.env.DB_PASSWORD || "postgres",
    },
  },
});
