/**
 * Export development data from Replit database
 * Run this in Replit to export your current data
 */

import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const sql = neon(process.env.DATABASE_URL);

async function exportData() {
  try {
    console.log('Exporting data from Replit database...');
    
    // Export students
    const students = await sql`SELECT * FROM students`;
    
    // Export users (excluding system users)
    const users = await sql`SELECT * FROM users WHERE id > 2`;
    
    // Export courses
    const courses = await sql`SELECT * FROM courses`;
    
    // Export other data as needed
    const exportData = {
      students,
      users,
      courses,
      exportDate: new Date().toISOString()
    };
    
    // Write to file
    fs.writeFileSync('data-export.json', JSON.stringify(exportData, null, 2));
    
    console.log('Data exported to data-export.json');
    console.log(`Exported: ${students.length} students, ${users.length} users, ${courses.length} courses`);
    
  } catch (error) {
    console.error('Export failed:', error);
  }
}

exportData();