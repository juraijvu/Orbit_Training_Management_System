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

export default router;