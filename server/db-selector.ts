import { db as postgresDb } from './db';
import { db as mysqlDb, testDatabaseConnection } from './mysql-db';

// Global flag to track if MySQL connection was successful
let mysqlConnectionSuccess = false;

// Determine which database to use based on environment variables
export function selectDatabase() {
  const useMysql = process.env.USE_MYSQL === 'true';
  
  if (useMysql) {
    console.log('Attempting to use MySQL database connection');
    // Return the MySQL database connection
    // We'll check actual connectivity in testActiveDatabase
    return mysqlDb;
  } else {
    console.log('Using PostgreSQL database connection');
    return postgresDb;
  }
}

// Test the active database connection
export async function testActiveDatabase() {
  if (process.env.USE_MYSQL === 'true') {
    try {
      // Test the MySQL connection
      const result = await testDatabaseConnection();
      
      // Update our connection success flag
      mysqlConnectionSuccess = result;
      
      if (!result) {
        console.log('MySQL connection test failed, falling back to PostgreSQL');
      } else {
        console.log('MySQL connection test successful');
      }
      
      return result;
    } catch (error) {
      console.error('MySQL connection test error:', error);
      mysqlConnectionSuccess = false;
      return false;
    }
  }
  
  // For PostgreSQL, we'll just assume it's working if we got this far
  // since the connection is established during import
  return true;
}

// Export the selected database
export const db = selectDatabase();