import { pool as pgPool } from "./db";
import { pool as mysqlPool } from "./mysql-db";

async function createSessionTable() {
  try {
    console.log("Creating session table if it doesn't exist...");
    
    if (process.env.USE_MYSQL === 'true') {
      // MySQL session table creation
      try {
        const connection = await mysqlPool.getConnection();
        try {
          await connection.query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
              sid VARCHAR(255) NOT NULL PRIMARY KEY,
              sess JSON NOT NULL,
              expire TIMESTAMP(6) NOT NULL
            );
          `);
          console.log("MySQL session table created or already exists.");
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error("Error creating MySQL session table:", error);
      }
    } else {
      // PostgreSQL session table creation
      try {
        const client = await pgPool.connect();
        try {
          await client.query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
              sid VARCHAR NOT NULL PRIMARY KEY,
              sess JSON NOT NULL,
              expire TIMESTAMP(6) NOT NULL
            );
          `);
          console.log("PostgreSQL session table created or already exists.");
        } finally {
          client.release();
        }
      } catch (error) {
        console.error("Error creating PostgreSQL session table:", error);
      }
    }
    
    console.log("Session table created or already exists.");
  } catch (error) {
    console.error("Error creating session table:", error);
  }
}

// Export to be used in index.ts
export default createSessionTable;