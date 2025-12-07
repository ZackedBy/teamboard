import pg from 'pg';
import { env } from './env.js';

// Connection Pool configuration using DB_ variables from env.js
const pool = new pg.Pool({
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    connectionTimeoutMillis: 5000, // 5 second connection timeout
    idleTimeoutMillis: 30000,
    max: 20,
});

/**
 * Checks the connection status of the PostgreSQL database.
 * @returns {Promise<boolean>} True if connection is successful, false otherwise.
 */
export async function checkDbConnection() {
    let client;
    try {
        // Attempt to connect to the pool to check readiness
        client = await pool.connect();
        return true;
    } catch (error) {
        if (env.NODE_ENV !== 'test') {
            console.error('Database readiness check failed:', error.message); 
        }
        return false;
    } finally {
        if (client) {
            client.release(); // Always release the connection
        }
    }
}

// Export pool for testing and main logic
export default pool;