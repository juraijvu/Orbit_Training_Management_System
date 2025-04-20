// Simple script to run SQL to add created_by column to students table
import { execSync } from 'child_process';

try {
  console.log('Adding created_by column to students table...');
  
  // Execute SQL directly using the DATABASE_URL environment variable
  const result = execSync(`psql $DATABASE_URL -c "
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='students' AND column_name='created_by'
      ) THEN
        ALTER TABLE students ADD COLUMN created_by INTEGER;
      END IF;
    END $$;
  "`);
  
  console.log('Operation completed successfully');
  console.log(result.toString());
} catch (error) {
  console.error('Error executing SQL:', error.message);
}