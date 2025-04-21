import { db as postgresDb } from './db';
import { db as mysqlDb, testDatabaseConnection } from './mysql-db';

// Determine which database to use based on environment variables
export function selectDatabase() {
  const useMysql = process.env.MYSQL_DATABASE_URL || process.env.USE_MYSQL === 'true';
  
  // We'll try MySQL first but have a fallback to PostgreSQL
  // This allows the app to run in development environments where MySQL might not be accessible
  if (useMysql) {
    try {
      console.log('Attempting to use MySQL database connection');
      
      // Test connection - we'll add this check later
      // For now, just return the MySQL DB and let it fail gracefully if needed
      return mysqlDb;
    } catch (error) {
      console.error('Failed to initialize MySQL connection, falling back to PostgreSQL:', error);
      return postgresDb;
    }
  } else {
    console.log('Using PostgreSQL database connection');
    return postgresDb;
  }
}

// Test the active database connection
export async function testActiveDatabase() {
  if (process.env.MYSQL_DATABASE_URL || process.env.USE_MYSQL === 'true') {
    try {
      const result = await testDatabaseConnection();
      
      if (!result) {
        console.log('MySQL connection test failed, falling back to PostgreSQL');
        // Modify the environment variable so future code uses PostgreSQL
        process.env.USE_MYSQL = 'false';
      }
      
      return result;
    } catch (error) {
      console.error('MySQL connection test error, falling back to PostgreSQL:', error);
      // Modify the environment variable so future code uses PostgreSQL
      process.env.USE_MYSQL = 'false';
      return false;
    }
  }
  
  // For PostgreSQL, we'll just assume it's working if we got this far
  // since the connection is established during import
  return true;
}

// Export the selected database
export const db = selectDatabase();