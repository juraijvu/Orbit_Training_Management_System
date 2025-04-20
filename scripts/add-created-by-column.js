/**
 * Migration script to add created_by column to students table
 */
import pg from 'pg';

// Create a direct connection to the database for this migration
const directPool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function addCreatedByColumn() {
  console.log('Adding created_by column to students table...');
  
  try {
    // Check if column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='students' AND column_name='created_by';
    `;
    
    const checkResult = await directPool.query(checkColumnQuery);
    
    if (checkResult.rows.length === 0) {
      // Column doesn't exist, add it
      const addColumnQuery = `
        ALTER TABLE students
        ADD COLUMN created_by INTEGER;
      `;
      
      await directPool.query(addColumnQuery);
      console.log('Successfully added created_by column to students table.');
    } else {
      console.log('created_by column already exists in students table.');
    }
  } catch (error) {
    console.error('Error adding created_by column:', error);
  } finally {
    await directPool.end();
  }
}

addCreatedByColumn();