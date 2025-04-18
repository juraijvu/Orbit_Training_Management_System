import { pool } from "./db";

async function createSessionTable() {
  try {
    console.log("Creating session table if it doesn't exist...");
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          sid VARCHAR NOT NULL PRIMARY KEY,
          sess JSON NOT NULL,
          expire TIMESTAMP(6) NOT NULL
        );
      `);
      console.log("Session table created or already exists.");
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating session table:", error);
  }
}

// Export to be used in index.ts
export default createSessionTable;