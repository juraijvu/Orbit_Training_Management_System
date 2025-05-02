// This is a temporary file to fix the issue with registration courses

import express from 'express';
import { pool } from './db';

const router = express.Router();

// Get all registration courses
router.get('/api/registration-courses', async (req, res) => {
  try {
    console.log("Fetching registration courses from database");
    
    // Direct SQL query to fetch registration courses
    const { rows } = await pool.query('SELECT * FROM registration_courses ORDER BY created_at DESC');
    
    // Map the snake_case database columns to camelCase for the API
    const registrationCourses = rows.map(row => ({
      id: row.id,
      studentId: row.student_id,
      courseId: row.course_id,
      price: row.price,
      discount: row.discount,
      createdAt: row.created_at
    }));
    
    console.log("Registration courses fetched successfully:", registrationCourses.length);
    console.log("Sample registration data:", registrationCourses.slice(0, 3));
    
    res.json(registrationCourses);
  } catch (error) {
    console.error("Error fetching registration courses:", error);
    res.status(500).json({ message: "Failed to fetch registration courses" });
  }
});

// Get registration courses by course ID
router.get('/api/registration-courses/by-course/:courseId', async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    console.log(`Fetching registration courses for course ID: ${courseId}`);
    
    // Direct SQL query to fetch registration courses for a specific course
    const { rows: courseRegistrations } = await pool.query(
      'SELECT rc.*, s.student_id as student_number, s.first_name, s.last_name, s.email, s.phone_no ' +
      'FROM registration_courses rc ' +
      'JOIN students s ON rc.student_id = s.id ' +
      'WHERE rc.course_id = $1 ' +
      'ORDER BY rc.created_at DESC',
      [courseId]
    );
    
    // Map the snake_case database columns to camelCase for the API
    const registrationCourses = courseRegistrations.map(row => ({
      id: row.id,
      studentId: row.student_id,
      courseId: row.course_id,
      price: row.price,
      discount: row.discount,
      createdAt: row.created_at,
      student: {
        id: row.student_id,
        studentId: row.student_number,
        fullName: `${row.first_name} ${row.last_name}`,
        email: row.email,
        phoneNo: row.phone_no
      }
    }));
    
    console.log(`Found ${registrationCourses.length} students registered for course ID ${courseId}`);
    
    res.json(registrationCourses);
  } catch (error) {
    console.error(`Error fetching registration courses for course ID ${req.params.courseId}:`, error);
    res.status(500).json({ message: "Failed to fetch registration courses by course ID" });
  }
});

export default router;