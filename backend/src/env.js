import { z } from "zod";

const INSECURE_JWT_SECRETS = new Set([
  "your-secret-key-change-in-production",
  "your-super-secret-jwt-key-change-in-production",
  "change-me-to-a-random-string-of-32-plus-characters",
]);

if (process.env.VITEST) {
  process.env.NODE_ENV = "test";
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "test-jwt-secret-must-be-32-chars-min";
  }
  if (!process.env.DB_NAME) {
    process.env.DB_NAME = "teamboard_test";
  }
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().default("teamboard"),
  DB_USER: z.string().default("postgres"),
  DB_PASSWORD: z.string().default("postgres"),
  POSTGRES_DB: z.string().optional(),
  POSTGRES_USER: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),
  ALLOWED_ORIGINS: z.string().optional(),
});

let parsedEnv;

try {
  parsedEnv = envSchema.parse(process.env);

  if (
    parsedEnv.NODE_ENV === "production" &&
    INSECURE_JWT_SECRETS.has(parsedEnv.JWT_SECRET)
  ) {
    console.error(
      "JWT_SECRET is a published placeholder. Set a unique secret before production.",
    );
    process.exit(1);
  }
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(
      "Invalid environment variables:",
      error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", "),
    );
  } else {
    console.error(error);
  }
  process.exit(1);
}

export const env = parsedEnv;
