/**
 * Script to add the emirates field to the students table
 */
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addEmiratesField() {
  const client = await pool.connect();
  
  try {
    // Check if the column already exists
    const checkColumnQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'students' AND column_name = 'emirates';
    `;
    
    const checkResult = await client.query(checkColumnQuery);
    
    if (checkResult.rows.length === 0) {
      console.log('Adding emirates column to students table...');
      
      // Add the emirates column
      const addColumnQuery = `
        ALTER TABLE students
        ADD COLUMN emirates TEXT;
      `;
      
      await client.query(addColumnQuery);
      console.log('Successfully added emirates column to students table.');
    } else {
      console.log('Emirates column already exists in students table.');
    }
    
  } catch (error) {
    console.error('Error adding emirates column:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute the function
addEmiratesField()
  .then(() => {
    console.log('Migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });