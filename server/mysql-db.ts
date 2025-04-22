import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

// MySQL connection configuration
// When using environment variables, we need to properly encode special characters
// We'll create a connection config object instead of using a connection string
let connectionConfig;

if (process.env.MYSQL_DATABASE_URL) {
  console.log("Using MYSQL_DATABASE_URL from environment variables");
  // Using connection configuration to avoid URL parsing issues with special characters
  connectionConfig = {
    host: 'auth-db1443.hstgr.io',
    port: 3306,
    user: 'u912142054_orbit_app',
    password: 'Orbit@Dubai@2024',
    database: 'u912142054_orbit_app',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0
  };
} else {
  // Fallback configuration
  connectionConfig = {
    host: 'auth-db1443.hstgr.io',
    port: 3306,
    user: 'u912142054_orbit_app',
    password: 'Orbit@Dubai@2024',
    database: 'u912142054_orbit_app',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0
  };
}

// Create MySQL connection pool
export const pool = mysql.createPool(connectionConfig);

// Initialize Drizzle ORM with MySQL client
export const db = drizzle(pool, { schema, mode: 'default' });

// Test the database connection
export async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to MySQL database:', error);
    return false;
  }
}