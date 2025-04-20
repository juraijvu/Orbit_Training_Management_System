/**
 * Script to add signature and registration link fields to students table
 */
import pg from 'pg';
const { Pool } = pg;

// Get DATABASE_URL from the env directly without dotenv
const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function addSignatureFields() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if columns already exist
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      AND column_name = 'signature_data';
    `;
    const { rows } = await client.query(checkQuery);
    
    if (rows.length === 0) {
      console.log('Adding signature and registration link fields to students table...');
      
      // Add signature_data column
      await client.query(`
        ALTER TABLE students 
        ADD COLUMN signature_data TEXT,
        ADD COLUMN terms_accepted BOOLEAN DEFAULT FALSE,
        ADD COLUMN signature_date TIMESTAMP,
        ADD COLUMN register_link TEXT,
        ADD COLUMN register_link_expiry TIMESTAMP,
        ADD COLUMN register_link_discount NUMERIC DEFAULT 0;
      `);
      
      console.log('Fields added successfully!');
    } else {
      console.log('Signature fields already exist in students table.');
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding signature fields:', error);
    throw error;
  } finally {
    client.release();
  }
}

addSignatureFields()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });