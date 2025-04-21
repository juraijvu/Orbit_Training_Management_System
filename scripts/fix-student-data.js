/**
 * Script to fix student data in the database
 * Populates required fields that were left empty during the import process
 */

const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Updates student records with missing data
 */
async function fixStudentData() {
  const client = await pool.connect();
  
  try {
    console.log('Starting student data fix...');
    
    // Get count of records with missing data
    const countResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM students 
      WHERE first_name IS NULL OR first_name = '' 
         OR last_name IS NULL OR last_name = ''
         OR email IS NULL OR email = ''
         OR phone_no IS NULL OR phone_no = ''
    `);
    
    const recordsToFix = parseInt(countResult.rows[0].count);
    console.log(`Found ${recordsToFix} student records with missing data.`);
    
    if (recordsToFix === 0) {
      console.log('No records need fixing.');
      return;
    }
    
    // Update records with missing data
    // We'll use the registration number to generate default values
    const updateResult = await client.query(`
      UPDATE students
      SET 
        first_name = CASE 
          WHEN first_name IS NULL OR first_name = '' 
          THEN 'Student ' || substring(registration_number from '[^/]+$')
          ELSE first_name 
        END,
        last_name = CASE 
          WHEN last_name IS NULL OR last_name = '' 
          THEN registration_number
          ELSE last_name 
        END,
        email = CASE 
          WHEN email IS NULL OR email = '' 
          THEN lower(replace(registration_number, '/', '')) || '@orbit.example.com'
          ELSE email 
        END,
        phone_no = CASE 
          WHEN phone_no IS NULL OR phone_no = '' 
          THEN '+97150' || lpad(substring(registration_number from '[^/]+$'), 7, '0')
          ELSE phone_no 
        END
      WHERE 
        first_name IS NULL OR first_name = '' 
        OR last_name IS NULL OR last_name = ''
        OR email IS NULL OR email = ''
        OR phone_no IS NULL OR phone_no = ''
      RETURNING id, registration_number, first_name, last_name, email, phone_no
    `);
    
    console.log(`Updated ${updateResult.rowCount} student records with the following data:`);
    updateResult.rows.forEach(row => {
      console.log(`- ID ${row.id} (${row.registration_number}): ${row.first_name} ${row.last_name}, ${row.email}, ${row.phone_no}`);
    });
    
    console.log('Student data fix completed successfully.');
  } catch (error) {
    console.error('Error fixing student data:', error);
  } finally {
    client.release();
  }
}

// Run the fix
fixStudentData().then(() => {
  console.log('Script execution complete.');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});