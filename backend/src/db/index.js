import pg from "pg";
import { env } from "../env.js";

const { Pool } = pg;

const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err);
});

export const query = (text, params) => pool.query(text, params);

export async function checkDbConnection() {
  let client;
  try {
    client = await pool.connect();
    await client.query("SELECT 1");
    return true;
  } catch (error) {
    if (env.NODE_ENV !== "test") {
      console.error("Database readiness check failed:", error.message);
    }
    return false;
  } finally {
    client?.release();
  }
}

export default pool;
