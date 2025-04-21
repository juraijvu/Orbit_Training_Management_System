import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

// MySQL connection configuration
const CONNECTION_STRING = process.env.MYSQL_DATABASE_URL || 'mysql://u912142054_orbit_app:Orbit%40Dubai%402024@auth-db1443.hstgr.io:3306/u912142054_orbit_app';

// Create MySQL connection pool
export const pool = mysql.createPool(CONNECTION_STRING);

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