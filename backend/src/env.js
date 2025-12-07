import { z } from "zod"; // ИСПРАВЛЕНО: убрал /v4, обычно используется просто "zod"

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  FEATURE_RANDOM_EMOJI: z.coerce.boolean().default(true),
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
    .min(32, "JWT_SECRET must be at least 32 characters long")
    .default("your-secret-key-change-in-production"),
  ALLOWED_ORIGINS: z.string().optional(),
});

// Парсим один раз и экспортируем. Если ошибка - процесс упадет.
let parsedEnv;

try {
  // eslint-disable-next-line node/no-process-env
  parsedEnv = envSchema.parse(process.env);

  // Security check: In production, JWT_SECRET must be explicitly set
  if (
    parsedEnv.NODE_ENV === "production" &&
    parsedEnv.JWT_SECRET === "your-secret-key-change-in-production"
  ) {
    console.error(
      "❌ SECURITY ERROR: JWT_SECRET must be explicitly set in production.",
    );
    console.error(
      "   The default value 'your-secret-key-change-in-production' is not allowed.",
    );
    console.error("   Please set JWT_SECRET environment variable to a strong secret (min 32 characters).");
    process.exit(1);
  }
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(
      "Missing environment variables:",
      error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', '),
    );
  } else {
    console.error(error);
  }
  process.exit(1);
}

export const env = parsedEnv;