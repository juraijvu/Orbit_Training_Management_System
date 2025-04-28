// fix-date-handling.mjs
import { config } from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config(); // Load environment variables

async function fixDateHandling() {
  console.log('Checking and fixing date handling in the database...');
  
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined in the environment variables");
    }
    
    // Connect to PostgreSQL
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL,
    });
    
    await client.connect();
    console.log('Connected to database');
    
    // Let's test creating a student record with various date formats to see which ones work
    console.log('Testing different date formats for student creation...');
    
    // Check database schema for students table
    const studentSchemaQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      ORDER BY ordinal_position;
    `;
    
    const studentSchema = await client.query(studentSchemaQuery);
    console.log('Student table schema:');
    studentSchema.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
    });
    
    // Close the connection
    await client.end();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error checking date handling:', error);
  }
}

fixDateHandling();