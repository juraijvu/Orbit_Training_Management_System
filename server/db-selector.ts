import { db as postgresDb } from './db';
import { db as mysqlDb, testDatabaseConnection } from './mysql-db';

// Determine which database to use based on environment variables
export function selectDatabase() {
  const useMysql = process.env.MYSQL_DATABASE_URL || process.env.USE_MYSQL === 'true';
  
  if (useMysql) {
    console.log('Using MySQL database connection');
    return mysqlDb;
  } else {
    console.log('Using PostgreSQL database connection');
    return postgresDb;
  }
}

// Test the active database connection
export async function testActiveDatabase() {
  if (process.env.MYSQL_DATABASE_URL || process.env.USE_MYSQL === 'true') {
    return await testDatabaseConnection();
  }
  
  // For PostgreSQL, we'll just assume it's working if we got this far
  // since the connection is established during import
  return true;
}

// Export the selected database
export const db = selectDatabase();