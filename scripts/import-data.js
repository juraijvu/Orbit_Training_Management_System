/**
 * Import data to production database
 * Upload data-export.json and run this script on your VPS
 */

import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const sql = neon(process.env.DATABASE_URL);

async function importData() {
  try {
    console.log('Importing data to production database...');
    
    // Read exported data
    const data = JSON.parse(fs.readFileSync('data-export.json', 'utf8'));
    
    console.log(`Found: ${data.students.length} students, ${data.users.length} users, ${data.courses.length} courses`);
    
    // Import students
    for (const student of data.students) {
      await sql`
        INSERT INTO students (
          student_id, first_name, last_name, email, phone, 
          date_of_birth, address, emergency_contact, course_enrolled, 
          registration_date, status, created_at
        ) VALUES (
          ${student.student_id}, ${student.first_name}, ${student.last_name}, 
          ${student.email}, ${student.phone}, ${student.date_of_birth}, 
          ${student.address}, ${student.emergency_contact}, ${student.course_enrolled}, 
          ${student.registration_date}, ${student.status}, ${student.created_at}
        ) ON CONFLICT (student_id) DO NOTHING
      `;
    }
    
    // Import users (excluding system users)
    for (const user of data.users) {
      await sql`
        INSERT INTO users (username, password, role, created_at) 
        VALUES (${user.username}, ${user.password}, ${user.role}, ${user.created_at})
        ON CONFLICT (username) DO NOTHING
      `;
    }
    
    // Import courses
    for (const course of data.courses) {
      await sql`
        INSERT INTO courses (name, description, duration, price, created_at) 
        VALUES (${course.name}, ${course.description}, ${course.duration}, ${course.price}, ${course.created_at})
        ON CONFLICT DO NOTHING
      `;
    }
    
    console.log('Data import completed successfully!');
    
  } catch (error) {
    console.error('Import failed:', error);
  }
}

importData();