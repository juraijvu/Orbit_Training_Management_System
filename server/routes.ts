import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { sql } from "drizzle-orm";
import { storage } from "./storage";
import { db } from "./db";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import * as chatbot from "./chatbot";
import * as analytics from "./analytics";
import { emailNotificationService } from "./notifications";
import {
  insertStudentSchema,
  insertCourseSchema,
  insertTrainerSchema,
  insertInvoiceSchema,
  insertScheduleSchema,
  schedules,
  insertCertificateSchema,
  insertQuotationSchema,
  insertProposalSchema,
  insertUserSchema,
  insertWhatsappSettingsSchema,
  insertWhatsappTemplateSchema,
  insertWhatsappChatSchema,
  insertWhatsappMessageSchema,
  insertTitanEmailSettingsSchema,
  insertEmailTemplateSchema,
  insertEmailHistorySchema,
  insertCrmMeetingSchema,
  insertCorporateLeadSchema,
  insertCrmPostSchema,
  insertWhatsAppTemplateSchema
} from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // Set up multer for file uploads
  const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'uploads');
      
      // Create subdirectories based on file type
      let uploadSubDir;
      if (file.fieldname === 'companyProfileFile') {
        uploadSubDir = path.join(uploadDir, 'proposals');
      } else if (file.fieldname === 'emailAttachment') {
        uploadSubDir = path.join(uploadDir, 'emails');
      } else if (file.fieldname === 'crmPost') {
        uploadSubDir = path.join(uploadDir, 'crm/posts');
      } else if (file.fieldname === 'whatsappMedia') {
        uploadSubDir = path.join(uploadDir, 'whatsapp');
      } else {
        uploadSubDir = uploadDir;
      }
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }
      
      if (!fs.existsSync(uploadSubDir)) {
        fs.mkdirSync(uploadSubDir, { recursive: true });
      }
      
      cb(null, uploadSubDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename to prevent conflicts
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
  
  const upload = multer({ 
    storage: fileStorage,
    fileFilter: (req, file, cb) => {
      // Accept only PDFs for company profile
      if (file.fieldname === 'companyProfileFile' && file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF files are allowed for company profile'));
      }
      
      // For email attachments, allow common file types
      if (file.fieldname === 'emailAttachment') {
        const allowedMimeTypes = [
          'application/pdf', 
          'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'image/jpeg',
          'image/png',
          'image/gif',
          'text/plain',
          'application/zip',
          'application/x-zip-compressed'
        ];
        
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(new Error('Unsupported file type for email attachment'));
        }
      }
      
      // For CRM posts, only allow images and videos
      if (file.fieldname === 'crmPost') {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'video/mp4',
          'video/quicktime',
          'video/webm'
        ];
        
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(new Error('Only images and videos are allowed for CRM posts'));
        }
      }
      
      cb(null, true);
    },
    limits: {
      fileSize: 15 * 1024 * 1024 // 15MB limit
    }
  });
  
  setupAuth(app);

  // Middleware to check for authenticated users
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Middleware to check for admin users
  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && (req.user?.role === 'admin' || req.user?.role === 'superadmin')) {
      return next();
    }
    res.status(403).json({ message: "Forbidden - Admin access required" });
  };

  // Middleware to check for super admin users
  const isSuperAdmin = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && req.user?.role === 'superadmin') {
      return next();
    }
    res.status(403).json({ message: "Forbidden - Super Admin access required" });
  };

  // Helper function to generate IDs
  // Generate unique IDs with year-specific counters
  const counters: Record<string, Record<number, number>> = {};
  
  const generateId = (prefix: string, count: number): string => {
    const year = new Date().getFullYear();
    
    // Initialize counter for this prefix and year if it doesn't exist
    if (!counters[prefix]) {
      counters[prefix] = {};
    }
    
    if (!counters[prefix][year]) {
      counters[prefix][year] = 0;
    }
    
    // Increment the year-specific counter
    counters[prefix][year]++;
    
    // Use the counter value instead of the total count
    return `${prefix}-${year}-${counters[prefix][year].toString().padStart(3, '0')}`;
  };

  // ================== Students API ==================
  // Get all students
  app.get('/api/students', isAuthenticated, async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });
  
  // Get students by course ID
  app.get('/api/students/by-course/:courseId', isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: 'Invalid course ID' });
      }
      
      const students = await storage.getStudentsByCourseId(courseId);
      res.json(students);
    } catch (error) {
      console.error('Error fetching students by course ID:', error);
      res.status(500).json({ message: 'Failed to fetch students for this course', error: String(error) });
    }
  });
  
  // Get all registration courses
  app.get('/api/registration-courses', isAuthenticated, async (req, res) => {
    try {
      console.log('Fetching registration courses from database');
      const registrationCourses = await storage.getRegistrationCourses();
      console.log(`Registration courses fetched successfully: ${registrationCourses.length}`);
      console.log('Sample registration data:', registrationCourses.slice(0, 5));
      res.json(registrationCourses);
    } catch (error) {
      console.error('Error fetching registration courses:', error);
      res.status(500).json({ message: 'Failed to fetch registration courses' });
    }
  });
  
  // Create a new registration course
  app.post('/api/registration-courses', isAuthenticated, async (req, res) => {
    try {
      const courseData = req.body;
      const registrationCourse = await storage.createRegistrationCourse(courseData);
      res.status(201).json(registrationCourse);
    } catch (error) {
      console.error('Error creating registration course:', error);
      res.status(500).json({ message: 'Failed to create registration course' });
    }
  });
  
  // Create registration course (simplified for schedule page)
  app.post('/api/register-student-course', isAuthenticated, async (req, res) => {
    try {
      const { studentId, courseId, price } = req.body;
      
      if (!studentId || !courseId || !price) {
        return res.status(400).json({ message: 'Student ID, Course ID, and Price are required' });
      }
      
      const registrationCourse = await storage.createRegistrationCourse({
        studentId,
        courseId,
        price,
        discount: null,
      });
      
      res.status(201).json(registrationCourse);
    } catch (error) {
      console.error('Error registering student for course:', error);
      res.status(500).json({ message: 'Failed to register student for course' });
    }
  });
  
  // Seed sample student data (for development purposes)
  app.post('/api/seed/students', isSuperAdmin, async (req, res) => {
    try {
      // First, check if we already have students
      const existingStudents = await storage.getStudents();
      
      if (existingStudents.length > 0) {
        return res.json({ 
          message: `Found ${existingStudents.length} existing students, skipping student seeding`,
          seedingSkipped: true
        });
      }
      
      // Sample student data
      const sampleStudents = [
        {
          firstName: "Ahmed",
          lastName: "Al-Mansoori",
          email: "ahmed.almansoori@example.com",
          phoneNo: "+971501234567",
          alternativeNo: "+971551234567",
          dateOfBirth: "1995-03-15",
          passportNo: "A12345678",
          emiratesIdNo: "784-1995-1234567-8",
          nationality: "Emirati",
          education: "Bachelor's in Civil Engineering",
          address: "Villa 23, Al Wasl Road, Dubai",
          country: "United Arab Emirates",
          companyOrUniversityName: "Dubai Municipality",
          classType: "offline",
          studentId: "ST-2023-001",
          registrationNumber: "ORB-2023-001",
          createdAt: new Date(),
          createdBy: req.user?.id || 2 // Use authenticated user id or default to superadmin
        },
        {
          firstName: "Sara",
          lastName: "Khan",
          email: "sara.khan@example.com",
          phoneNo: "+971502345678",
          alternativeNo: null,
          dateOfBirth: "1998-07-22",
          passportNo: "B87654321",
          emiratesIdNo: "784-1998-7654321-0",
          nationality: "Pakistani",
          education: "Bachelor's in Computer Science",
          address: "Apartment 405, Al Nahda 2, Dubai",
          country: "United Arab Emirates",
          companyOrUniversityName: "Tech Solutions LLC",
          classType: "online",
          studentId: "ST-2023-002",
          registrationNumber: "ORB-2023-002",
          createdAt: new Date(),
          createdBy: req.user?.id || 2
        },
        {
          firstName: "John",
          lastName: "Smith",
          email: "john.smith@example.com",
          phoneNo: "+971503456789",
          alternativeNo: "+971553456789",
          dateOfBirth: "1990-11-10",
          passportNo: "C45678901",
          emiratesIdNo: "784-1990-4567890-1",
          nationality: "British",
          education: "Master's in Architecture",
          address: "Villa 78, Jumeirah 3, Dubai",
          country: "United Arab Emirates",
          companyOrUniversityName: "ABC Architects",
          classType: "private",
          studentId: "ST-2023-003",
          registrationNumber: "ORB-2023-003",
          createdAt: new Date(),
          createdBy: req.user?.id || 2
        }
      ];
      
      // Insert students
      const createdStudents = [];
      for (const studentData of sampleStudents) {
        const student = await storage.createStudent(studentData);
        createdStudents.push(student);
      }
      
      // Get all courses for registrations
      const courses = await storage.getCourses();
      
      if (!courses.length) {
        return res.status(400).json({ 
          message: "No courses found. Please add courses first.",
          studentsCreated: createdStudents.length,
          registrationCoursesCreated: 0,
          invoicesCreated: 0
        });
      }
      
      // Create registration courses
      const registrationCoursesData = [];
      
      // For each student, register 1-2 courses
      for (const student of createdStudents) {
        // Get 1-2 random courses
        const numberOfCourses = Math.floor(Math.random() * 2) + 1;
        const shuffledCourses = [...courses].sort(() => 0.5 - Math.random());
        const selectedCourses = shuffledCourses.slice(0, numberOfCourses);
        
        for (const course of selectedCourses) {
          // Calculate price based on class type
          let price;
          
          switch (student.classType) {
            case "online":
              price = parseFloat(course.onlineRate || course.fee);
              break;
            case "offline":
              price = parseFloat(course.offlineRate || course.fee);
              break;
            case "private":
              price = parseFloat(course.privateRate || course.fee);
              break;
            case "batch":
              price = parseFloat(course.batchRate || course.fee);
              break;
            default:
              price = parseFloat(course.fee);
          }
          
          // Apply random discount (0-15%)
          const discount = Math.floor(Math.random() * 16); // 0-15
          
          const regCourse = await storage.createRegistrationCourse({
            studentId: student.id,
            courseId: course.id,
            price: price.toString(),
            discount: discount.toString(),
            createdAt: new Date()
          });
          
          registrationCoursesData.push(regCourse);
        }
      }
      
      // Create invoices for each student
      const invoiceData = [];
      
      for (const student of createdStudents) {
        // Get registration courses for this student
        const studentCourses = registrationCoursesData.filter(c => c.studentId === student.id);
        
        if (studentCourses.length === 0) continue;
        
        // Calculate total amount
        let totalAmount = 0;
        
        for (const course of studentCourses) {
          const price = parseFloat(course.price);
          const discount = parseFloat(course.discount);
          const discountAmount = price * (discount / 100);
          totalAmount += price - discountAmount;
        }
        
        // Add VAT (5%)
        totalAmount += totalAmount * 0.05;
        
        // Generate invoice number
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(student.id).padStart(3, '0')}`;
        
        // Random payment mode
        const paymentModes = ["Cash", "Card", "Tabby", "Tamara"];
        const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];
        
        // Random status (80% paid, 20% pending)
        const status = Math.random() < 0.8 ? "paid" : "pending";
        
        // Transaction ID for card payments
        const transactionId = paymentMode === "Card" ? `TXN-${Math.floor(Math.random() * 1000000)}` : null;
        
        const invoice = await storage.createInvoice({
          invoiceNumber,
          studentId: student.id,
          amount: totalAmount.toFixed(2),
          paymentMode,
          transactionId,
          paymentDate: new Date(),
          status,
          createdAt: new Date()
        });
        
        invoiceData.push(invoice);
      }
      
      res.json({
        message: "Sample student data seeded successfully",
        studentsCreated: createdStudents.length,
        registrationCoursesCreated: registrationCoursesData.length,
        invoicesCreated: invoiceData.length
      });
    } catch (error) {
      console.error("Error seeding student data:", error);
      res.status(500).json({ message: "Failed to seed student data" });
    }
  });

  // Get student by ID
  app.get('/api/students/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const student = await storage.getStudent(id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  // Create student
  app.post('/api/students', isAuthenticated, async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      
      // Generate student ID
      const students = await storage.getStudents();
      const studentId = generateId('STU', students.length + 1);
      
      const newStudent = await storage.createStudent({ ...studentData, studentId });
      
      res.status(201).json(newStudent);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  // Update student
  app.patch('/api/students/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingStudent = await storage.getStudent(id);
      if (!existingStudent) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      const updatedStudent = await storage.updateStudent(id, req.body);
      res.json(updatedStudent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update student" });
    }
  });
  
  // ================== Registration API ==================
  // Create new registration with courses
  app.post('/api/registrations', isAuthenticated, async (req, res) => {
    try {
      const { studentData, courses } = req.body;
      
      // Generate Orbit-specific registration number with year-specific counter
      const regNumber = generateId('ORB', 0); // The count is ignored as we use year-specific counter
      
      // Calculate total fee, course fee and initial payment based on the selected courses
      const selectedCourse = courses[0]; // Use the first course for primary course_id
      const totalFee = courses.reduce((sum, course) => sum + parseFloat(course.price), 0);
      const discountAmount = courses.reduce((sum, course) => sum + (parseFloat(course.price) * (parseFloat(course.discount) / 100)), 0);
      const finalFee = totalFee - discountAmount;
      
      // Create a directly compatible object for the database
      // This is more reliable than going through the storage layer's transformation
      const fullName = `${studentData.firstName} ${studentData.lastName}`.trim();
      
      console.log("Creating student with direct SQL-compatible data. Full name:", fullName);
      
      // Get student count for generating unique IDs
      const countResult = await db.execute(sql`SELECT COUNT(*) FROM students`);
      const studentCount = parseInt(countResult.rows[0].count) + 1;
      
      // Generate unique student ID and registration number
      const currentYear = new Date().getFullYear().toString().substr(-2); // Get last 2 digits of year
      const newStudentId = `ST-${currentYear}-${studentCount.toString().padStart(4, '0')}`;
      const newRegNumber = `ORB-${currentYear}-${studentCount.toString().padStart(4, '0')}`;
      
      console.log("Generated unique student ID:", newStudentId);
      console.log("Generated registration number:", newRegNumber);
      
      // Direct SQL query to insert the student record
      const insertSql = sql`
        INSERT INTO students (
          student_id, 
          full_name, 
          father_name, 
          email, 
          phone, 
          dob, 
          gender, 
          address, 
          course_id, 
          batch, 
          registration_date, 
          course_fee, 
          total_fee, 
          discount, 
          initial_payment, 
          balance_due, 
          payment_mode, 
          payment_status, 
          created_at,
          registration_number,
          first_name,
          last_name,
          phone_no,
          date_of_birth,
          class_type,
          signature_data,
          terms_accepted,
          signature_date,
          created_by,
          passport_no,
          uid_no,
          emirates_id_no,
          nationality,
          education,
          alternative_no,
          country,
          company_or_university_name,
          emirates
        ) VALUES (
          ${newStudentId}, 
          ${fullName}, 
          ${studentData.fatherName || "Not Provided"}, 
          ${studentData.email || "No Email"}, 
          ${studentData.phoneNo || "Not Provided"}, 
          ${new Date(studentData.dateOfBirth)}, 
          ${studentData.gender || "Not Specified"}, 
          ${studentData.address || "Not Provided"}, 
          ${selectedCourse.courseId}, 
          ${"Regular"}, 
          ${new Date()}, 
          ${selectedCourse.price}, 
          ${finalFee}, 
          ${discountAmount}, 
          ${0}, 
          ${finalFee}, 
          ${"Not Set"}, 
          ${"pending"}, 
          ${new Date()},
          ${newRegNumber},
          ${studentData.firstName},
          ${studentData.lastName},
          ${studentData.phoneNo},
          ${new Date(studentData.dateOfBirth)},
          ${studentData.classType || "online"},
          ${studentData.signatureData},
          ${studentData.termsAccepted},
          ${studentData.signatureDate ? new Date(studentData.signatureDate) : new Date()},
          ${req.user?.id || null},
          ${studentData.passportNo || null},
          ${studentData.uidNo || null},
          ${studentData.emiratesIdNo || null},
          ${studentData.nationality || null},
          ${studentData.education || null},
          ${studentData.alternativeNo || null},
          ${studentData.country || null},
          ${studentData.companyOrUniversityName || null},
          ${studentData.emirates || null}
        ) RETURNING *;
      `;
      
      console.log("Running SQL insert");
      
      // Execute the SQL query
      const result = await db.execute(insertSql);
      const student = result.rows[0];

      console.log("Student created successfully:", student.id);
      
      // Create registration courses
      const registrationCourses = [];
      for (const course of courses) {
        const registrationCourse = await storage.createRegistrationCourse({
          studentId: student.id,
          courseId: course.courseId,
          price: course.price,
          discount: course.discount || 0
        });
        registrationCourses.push(registrationCourse);
      }
      
      res.status(201).json({ 
        student, 
        registrationCourses,
        message: "Registration created successfully"
      });
    } catch (error) {
      console.error("Error creating registration:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create registration" });
    }
  });
  
  // Get registration courses for a student
  app.get('/api/registrations/:studentId/courses', isAuthenticated, async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const registrationCourses = await storage.getRegistrationCourses(studentId);
      
      // Get course details for each registration
      const coursesWithDetails = await Promise.all(
        registrationCourses.map(async (rc) => {
          const course = await storage.getCourse(rc.courseId);
          return {
            ...rc,
            course
          };
        })
      );
      
      res.json(coursesWithDetails);
    } catch (error) {
      console.error("Error fetching registration courses:", error);
      res.status(500).json({ message: "Failed to fetch registration courses" });
    }
  });
  
  // Get printable registration details
  app.get('/api/registrations/:studentId/print', isAuthenticated, async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const student = await storage.getStudent(studentId);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      const registrationCourses = await storage.getRegistrationCourses(studentId);
      
      // Get course details for each registration
      const coursesWithDetails = await Promise.all(
        registrationCourses.map(async (rc) => {
          const course = await storage.getCourse(rc.courseId);
          return {
            ...rc,
            course
          };
        })
      );
      
      res.json({
        student,
        registrationCourses: coursesWithDetails
      });
    } catch (error) {
      console.error("Error fetching registration details:", error);
      res.status(500).json({ message: "Failed to fetch registration details" });
    }
  });
  
  // Delete registration course
  app.delete('/api/registrations/courses/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteRegistrationCourse(id);
      if (!success) {
        return res.status(404).json({ message: "Registration course not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting registration course:", error);
      res.status(500).json({ message: "Failed to delete registration course" });
    }
  });
  
  // Generate registration link for a student
  app.post('/api/registrations/:studentId/generate-link', isAuthenticated, async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const { expiryDays, discountPercentage, courseId } = req.body;
      
      // Validate that student exists
      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      // Validate that course exists if provided
      let course = null;
      if (courseId) {
        course = await storage.getCourse(courseId);
        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }
      }
      
      // Generate a unique token
      const token = crypto.randomUUID().replace(/-/g, '');
      
      // Set expiry date (default to 7 days if not specified)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (expiryDays || 7));
      
      // Update student with the registration link information
      const updatedStudent = await storage.updateStudent(studentId, {
        registerLink: token,
        registerLinkExpiry: expiryDate,
        registerLinkDiscount: discountPercentage || 0,
        registerLinkCourseId: courseId || null
      });
      
      // Generate full URL for the registration link
      const registrationUrl = `${req.protocol}://${req.get('host')}/register/${token}`;
      
      res.json({
        registrationUrl,
        expiryDate,
        discountPercentage: discountPercentage || 0,
        courseId: courseId || null,
        courseName: course ? course.name : null
      });
    } catch (error) {
      console.error("Error generating registration link:", error);
      res.status(500).json({ message: "Failed to generate registration link" });
    }
  });
  
  // Get registration link details (public endpoint)
  app.get('/api/register/:token', async (req, res) => {
    try {
      const { token } = req.params;
      
      // Find student with this registration link
      const student = await storage.getStudentByRegisterLink(token);
      if (!student) {
        return res.status(404).json({ message: "Invalid registration link" });
      }
      
      // Check if link is expired
      if (student.registerLinkExpiry && new Date(student.registerLinkExpiry) < new Date()) {
        return res.status(400).json({ 
          message: "Registration link expired",
          expired: true
        });
      }
      
      // Get associated course if any
      let course = null;
      if (student.registerLinkCourseId) {
        course = await storage.getCourse(student.registerLinkCourseId);
      }
      
      res.json({
        studentId: student.id,
        expiryDate: student.registerLinkExpiry,
        discountPercentage: student.registerLinkDiscount || 0,
        course: course
      });
    } catch (error) {
      console.error("Error fetching registration link details:", error);
      res.status(500).json({ message: "Failed to fetch registration link details" });
    }
  });
  
  // Submit registration via public link
  app.post('/api/register/:token/submit', async (req, res) => {
    try {
      const { token } = req.params;
      const registrationData = req.body;
      
      // Find student with this registration link
      const existingStudent = await storage.getStudentByRegisterLink(token);
      if (!existingStudent) {
        return res.status(404).json({ message: "Invalid registration link" });
      }
      
      // Check if link is expired
      if (existingStudent.registerLinkExpiry && new Date(existingStudent.registerLinkExpiry) < new Date()) {
        return res.status(400).json({ 
          message: "Registration link expired",
          expired: true
        });
      }
      
      // Create a new student record with the registration data
      const studentData = {
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        phoneNo: registrationData.phoneNo,
        alternativeNo: registrationData.alternativeNo || null,
        dateOfBirth: registrationData.dateOfBirth,
        passportNo: registrationData.passportNo || null,
        emiratesIdNo: registrationData.emiratesIdNo || null,
        emirates: registrationData.emirates || null,
        nationality: registrationData.nationality,
        education: registrationData.education || null,
        address: registrationData.address || null,
        country: registrationData.country || null,
        companyOrUniversityName: registrationData.companyOrUniversityName || null,
        classType: registrationData.classType,
        signatureData: registrationData.signatureData,
        signatureDate: registrationData.signatureDate,
        termsAccepted: registrationData.termsAccepted
      };
      
      // Get student count for generating unique IDs
      const countResult = await db.execute(sql`SELECT COUNT(*) FROM students`);
      const studentCount = parseInt(countResult.rows[0].count) + 1;
      
      // Generate unique student ID and registration number
      const currentYear = new Date().getFullYear().toString().substr(-2); // Get last 2 digits of year
      const newStudentId = `ST-${currentYear}-${studentCount.toString().padStart(4, '0')}`;
      const newRegNumber = `ORB-${currentYear}-${studentCount.toString().padStart(4, '0')}`;
      
      console.log("Generated unique student ID:", newStudentId);
      console.log("Generated registration number:", newRegNumber);
      
      // Create the new student
      const newStudent = await storage.createStudent({
        ...studentData,
        studentId,
        registrationNumber: regNumber,
        createdAt: new Date()
      });
      
      // If course was linked to the registration link, create registration course
      let invoice = null;
      if (existingStudent.registerLinkCourseId) {
        const course = await storage.getCourse(existingStudent.registerLinkCourseId);
        
        if (course) {
          // Calculate price based on class type
          let price;
          
          switch (registrationData.classType) {
            case "online":
              price = parseFloat(course.onlineRate || course.fee);
              break;
            case "offline":
              price = parseFloat(course.offlineRate || course.fee);
              break;
            case "private":
              price = parseFloat(course.privateRate || course.fee);
              break;
            case "batch":
              price = parseFloat(course.batchRate || course.fee);
              break;
            default:
              price = parseFloat(course.fee);
          }
          
          // Apply discount if set in registration link
          const discount = existingStudent.registerLinkDiscount || 0;
          
          // Create registration course
          await storage.createRegistrationCourse({
            studentId: newStudent.id,
            courseId: course.id,
            price: price.toString(),
            discount: discount.toString()
          });
          
          // Create invoice if payment method is not "cash"
          if (registrationData.paymentMethod !== "cash") {
            // Generate invoice number
            const invoices = await storage.getInvoices();
            const invoiceNumber = `INV-${new Date().getFullYear()}-${(invoices.length + 1).toString().padStart(3, '0')}`;
            
            // Calculate amount after discount
            const discountAmount = price * (discount / 100);
            const finalAmount = price - discountAmount;
            
            // Create invoice
            invoice = await storage.createInvoice({
              studentId: newStudent.id,
              invoiceNumber,
              amount: finalAmount.toString(),
              status: "pending",
              paymentMode: registrationData.paymentMethod,
              paymentDate: null,
              transactionId: null
            });
          }
        }
      }
      
      // Invalidate the registration link by removing token from the existing student
      await storage.updateStudent(existingStudent.id, {
        registerLink: null,
        registerLinkExpiry: null,
        registerLinkDiscount: null,
        registerLinkCourseId: null
      });
      
      // Generate payment URL if needed
      let paymentUrl = null;
      if (invoice && registrationData.paymentMethod !== "cash") {
        // TODO: Implement payment gateway integration here
        // For now, just use a stub URL
        paymentUrl = `/payment/${invoice.id}`;
      }
      
      res.status(201).json({
        student: newStudent,
        paymentUrl
      });
    } catch (error) {
      console.error("Error submitting registration:", error);
      res.status(500).json({ message: "Failed to submit registration" });
    }
  });

  // ================== Courses API ==================
  // Get all courses
  app.get('/api/courses', isAuthenticated, async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get course by ID
  app.get('/api/courses/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Create course
  app.post('/api/courses', isAdmin, async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const newCourse = await storage.createCourse(courseData);
      res.status(201).json(newCourse);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // Update course
  app.patch('/api/courses/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingCourse = await storage.getCourse(id);
      if (!existingCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const updatedCourse = await storage.updateCourse(id, req.body);
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  // Delete course
  app.delete('/api/courses/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingCourse = await storage.getCourse(id);
      if (!existingCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const result = await storage.deleteCourse(id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete course" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // ================== Trainers API ==================
  // Get all trainers
  app.get('/api/trainers', isAuthenticated, async (req, res) => {
    try {
      const trainers = await storage.getTrainers();
      res.json(trainers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trainers" });
    }
  });

  // Get trainer by ID
  app.get('/api/trainers/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const trainer = await storage.getTrainer(id);
      if (!trainer) {
        return res.status(404).json({ message: "Trainer not found" });
      }
      res.json(trainer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trainer" });
    }
  });

  // Create trainer
  app.post('/api/trainers', isAdmin, async (req, res) => {
    try {
      const trainerData = insertTrainerSchema.parse(req.body);
      const newTrainer = await storage.createTrainer(trainerData);
      res.status(201).json(newTrainer);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create trainer" });
    }
  });

  // Update trainer
  app.patch('/api/trainers/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingTrainer = await storage.getTrainer(id);
      if (!existingTrainer) {
        return res.status(404).json({ message: "Trainer not found" });
      }
      
      const updatedTrainer = await storage.updateTrainer(id, req.body);
      res.json(updatedTrainer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update trainer" });
    }
  });

  // Delete trainer
  app.delete('/api/trainers/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingTrainer = await storage.getTrainer(id);
      if (!existingTrainer) {
        return res.status(404).json({ message: "Trainer not found" });
      }
      
      const result = await storage.deleteTrainer(id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete trainer" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete trainer" });
    }
  });

  // ================== Invoices API ==================
  // Get all invoices
  app.get('/api/invoices', isAuthenticated, async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Get invoices by student ID
  app.get('/api/students/:id/invoices', isAuthenticated, async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);
      const invoices = await storage.getInvoicesByStudentId(studentId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Get invoice by ID
  app.get('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  // Create invoice
  app.post('/api/invoices', isAuthenticated, async (req, res) => {
    try {
      // Skip validation altogether and handle the data directly
      const { studentId, amount, paymentMode, transactionId, paymentDate, status } = req.body;
      
      // Generate invoice number
      const invoices = await storage.getInvoices();
      const invoiceNumber = generateId('INV', invoices.length + 1);
      
      // Manually prepare the invoice data with proper types
      const invoiceData = {
        invoiceNumber,
        studentId: Number(studentId),
        amount: String(amount),
        paymentMode,
        transactionId: transactionId || null,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        status
      };
      
      // Directly create the invoice without schema validation
      const newInvoice = await storage.createInvoice(invoiceData);
      
      // Send email notification about the new invoice
      try {
        const student = await storage.getStudent(newInvoice.studentId);
        if (student) {
          const course = await storage.getCourse(student.courseId);
          if (course) {
            await emailNotificationService.sendInvoiceCreationNotice(
              newInvoice, 
              student, 
              course.name
            );
          }
        }
      } catch (notificationError) {
        console.error("Failed to send invoice notification:", notificationError);
        // Continue with the response even if the notification fails
      }
      
      res.status(201).json(newInvoice);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });
  
  // Update invoice
  app.patch('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingInvoice = await storage.getInvoice(id);
      if (!existingInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const updatedInvoice = await storage.updateInvoice(id, req.body);
      
      // Send payment receipt notification when invoice is marked as paid
      if (req.body.status === 'paid' && existingInvoice.status !== 'paid' && updatedInvoice) {
        try {
          const student = await storage.getStudent(updatedInvoice.studentId);
          if (student) {
            const course = await storage.getCourse(student.courseId);
            if (course) {
              await emailNotificationService.sendPaymentReceiptNotice(
                updatedInvoice,
                student,
                course.name
              );
            }
          }
        } catch (notificationError) {
          console.error("Failed to send payment receipt notification:", notificationError);
          // Continue with the response even if the notification fails
        }
      }
      
      res.json(updatedInvoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  // ================== Schedules API ==================
  // Get all schedules
  app.get('/api/schedules', isAuthenticated, async (req, res) => {
    try {
      const schedules = await storage.getSchedules();
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  // Get schedule by ID
  app.get('/api/schedules/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schedule = await storage.getSchedule(id);
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch schedule" });
    }
  });

  // Create schedule
  app.post('/api/schedules', isAuthenticated, async (req, res) => {
    try {
      console.log('Received schedule data:', req.body);
      
      // COMPLETELY BYPASS ALL VALIDATION, including Zod
      // Directly access the request body data
      const data = req.body;
      
      try {
        // Create the schedule object with Date objects where needed
        const scheduleValues = {
          title: data.title,
          courseId: Number(data.courseId),
          trainerId: Number(data.trainerId),
          studentIds: data.studentIds,
          sessionType: data.sessionType || 'batch',
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          duration: Number(data.duration),
          occurrenceDays: data.occurrenceDays || 'mon',
          status: data.status || 'confirmed',
          createdBy: req.user!.id,
          createdAt: new Date()
        };
        
        // Log the processed values
        console.log('Processed schedule values for direct insert:', scheduleValues);
        
        // IMPORTANT: Skip ALL validation and insert directly without using any schemas
        const result = await db.insert(schedules).values(scheduleValues).returning();
        const newSchedule = result[0];
      
        // Send email notification about the new schedule
        try {
          // Get associated course
          const course = await storage.getCourse(newSchedule.courseId);
          if (course) {
            // Get trainer info
            const trainer = await storage.getTrainer(newSchedule.trainerId);
            // Get students enrolled in this course
            const students = await storage.getStudentsByCourseId(course.id);
            
            if (students && students.length > 0 && trainer) {
              await emailNotificationService.sendScheduleCreationNotice(
                newSchedule,
                students,
                course.name,
                trainer.fullName
              );
            }
          }
        } catch (notificationError) {
          console.error("Failed to send schedule notification:", notificationError);
          // Continue with the response even if the notification fails
        }
        
        res.status(201).json(newSchedule);
      } catch (innerError) {
        console.error("Error processing schedule data:", innerError);
        return res.status(400).json({ 
          message: "Failed to process schedule data. Please check your input values.",
          details: innerError.message 
        });
      }
    } catch (error) {
      console.error("Unexpected error creating schedule:", error);
      res.status(500).json({ message: "Failed to create schedule" });
    }
  });

  // Update schedule
  app.patch('/api/schedules/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingSchedule = await storage.getSchedule(id);
      if (!existingSchedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      const updatedSchedule = await storage.updateSchedule(id, req.body);
      
      // Check if important schedule details have changed (time, date, title)
      const timeChanged = req.body.startTime || req.body.endTime;
      const detailsChanged = req.body.title || req.body.description || timeChanged;
      
      // If details changed, send update notification
      if (detailsChanged && updatedSchedule) {
        try {
          // Get associated course
          const course = await storage.getCourse(updatedSchedule.courseId);
          if (course) {
            // Get trainer info
            const trainer = await storage.getTrainer(updatedSchedule.trainerId);
            // Get students enrolled in this course
            const students = await storage.getStudentsByCourseId(course.id);
            
            if (students && students.length > 0 && trainer) {
              await emailNotificationService.sendScheduleUpdateNotice(
                updatedSchedule,
                students,
                course.name,
                trainer.fullName
              );
            }
          }
        } catch (notificationError) {
          console.error("Failed to send schedule update notification:", notificationError);
          // Continue with the response even if the notification fails
        }
      }
      
      res.json(updatedSchedule);
    } catch (error) {
      res.status(500).json({ message: "Failed to update schedule" });
    }
  });

  // Delete schedule
  app.delete('/api/schedules/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingSchedule = await storage.getSchedule(id);
      if (!existingSchedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      // Send cancellation notification before deleting the schedule
      try {
        // Get associated course
        const course = await storage.getCourse(existingSchedule.courseId);
        if (course) {
          // Get trainer info
          const trainer = await storage.getTrainer(existingSchedule.trainerId);
          // Get students enrolled in this course
          const students = await storage.getStudentsByCourseId(course.id);
          
          if (students && students.length > 0 && trainer) {
            await emailNotificationService.sendScheduleCancellationNotice(
              existingSchedule,
              students,
              course.name,
              trainer.fullName
            );
          }
        }
      } catch (notificationError) {
        console.error("Failed to send schedule cancellation notification:", notificationError);
        // Continue with the deletion even if the notification fails
      }
      
      const result = await storage.deleteSchedule(id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete schedule" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete schedule" });
    }
  });

  // ================== Certificates API ==================
  // Get all certificates
  app.get('/api/certificates', isAuthenticated, async (req, res) => {
    try {
      const certificates = await storage.getCertificates();
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  // Get certificates by student ID
  app.get('/api/students/:id/certificates', isAuthenticated, async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);
      const certificates = await storage.getCertificatesByStudentId(studentId);
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  // Get certificate by ID
  app.get('/api/certificates/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const certificate = await storage.getCertificate(id);
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      res.json(certificate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certificate" });
    }
  });

  // Create certificate
  app.post('/api/certificates', isSuperAdmin, async (req, res) => {
    try {
      // Handle date conversion before validation
      let data = { ...req.body };
      
      // Convert issueDate string to proper Date object if it's a string
      if (data.issueDate && typeof data.issueDate === 'string') {
        try {
          data.issueDate = new Date(data.issueDate);
        } catch (e) {
          console.error("Failed to parse date:", e);
          return res.status(400).json({ message: "Invalid date format for issueDate" });
        }
      }
      
      // Make sure issuedBy comes from authenticated user
      data.issuedBy = req.user!.id;
      
      // Now validate
      console.log("Validating certificate data:", data);
      const certificateData = insertCertificateSchema.parse(data);
      
      // Generate certificate number
      const certificates = await storage.getCertificates();
      const certificateNumber = generateId('CERT', certificates.length + 1);
      
      const newCertificate = await storage.createCertificate({ ...certificateData, certificateNumber });
      console.log("Certificate created successfully:", newCertificate);
      res.status(201).json(newCertificate);
    } catch (error) {
      console.error("Certificate creation error:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create certificate" });
    }
  });

  // ================== Quotations API ==================
  // Get all quotations
  app.get('/api/quotations', isAuthenticated, async (req, res) => {
    try {
      const quotations = await storage.getQuotations();
      res.json(quotations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotations" });
    }
  });

  // Get quotation by ID with its items
  app.get('/api/quotations/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quotation = await storage.getQuotation(id);
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      
      // Get quotation items
      const items = await storage.getQuotationItems(id);
      
      // Return quotation with items
      res.json({
        ...quotation,
        items
      });
    } catch (error) {
      console.error("Failed to fetch quotation:", error);
      res.status(500).json({ message: "Failed to fetch quotation" });
    }
  });

  // Create quotation with items
  app.post('/api/quotations', isAuthenticated, async (req, res) => {
    try {
      const { quotation, items } = req.body;
      
      // Validate quotation data
      const quotationData = insertQuotationSchema.parse({
        ...quotation,
        createdBy: req.user!.id
      });
      
      // Generate quotation number
      const quotations = await storage.getQuotations();
      const quotationNumber = generateId('QUOT', quotations.length + 1);
      
      // Create quotation
      const newQuotation = await storage.createQuotation({ ...quotationData, quotationNumber });
      
      // Create quotation items
      if (Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          const itemData = insertQuotationItemSchema.parse({
            ...item,
            quotationId: newQuotation.id
          });
          await storage.createQuotationItem(itemData);
        }
      }
      
      // Get complete quotation with items
      const createdQuotation = await storage.getQuotation(newQuotation.id);
      const quotationItems = await storage.getQuotationItems(newQuotation.id);
      
      res.status(201).json({
        ...createdQuotation,
        items: quotationItems
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Failed to create quotation:", error);
      res.status(500).json({ message: "Failed to create quotation" });
    }
  });

  // Update quotation
  app.patch('/api/quotations/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quotation, items } = req.body;
      
      // Check if quotation exists
      const existingQuotation = await storage.getQuotation(id);
      if (!existingQuotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      
      // Update quotation
      const updatedQuotation = await storage.updateQuotation(id, quotation);
      
      // Update quotation items if provided
      if (Array.isArray(items)) {
        // Get existing items
        const existingItems = await storage.getQuotationItems(id);
        
        // Delete items that aren't in the new list
        const newItemIds = items.filter(item => item.id).map(item => item.id);
        for (const existingItem of existingItems) {
          if (!newItemIds.includes(existingItem.id)) {
            await storage.deleteQuotationItem(existingItem.id);
          }
        }
        
        // Update or create items
        for (const item of items) {
          if (item.id) {
            // Update existing item
            await storage.updateQuotationItem(item.id, item);
          } else {
            // Create new item
            const itemData = insertQuotationItemSchema.parse({
              ...item,
              quotationId: id
            });
            await storage.createQuotationItem(itemData);
          }
        }
      }
      
      // Get updated quotation with items
      const finalQuotation = await storage.getQuotation(id);
      const quotationItems = await storage.getQuotationItems(id);
      
      res.json({
        ...finalQuotation,
        items: quotationItems
      });
    } catch (error) {
      console.error("Failed to update quotation:", error);
      res.status(500).json({ message: "Failed to update quotation" });
    }
  });

  // Get quotation items for a specific quotation
  app.get('/api/quotations/:id/items', isAuthenticated, async (req, res) => {
    try {
      const quotationId = parseInt(req.params.id);
      const quotation = await storage.getQuotation(quotationId);
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      
      const items = await storage.getQuotationItems(quotationId);
      res.json(items);
    } catch (error) {
      console.error("Failed to fetch quotation items:", error);
      res.status(500).json({ message: "Failed to fetch quotation items" });
    }
  });
  
  // Create a new item for a specific quotation
  app.post('/api/quotations/:id/items', isAuthenticated, async (req, res) => {
    try {
      const quotationId = parseInt(req.params.id);
      const quotation = await storage.getQuotation(quotationId);
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      
      const itemData = insertQuotationItemSchema.parse({
        ...req.body,
        quotationId
      });
      
      const newItem = await storage.createQuotationItem(itemData);
      res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Failed to create quotation item:", error);
      res.status(500).json({ message: "Failed to create quotation item" });
    }
  });
  
  // Update a specific quotation item
  app.patch('/api/quotation-items/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getQuotationItem(id);
      if (!item) {
        return res.status(404).json({ message: "Quotation item not found" });
      }
      
      const updatedItem = await storage.updateQuotationItem(id, req.body);
      res.json(updatedItem);
    } catch (error) {
      console.error("Failed to update quotation item:", error);
      res.status(500).json({ message: "Failed to update quotation item" });
    }
  });
  
  // Delete a specific quotation item
  app.delete('/api/quotation-items/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getQuotationItem(id);
      if (!item) {
        return res.status(404).json({ message: "Quotation item not found" });
      }
      
      await storage.deleteQuotationItem(id);
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete quotation item:", error);
      res.status(500).json({ message: "Failed to delete quotation item" });
    }
  });
  
  // ================== Proposals API ==================
  // Get all proposals
  app.get('/api/proposals', isAuthenticated, async (req, res) => {
    try {
      const proposals = await storage.getProposals();
      res.json(proposals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  // Get proposal by ID
  app.get('/api/proposals/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const proposal = await storage.getProposal(id);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      res.json(proposal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proposal" });
    }
  });

  // Create proposal
  app.post('/api/proposals', isAuthenticated, async (req, res) => {
    try {
      const proposalData = insertProposalSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      // Generate proposal number
      const proposals = await storage.getProposals();
      const proposalNumber = generateId('PROP', proposals.length + 1);
      
      const newProposal = await storage.createProposal({ ...proposalData, proposalNumber });
      res.status(201).json(newProposal);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create proposal" });
    }
  });

  // Update proposal
  app.patch('/api/proposals/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingProposal = await storage.getProposal(id);
      if (!existingProposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      
      const updatedProposal = await storage.updateProposal(id, req.body);
      res.json(updatedProposal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update proposal" });
    }
  });

  // Upload company profile for a proposal
  app.post('/api/proposals/:id/upload-company-profile', isAuthenticated, upload.single('companyProfileFile'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingProposal = await storage.getProposal(id);
      
      if (!existingProposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Get file information
      const file = req.file;
      const companyProfile = `/uploads/proposals/${file.filename}`;
      const companyProfileFileSize = file.size;
      const companyProfileFileType = file.mimetype;
      
      // Update the proposal with the file information
      const updatedProposal = await storage.updateProposal(id, {
        companyProfile,
        companyProfileFilename: file.filename,
        companyProfileMimeType: file.mimetype
      });
      
      res.json(updatedProposal);
    } catch (error) {
      console.error('Error uploading company profile:', error);
      res.status(500).json({ message: "Failed to upload company profile" });
    }
  });

  // ================== Dashboard API ==================
  // Get dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const students = await storage.getStudents();
      const courses = await storage.getCourses();
      const activeCourses = courses.filter(course => course.active);
      const invoices = await storage.getInvoices();
      const certificates = await storage.getCertificates();
      const trainers = await storage.getTrainers();
      
      // Get today's date (start and end)
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      // Calculate total revenue
      const revenue = invoices.reduce((total, invoice) => total + Number(invoice.amount), 0);
      
      // Calculate today's collection (payments made today)
      const todayInvoices = invoices.filter(invoice => {
        if (!invoice.paymentDate) return false;
        const paymentDate = new Date(invoice.paymentDate);
        return paymentDate >= startOfDay && paymentDate <= endOfDay;
      });
      const todayCollection = todayInvoices.reduce((total, invoice) => total + Number(invoice.amount), 0);
      
      // Calculate pending fees (students with balance due and today as due date)
      const studentsWithDuePayments = students.filter(student => 
        student.balanceDue && Number(student.balanceDue) > 0 && 
        student.registrationDate && 
        new Date(student.registrationDate).toDateString() === today.toDateString()
      );
      const pendingFees = studentsWithDuePayments.reduce((total, student) => total + Number(student.balanceDue), 0);
      
      // Calculate trainer revenue (mock calculation - in real app this would be more complex)
      const trainerRevenue = trainers.reduce((total, trainer, index) => {
        // Simple mock calculation for demo
        return total + 10000 + (index * 5000);
      }, 0);
      
      res.json({
        totalStudents: students.length,
        activeCourses: activeCourses.length,
        revenue,
        certificates: certificates.length,
        todayCollection,
        pendingFees,
        trainerRevenue
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Get recent activities
  app.get('/api/dashboard/activities', isAuthenticated, async (req, res) => {
    try {
      const students = await storage.getStudents();
      const invoices = await storage.getInvoices();
      const schedules = await storage.getSchedules();
      const certificates = await storage.getCertificates();
      
      // Combine and sort all activities by date
      const activities = [
        ...students.map(student => ({
          id: `student-${student.id}`,
          type: 'registration' as const,
          message: 'New student registered',
          detail: `${student.fullName} - Course ID: ${student.courseId}`,
          timestamp: student.createdAt
        })),
        ...invoices.map(invoice => ({
          id: `invoice-${invoice.id}`,
          type: 'invoice' as const,
          message: 'Invoice generated',
          detail: `${invoice.invoiceNumber} - Amount: AED ${invoice.amount}`,
          timestamp: invoice.createdAt
        })),
        ...schedules.map(schedule => ({
          id: `schedule-${schedule.id}`,
          type: 'schedule' as const,
          message: 'Schedule updated',
          detail: `${schedule.title}`,
          timestamp: schedule.createdAt
        })),
        ...certificates.map(certificate => ({
          id: `certificate-${certificate.id}`,
          type: 'certificate' as const,
          message: 'Certificate issued',
          detail: `${certificate.certificateNumber} - Student ID: ${certificate.studentId}`,
          timestamp: certificate.createdAt
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Get only the 10 most recent activities
      
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent activities" });
    }
  });

  // Get upcoming schedules
  app.get('/api/dashboard/schedules', isAuthenticated, async (req, res) => {
    try {
      const schedules = await storage.getSchedules();
      const courses = await storage.getCourses();
      const trainers = await storage.getTrainers();
      
      // Get upcoming schedules
      const now = new Date();
      const upcomingSchedules = schedules
        .filter(schedule => new Date(schedule.startTime) > now)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 5) // Get only the 5 nearest upcoming schedules
        .map(schedule => {
          const course = courses.find(c => c.id === schedule.courseId);
          const trainer = trainers.find(t => t.id === schedule.trainerId);
          
          return {
            id: schedule.id,
            title: schedule.title,
            courseName: course?.name || 'Unknown Course',
            trainerName: trainer?.fullName || 'Unknown Trainer',
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            status: schedule.status
          };
        });
      
      res.json(upcomingSchedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming schedules" });
    }
  });
  
  // Get students with due payments today
  app.get('/api/dashboard/due-payments', isAuthenticated, async (req, res) => {
    try {
      const students = await storage.getStudents();
      const courses = await storage.getCourses();
      
      // Get today's date
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      // Find students with due payments today
      const studentsWithDuePayments = students
        .filter(student => {
          // Check if student has balance due
          if (!student.balanceDue || Number(student.balanceDue) <= 0) return false;
          
          // Check if due date is today
          // In a real app, we'd have a specific dueDate field - here we're using registration date as a proxy
          if (!student.registrationDate) return false;
          
          const dueDate = new Date(student.registrationDate);
          return dueDate >= startOfDay && dueDate <= endOfDay;
        })
        .map(student => {
          const course = courses.find(c => c.id === student.courseId);
          
          return {
            id: student.id,
            name: student.fullName,
            course: course?.name || 'Unknown Course',
            balanceDue: Number(student.balanceDue),
            dueDate: new Date(student.registrationDate).toLocaleDateString(),
            phone: student.phone
          };
        });
      
      res.json(studentsWithDuePayments);
    } catch (error) {
      console.error("Error fetching due payments:", error);
      res.status(500).json({ message: "Failed to fetch due payments" });
    }
  });

  // ================== Users API ==================
  // Get all users (admin only)
  app.get('/api/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Get user by ID
  app.get('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove sensitive information when sending response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Create user (admin only)
  app.post('/api/users', isAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Update user (admin only)
  app.patch('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If not admin and not updating yourself, reject
      const isOwnProfile = id === req.user?.id;
      const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
      
      if (!isOwnProfile && !isAdmin) {
        return res.status(403).json({ message: "You can only update your own profile" });
      }
      
      // Non-admins can only update certain fields
      let updateData = req.body;
      
      if (!isAdmin) {
        // Regular users can only update their profile info, not role or other sensitive fields
        const { fullName, email, phone } = req.body;
        updateData = { fullName, email, phone };
      } else {
        // Prevent role escalation - only superadmin can create superadmins
        if (req.body.role === 'superadmin' && req.user?.role !== 'superadmin') {
          return res.status(403).json({ message: "Only superadmins can create or modify superadmin accounts" });
        }
        
        // Prevent updating your own role
        if (isOwnProfile && req.body.role) {
          return res.status(403).json({ message: "You cannot modify your own role" });
        }
      }
      
      const updatedUser = await storage.updateUser(id, updateData);
      
      // If the current user is updating their own profile, update the session
      if (isOwnProfile) {
        // Remove password from session data
        const { password, ...userWithoutPassword } = updatedUser;
        req.login(updatedUser, (err) => {
          if (err) {
            console.error("Failed to update session:", err);
          }
        });
      }
      
      // Remove sensitive information when sending response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("User update error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Change password (users can only change their own password)
  app.post('/api/users/:id/change-password', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Only allow users to change their own password unless they are an admin/superadmin
      if (id !== req.user?.id && req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
        return res.status(403).json({ message: "You can only change your own password" });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      // Get the user
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update the user's password
      const updatedUser = await storage.updateUser(id, { password: hashedPassword });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }
      
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Delete user (superadmin only)
  app.delete('/api/users/:id', isSuperAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Prevent deleting yourself
      if (id === req.user?.id) {
        return res.status(403).json({ message: "You cannot delete your own account" });
      }
      
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const result = await storage.deleteUser(id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete user" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // ================== Institute Settings API ==================
  // Get institute settings
  app.get('/api/institute', isAuthenticated, async (req, res) => {
    try {
      const institute = await storage.getInstitute();
      res.json(institute);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch institute settings" });
    }
  });

  // Update institute settings (admin only)
  app.patch('/api/institute', isAdmin, async (req, res) => {
    try {
      const updatedInstitute = await storage.updateInstitute(req.body);
      res.json(updatedInstitute);
    } catch (error) {
      res.status(500).json({ message: "Failed to update institute settings" });
    }
  });

  // ================== CRM - Leads API ==================
  // Get all leads
  app.get('/api/crm/leads', isAuthenticated, async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  // Get lead by ID
  app.get('/api/crm/leads/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  // Create lead
  app.post('/api/crm/leads', isAuthenticated, async (req, res) => {
    try {
      const newLead = await storage.createLead({
        ...req.body,
        createdBy: req.user!.id
      });
      res.status(201).json(newLead);
    } catch (error) {
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  // Update lead
  app.patch('/api/crm/leads/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingLead = await storage.getLead(id);
      if (!existingLead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      const updatedLead = await storage.updateLead(id, req.body);
      res.json(updatedLead);
    } catch (error) {
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  // Delete lead
  app.delete('/api/crm/leads/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingLead = await storage.getLead(id);
      if (!existingLead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      const result = await storage.deleteLead(id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete lead" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });
  
  // ================== CRM - Corporate Leads API ==================
  // Get all corporate leads
  app.get('/api/crm/corporate-leads', isAuthenticated, async (req, res) => {
    try {
      const leads = await storage.getCorporateLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch corporate leads" });
    }
  });

  // Get corporate leads by consultant
  app.get('/api/crm/corporate-leads/consultant/:consultantId', isAuthenticated, async (req, res) => {
    try {
      const consultantId = parseInt(req.params.consultantId);
      const leads = await storage.getCorporateLeadsByConsultant(consultantId);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch corporate leads" });
    }
  });

  // Get corporate leads by status
  app.get('/api/crm/corporate-leads/status/:status', isAuthenticated, async (req, res) => {
    try {
      const status = req.params.status;
      const leads = await storage.getCorporateLeadsByStatus(status);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch corporate leads" });
    }
  });

  // Get corporate leads by priority
  app.get('/api/crm/corporate-leads/priority/:priority', isAuthenticated, async (req, res) => {
    try {
      const priority = req.params.priority;
      const leads = await storage.getCorporateLeadsByPriority(priority);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch corporate leads" });
    }
  });

  // Get corporate lead by ID
  app.get('/api/crm/corporate-leads/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getCorporateLead(id);
      if (!lead) {
        return res.status(404).json({ message: "Corporate lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch corporate lead" });
    }
  });

  // Create corporate lead
  app.post('/api/crm/corporate-leads', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCorporateLeadSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      const newLead = await storage.createCorporateLead(validatedData);
      res.status(201).json(newLead);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to create corporate lead" });
    }
  });

  // Update corporate lead
  app.patch('/api/crm/corporate-leads/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingLead = await storage.getCorporateLead(id);
      if (!existingLead) {
        return res.status(404).json({ message: "Corporate lead not found" });
      }
      
      const updateData = {
        ...req.body,
        updatedBy: req.user!.id
      };
      
      const updatedLead = await storage.updateCorporateLead(id, updateData);
      res.json(updatedLead);
    } catch (error) {
      res.status(500).json({ message: "Failed to update corporate lead" });
    }
  });

  // Delete corporate lead
  app.delete('/api/crm/corporate-leads/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingLead = await storage.getCorporateLead(id);
      if (!existingLead) {
        return res.status(404).json({ message: "Corporate lead not found" });
      }
      
      const result = await storage.deleteCorporateLead(id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete corporate lead" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete corporate lead" });
    }
  });

  // ================== CRM - Campaigns API ==================
  // Get all campaigns
  app.get('/api/crm/campaigns', isAuthenticated, async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  // Get campaign by ID
  app.get('/api/crm/campaigns/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  // Create campaign
  app.post('/api/crm/campaigns', isAdmin, async (req, res) => {
    try {
      const newCampaign = await storage.createCampaign({
        ...req.body,
        createdBy: req.user!.id
      });
      res.status(201).json(newCampaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  // Update campaign
  app.patch('/api/crm/campaigns/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingCampaign = await storage.getCampaign(id);
      if (!existingCampaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const updatedCampaign = await storage.updateCampaign(id, req.body);
      res.json(updatedCampaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  // Delete campaign
  app.delete('/api/crm/campaigns/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingCampaign = await storage.getCampaign(id);
      if (!existingCampaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const result = await storage.deleteCampaign(id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete campaign" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });
  
  // ================== CRM - Meetings API ==================
  // Get all meetings
  app.get('/api/crm/meetings', isAuthenticated, async (req, res) => {
    try {
      const meetings = await storage.getCrmMeetings();
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  // Get meetings by assigned user
  app.get('/api/crm/meetings/assigned/:userId', isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const meetings = await storage.getCrmMeetingsByAssignedTo(userId);
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  // Get meetings for a specific date
  app.get('/api/crm/meetings/date/:date', isAuthenticated, async (req, res) => {
    try {
      const date = new Date(req.params.date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      const meetings = await storage.getCrmMeetingsByDate(date);
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  // Get meetings by status
  app.get('/api/crm/meetings/status/:status', isAuthenticated, async (req, res) => {
    try {
      const status = req.params.status;
      const meetings = await storage.getCrmMeetingsByStatus(status);
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  // Get meetings by lead
  app.get('/api/crm/meetings/lead/:leadId', isAuthenticated, async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId);
      const meetings = await storage.getCrmMeetingsByLeadId(leadId);
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  // Get meetings by corporate lead
  app.get('/api/crm/meetings/corporate/:corporateLeadId', isAuthenticated, async (req, res) => {
    try {
      const corporateLeadId = parseInt(req.params.corporateLeadId);
      const meetings = await storage.getCrmMeetingsByCorporateLeadId(corporateLeadId);
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  // Get meeting by ID
  app.get('/api/crm/meetings/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const meeting = await storage.getCrmMeeting(id);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meeting" });
    }
  });

  // Create meeting
  app.post('/api/crm/meetings', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCrmMeetingSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      const newMeeting = await storage.createCrmMeeting(validatedData);
      
      // If WhatsApp notification is enabled, send notification
      if (req.body.sendNotification) {
        try {
          // Find the WhatsApp template
          const template = req.body.notificationTemplateId 
            ? await storage.getWhatsAppTemplate(req.body.notificationTemplateId)
            : null;
          
          if (template) {
            let recipientNumber = '';
            
            // Determine recipient phone number
            if (newMeeting.leadId) {
              const lead = await storage.getLead(newMeeting.leadId);
              recipientNumber = lead?.whatsappNumber || '';
            } else if (newMeeting.corporateLeadId) {
              const corporateLead = await storage.getCorporateLead(newMeeting.corporateLeadId);
              recipientNumber = corporateLead?.contactPhone || '';
            }
            
            if (recipientNumber) {
              // Create WhatsApp chat message for notification
              await storage.createWhatsAppChat({
                phoneNumber: recipientNumber,
                direction: 'outgoing',
                content: template.content,
                messageType: 'text',
                status: 'sent',
                templateId: template.id,
                meetingId: newMeeting.id,
                leadId: newMeeting.leadId,
                corporateLeadId: newMeeting.corporateLeadId,
                sentBy: req.user!.id
              });
              
              // Mark notification as sent
              await storage.markMeetingNotificationSent(newMeeting.id);
            }
          }
        } catch (notificationError) {
          console.error('Failed to send meeting notification:', notificationError);
          // Continue with meeting creation even if notification fails
        }
      }
      
      res.status(201).json(newMeeting);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  // Update meeting
  app.patch('/api/crm/meetings/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingMeeting = await storage.getCrmMeeting(id);
      if (!existingMeeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      // Add updatedBy field
      const updateData = {
        ...req.body,
        updatedBy: req.user!.id
      };
      
      const updatedMeeting = await storage.updateCrmMeeting(id, updateData);
      res.json(updatedMeeting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update meeting" });
    }
  });

  // Delete meeting
  app.delete('/api/crm/meetings/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingMeeting = await storage.getCrmMeeting(id);
      if (!existingMeeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      // Check if user is admin or the meeting creator/assignee
      if (req.user!.role !== 'admin' && req.user!.role !== 'superadmin' && 
          req.user!.id !== existingMeeting.createdBy && req.user!.id !== existingMeeting.assignedTo) {
        return res.status(403).json({ message: "You don't have permission to delete this meeting" });
      }
      
      const result = await storage.deleteCrmMeeting(id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete meeting" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete meeting" });
    }
  });

  // ================== CRM - Follow-ups API ==================
  // Get all follow-ups
  app.get('/api/crm/follow-ups', isAuthenticated, async (req, res) => {
    try {
      const followUps = await storage.getFollowUps();
      
      // Enrich follow-ups with lead information
      const enrichedFollowUps = await Promise.all(followUps.map(async (followUp) => {
        const lead = await storage.getLead(followUp.leadId);
        return {
          ...followUp,
          leadName: lead ? lead.fullName : 'Unknown',
          leadPhone: lead ? lead.phone : 'Unknown'
        };
      }));
      
      res.json(enrichedFollowUps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch follow-ups" });
    }
  });

  // Get follow-ups by lead ID
  app.get('/api/crm/follow-ups/lead/:leadId', isAuthenticated, async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId);
      const followUps = await storage.getFollowUpsByLeadId(leadId);
      res.json(followUps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch follow-ups" });
    }
  });

  // Get follow-up by ID
  app.get('/api/crm/follow-ups/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const followUp = await storage.getFollowUp(id);
      if (!followUp) {
        return res.status(404).json({ message: "Follow-up not found" });
      }
      res.json(followUp);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch follow-up" });
    }
  });

  // Create follow-up
  app.post('/api/crm/follow-ups', isAuthenticated, async (req, res) => {
    try {
      const newFollowUp = await storage.createFollowUp({
        ...req.body,
        createdBy: req.user!.id
      });
      res.status(201).json(newFollowUp);
    } catch (error) {
      res.status(500).json({ message: "Failed to create follow-up" });
    }
  });

  // Update follow-up
  app.patch('/api/crm/follow-ups/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingFollowUp = await storage.getFollowUp(id);
      if (!existingFollowUp) {
        return res.status(404).json({ message: "Follow-up not found" });
      }
      
      const updatedFollowUp = await storage.updateFollowUp(id, req.body);
      res.json(updatedFollowUp);
    } catch (error) {
      res.status(500).json({ message: "Failed to update follow-up" });
    }
  });

  // Delete follow-up
  app.delete('/api/crm/follow-ups/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingFollowUp = await storage.getFollowUp(id);
      if (!existingFollowUp) {
        return res.status(404).json({ message: "Follow-up not found" });
      }
      
      const result = await storage.deleteFollowUp(id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete follow-up" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete follow-up" });
    }
  });

  // ================== WhatsApp API ==================
  // Get WhatsApp API settings
  app.get('/api/whatsapp/settings', isAdmin, async (req, res) => {
    try {
      const settings = await storage.getWhatsappSettings();
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch WhatsApp settings" });
    }
  });

  // Save WhatsApp API settings
  app.post('/api/whatsapp/settings', isAdmin, async (req, res) => {
    try {
      const settingsData = insertWhatsappSettingsSchema.parse(req.body);
      const settings = await storage.getWhatsappSettings();
      
      if (settings) {
        // Update existing settings
        const updatedSettings = await storage.updateWhatsappSettings(settings.id, settingsData);
        res.json(updatedSettings);
      } else {
        // Create new settings
        const newSettings = await storage.createWhatsappSettings(settingsData);
        res.status(201).json(newSettings);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to save WhatsApp settings" });
    }
  });

  // Get WhatsApp templates
  app.get('/api/whatsapp/templates', isAuthenticated, async (req, res) => {
    try {
      const templates = await storage.getWhatsappTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch WhatsApp templates" });
    }
  });

  // Get WhatsApp template by ID
  app.get('/api/whatsapp/templates/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getWhatsappTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // Create WhatsApp template
  app.post('/api/whatsapp/templates', isAuthenticated, async (req, res) => {
    try {
      const templateData = insertWhatsappTemplateSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      const newTemplate = await storage.createWhatsappTemplate(templateData);
      res.status(201).json(newTemplate);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  // Update WhatsApp template
  app.patch('/api/whatsapp/templates/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingTemplate = await storage.getWhatsappTemplate(id);
      if (!existingTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      const updatedTemplate = await storage.updateWhatsappTemplate(id, req.body);
      res.json(updatedTemplate);
    } catch (error) {
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  // Delete WhatsApp template
  app.delete('/api/whatsapp/templates/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingTemplate = await storage.getWhatsappTemplate(id);
      if (!existingTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      const result = await storage.deleteWhatsappTemplate(id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete template" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete template" });
    }
  });
  
  // ================== CRM - Today's Posts API ==================
  // Configure multer for CRM post image uploads
  const crmPostStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads', 'crm-posts');
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
  
  const crmPostUpload = multer({
    storage: crmPostStorage,
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
        'video/mp4', 'video/webm', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word docs
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation' // PowerPoint
      ];
      
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Only images, videos, PDFs, and Office documents are allowed for CRM posts'));
      }
      
      cb(null, true);
    },
    limits: {
      fileSize: 25 * 1024 * 1024 // 25MB limit
    }
  });
  
  // Get all CRM posts
  app.get('/api/crm/posts', isAuthenticated, async (req, res) => {
    try {
      const posts = await storage.getCrmPosts();
      
      // Enrich with creator information
      const enrichedPosts = await Promise.all(posts.map(async (post) => {
        const creator = await storage.getUser(post.createdBy);
        return {
          ...post,
          creatorName: creator ? creator.fullName : 'Unknown'
        };
      }));
      
      res.json(enrichedPosts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch CRM posts" });
    }
  });

  // Get CRM posts by category
  app.get('/api/crm/posts/category/:category', isAuthenticated, async (req, res) => {
    try {
      const category = req.params.category;
      const posts = await storage.getCrmPostsByCategory(category);
      
      // Enrich with creator information
      const enrichedPosts = await Promise.all(posts.map(async (post) => {
        const creator = await storage.getUser(post.createdBy);
        return {
          ...post,
          creatorName: creator ? creator.fullName : 'Unknown'
        };
      }));
      
      res.json(enrichedPosts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch CRM posts" });
    }
  });

  // Get CRM posts by creator
  app.get('/api/crm/posts/creator/:userId', isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const posts = await storage.getCrmPostsByCreator(userId);
      
      // Get creator information once
      const creator = await storage.getUser(userId);
      
      // Enrich all posts with the same creator info
      const enrichedPosts = posts.map(post => ({
        ...post,
        creatorName: creator ? creator.fullName : 'Unknown'
      }));
      
      res.json(enrichedPosts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch CRM posts" });
    }
  });

  // Get CRM posts by tags
  app.get('/api/crm/posts/tags', isAuthenticated, async (req, res) => {
    try {
      const tags = req.query.tags as string;
      if (!tags) {
        return res.status(400).json({ message: "Tags parameter is required" });
      }
      
      const tagArray = tags.split(',').map(tag => tag.trim());
      const posts = await storage.getCrmPostsByTags(tagArray);
      
      // Enrich with creator information
      const enrichedPosts = await Promise.all(posts.map(async (post) => {
        const creator = await storage.getUser(post.createdBy);
        return {
          ...post,
          creatorName: creator ? creator.fullName : 'Unknown'
        };
      }));
      
      res.json(enrichedPosts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch CRM posts" });
    }
  });

  // Get CRM post by ID
  app.get('/api/crm/posts/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getCrmPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Track view
      await storage.incrementCrmPostViewCount(id);
      
      // Get creator information
      const creator = await storage.getUser(post.createdBy);
      
      res.json({
        ...post,
        creatorName: creator ? creator.fullName : 'Unknown'
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Create CRM post with file upload
  app.post('/api/crm/posts', isAuthenticated, crmPostUpload.single('file'), async (req, res) => {
    try {
      // Handle file upload
      const filePath = req.file ? `/uploads/crm-posts/${req.file.filename}` : null;
      
      // Parse tags if present
      let tags: string[] = [];
      if (req.body.tags) {
        tags = req.body.tags.split(',').map((tag: string) => tag.trim());
      }
      
      // Create post with file path
      const postData = {
        ...req.body,
        filePath,
        tags,
        createdBy: req.user!.id
      };
      
      const validatedData = insertCrmPostSchema.parse(postData);
      const newPost = await storage.createCrmPost(validatedData);
      
      res.status(201).json(newPost);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Update CRM post
  app.patch('/api/crm/posts/:id', isAuthenticated, crmPostUpload.single('file'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingPost = await storage.getCrmPost(id);
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user is admin/superadmin or post creator
      if (req.user!.role !== 'admin' && req.user!.role !== 'superadmin' && 
          req.user!.id !== existingPost.createdBy) {
        return res.status(403).json({ message: "You don't have permission to update this post" });
      }
      
      // Handle file upload
      let filePath = existingPost.filePath;
      if (req.file) {
        filePath = `/uploads/crm-posts/${req.file.filename}`;
        
        // Delete old file if it exists
        if (existingPost.filePath) {
          const oldFilePath = path.join(process.cwd(), existingPost.filePath.replace(/^\//, ''));
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
      }
      
      // Parse tags if present
      let tags = existingPost.tags || [];
      if (req.body.tags) {
        tags = req.body.tags.split(',').map((tag: string) => tag.trim());
      }
      
      // Update post
      const updateData = {
        ...req.body,
        filePath,
        tags,
        updatedBy: req.user!.id
      };
      
      const updatedPost = await storage.updateCrmPost(id, updateData);
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  // Delete CRM post
  app.delete('/api/crm/posts/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingPost = await storage.getCrmPost(id);
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user is admin/superadmin or post creator
      if (req.user!.role !== 'admin' && req.user!.role !== 'superadmin' && 
          req.user!.id !== existingPost.createdBy) {
        return res.status(403).json({ message: "You don't have permission to delete this post" });
      }
      
      // Delete file if it exists
      if (existingPost.filePath) {
        const filePath = path.join(process.cwd(), existingPost.filePath.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      const result = await storage.deleteCrmPost(id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete post" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Download CRM post file
  app.get('/api/crm/posts/:id/download', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getCrmPost(id);
      if (!post || !post.filePath) {
        return res.status(404).json({ message: "Post file not found" });
      }
      
      // Track download
      await storage.incrementCrmPostDownloadCount(id);
      
      // Get file path
      const filePath = path.join(process.cwd(), post.filePath.replace(/^\//, ''));
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      
      // Send file for download
      res.download(filePath);
    } catch (error) {
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  // Share CRM post (track share count)
  app.post('/api/crm/posts/:id/share', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getCrmPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Track share
      const updatedPost = await storage.incrementCrmPostShareCount(id);
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Failed to track share" });
    }
  });

  // Approve CRM post (admin only)
  app.post('/api/crm/posts/:id/approve', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getCrmPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Approve post
      const updatedPost = await storage.approveCrmPost(id, req.user!.id);
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve post" });
    }
  });

  // Get WhatsApp chats
  app.get('/api/whatsapp/chats', isAuthenticated, async (req, res) => {
    try {
      const chats = await storage.getWhatsappChats();
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch WhatsApp chats" });
    }
  });

  // Get WhatsApp chats by consultant ID
  app.get('/api/whatsapp/chats/consultant/:consultantId', isAuthenticated, async (req, res) => {
    try {
      const consultantId = parseInt(req.params.consultantId);
      const chats = await storage.getWhatsappChatsByConsultantId(consultantId);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch WhatsApp chats" });
    }
  });

  // Get WhatsApp chat by ID
  app.get('/api/whatsapp/chats/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const chat = await storage.getWhatsappChat(id);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat" });
    }
  });

  // Create WhatsApp chat
  app.post('/api/whatsapp/chats', isAuthenticated, async (req, res) => {
    try {
      const chatData = insertWhatsappChatSchema.parse(req.body);
      const newChat = await storage.createWhatsappChat(chatData);
      res.status(201).json(newChat);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create chat" });
    }
  });

  // Assign WhatsApp chat to consultant
  app.put('/api/whatsapp/chats/:id/assign', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { consultantId } = req.body;
      
      const existingChat = await storage.getWhatsappChat(id);
      if (!existingChat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      
      const updatedChat = await storage.updateWhatsappChat(id, { 
        consultantId: parseInt(consultantId),
        unreadCount: 0
      });
      
      res.json(updatedChat);
    } catch (error) {
      res.status(500).json({ message: "Failed to assign chat" });
    }
  });

  // Get WhatsApp messages for a chat
  app.get('/api/whatsapp/messages/:chatId', isAuthenticated, async (req, res) => {
    try {
      const chatId = parseInt(req.params.chatId);
      const messages = await storage.getWhatsappMessagesByChatId(chatId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send WhatsApp message
  app.post('/api/whatsapp/messages/send', isAuthenticated, async (req, res) => {
    try {
      const { chatId, content, sentBy } = req.body;
      
      // Get WhatsApp settings to check if API is active
      const settings = await storage.getWhatsappSettings();
      if (!settings || !settings.isActive) {
        return res.status(400).json({ message: "WhatsApp API is not configured or inactive" });
      }
      
      // Create message record
      const messageData = insertWhatsappMessageSchema.parse({
        chatId,
        content,
        sentBy,
        messageId: `local-${Date.now()}`, // This would be replaced by actual WhatsApp message ID in real integration
        direction: "outbound",
        status: "sent",
        timestamp: new Date()
      });
      
      const newMessage = await storage.createWhatsappMessage(messageData);
      
      // Update chat's last message time
      await storage.updateWhatsappChat(chatId, {
        lastMessageTime: new Date()
      });
      
      // In a real implementation, we would call the WhatsApp API here to send the message
      // For now, we'll simulate a successful sending
      
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // ================== End of WhatsApp API ==================

  // ================== WhatsApp Chatbot API ==================
  // Get all chatbot flows
  app.get('/api/whatsapp/chatbot/flows', isAuthenticated, async (req, res) => {
    try {
      const flows = await chatbot.getChatbotFlows();
      res.json(flows);
    } catch (error) {
      console.error("Error fetching chatbot flows:", error);
      res.status(500).json({ message: "Failed to fetch chatbot flows" });
    }
  });

  // Get chatbot flows by consultant
  app.get('/api/whatsapp/chatbot/flows/consultant/:consultantId', isAuthenticated, async (req, res) => {
    try {
      const consultantId = parseInt(req.params.consultantId);
      const flows = await chatbot.getChatbotFlowsByConsultant(consultantId);
      res.json(flows);
    } catch (error) {
      console.error("Error fetching chatbot flows for consultant:", error);
      res.status(500).json({ message: "Failed to fetch chatbot flows" });
    }
  });

  // Get chatbot flow by ID
  app.get('/api/whatsapp/chatbot/flows/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const flow = await chatbot.getChatbotFlow(id);
      if (!flow) {
        return res.status(404).json({ message: "Chatbot flow not found" });
      }
      res.json(flow);
    } catch (error) {
      console.error("Error fetching chatbot flow:", error);
      res.status(500).json({ message: "Failed to fetch chatbot flow" });
    }
  });

  // Create chatbot flow
  app.post('/api/whatsapp/chatbot/flows', isAuthenticated, async (req, res) => {
    try {
      const flowData = {
        ...req.body,
        createdBy: req.user!.id
      };
      const newFlow = await chatbot.createChatbotFlow(flowData);
      res.status(201).json(newFlow);
    } catch (error) {
      console.error("Error creating chatbot flow:", error);
      res.status(500).json({ message: "Failed to create chatbot flow" });
    }
  });

  // Update chatbot flow
  app.put('/api/whatsapp/chatbot/flows/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const flow = await chatbot.getChatbotFlow(id);
      if (!flow) {
        return res.status(404).json({ message: "Chatbot flow not found" });
      }
      
      // Check if user is either the creator or an admin
      if (flow.createdBy !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'superadmin') {
        return res.status(403).json({ message: "You don't have permission to edit this flow" });
      }
      
      const updatedFlow = await chatbot.updateChatbotFlow(id, req.body);
      res.json(updatedFlow);
    } catch (error) {
      console.error("Error updating chatbot flow:", error);
      res.status(500).json({ message: "Failed to update chatbot flow" });
    }
  });

  // Delete chatbot flow
  app.delete('/api/whatsapp/chatbot/flows/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const flow = await chatbot.getChatbotFlow(id);
      if (!flow) {
        return res.status(404).json({ message: "Chatbot flow not found" });
      }
      
      // Check if user is either the creator or an admin
      if (flow.createdBy !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'superadmin') {
        return res.status(403).json({ message: "You don't have permission to delete this flow" });
      }
      
      const result = await chatbot.deleteChatbotFlow(id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete chatbot flow" });
      }
    } catch (error) {
      console.error("Error deleting chatbot flow:", error);
      res.status(500).json({ message: "Failed to delete chatbot flow" });
    }
  });

  // Get all chatbot nodes for a flow
  app.get('/api/whatsapp/chatbot/flows/:flowId/nodes', isAuthenticated, async (req, res) => {
    try {
      const flowId = parseInt(req.params.flowId);
      const nodes = await chatbot.getChatbotNodes(flowId);
      res.json(nodes);
    } catch (error) {
      console.error("Error fetching chatbot nodes:", error);
      res.status(500).json({ message: "Failed to fetch chatbot nodes" });
    }
  });

  // Get chatbot node by ID
  app.get('/api/whatsapp/chatbot/nodes/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const node = await chatbot.getChatbotNode(id);
      if (!node) {
        return res.status(404).json({ message: "Chatbot node not found" });
      }
      res.json(node);
    } catch (error) {
      console.error("Error fetching chatbot node:", error);
      res.status(500).json({ message: "Failed to fetch chatbot node" });
    }
  });

  // Create chatbot node
  app.post('/api/whatsapp/chatbot/nodes', isAuthenticated, async (req, res) => {
    try {
      const nodeData = req.body;
      
      // Check if user has permission to modify this flow
      const flow = await chatbot.getChatbotFlow(nodeData.flowId);
      if (!flow) {
        return res.status(404).json({ message: "Chatbot flow not found" });
      }
      
      if (flow.createdBy !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'superadmin') {
        return res.status(403).json({ message: "You don't have permission to modify this flow" });
      }
      
      const newNode = await chatbot.createChatbotNode(nodeData);
      res.status(201).json(newNode);
    } catch (error) {
      console.error("Error creating chatbot node:", error);
      res.status(500).json({ message: "Failed to create chatbot node" });
    }
  });

  // Update chatbot node
  app.put('/api/whatsapp/chatbot/nodes/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const node = await chatbot.getChatbotNode(id);
      if (!node) {
        return res.status(404).json({ message: "Chatbot node not found" });
      }
      
      // Check if user has permission to modify this node's flow
      const flow = await chatbot.getChatbotFlow(node.flowId);
      if (!flow) {
        return res.status(404).json({ message: "Chatbot flow not found" });
      }
      
      if (flow.createdBy !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'superadmin') {
        return res.status(403).json({ message: "You don't have permission to modify this node" });
      }
      
      const updatedNode = await chatbot.updateChatbotNode(id, req.body);
      res.json(updatedNode);
    } catch (error) {
      console.error("Error updating chatbot node:", error);
      res.status(500).json({ message: "Failed to update chatbot node" });
    }
  });

  // Delete chatbot node
  app.delete('/api/whatsapp/chatbot/nodes/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const node = await chatbot.getChatbotNode(id);
      if (!node) {
        return res.status(404).json({ message: "Chatbot node not found" });
      }
      
      // Check if user has permission to modify this node's flow
      const flow = await chatbot.getChatbotFlow(node.flowId);
      if (!flow) {
        return res.status(404).json({ message: "Chatbot flow not found" });
      }
      
      if (flow.createdBy !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'superadmin') {
        return res.status(403).json({ message: "You don't have permission to delete this node" });
      }
      
      const result = await chatbot.deleteChatbotNode(id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete chatbot node" });
      }
    } catch (error) {
      console.error("Error deleting chatbot node:", error);
      res.status(500).json({ message: "Failed to delete chatbot node" });
    }
  });
  
  // Get conditions for a node
  app.get('/api/whatsapp/chatbot/nodes/:nodeId/conditions', isAuthenticated, async (req, res) => {
    try {
      const nodeId = parseInt(req.params.nodeId);
      const conditions = await chatbot.getChatbotConditionsByNode(nodeId);
      res.json(conditions);
    } catch (error) {
      console.error("Error fetching chatbot conditions:", error);
      res.status(500).json({ message: "Failed to fetch chatbot conditions" });
    }
  });

  // Create condition for a node
  app.post('/api/whatsapp/chatbot/conditions', isAuthenticated, async (req, res) => {
    try {
      const conditionData = req.body;
      
      // Check if user has permission to modify this node's flow
      const node = await chatbot.getChatbotNode(conditionData.nodeId);
      if (!node) {
        return res.status(404).json({ message: "Chatbot node not found" });
      }
      
      const flow = await chatbot.getChatbotFlow(node.flowId);
      if (!flow) {
        return res.status(404).json({ message: "Chatbot flow not found" });
      }
      
      if (flow.createdBy !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'superadmin') {
        return res.status(403).json({ message: "You don't have permission to modify this flow" });
      }
      
      const newCondition = await chatbot.createChatbotCondition(conditionData);
      res.status(201).json(newCondition);
    } catch (error) {
      console.error("Error creating chatbot condition:", error);
      res.status(500).json({ message: "Failed to create chatbot condition" });
    }
  });

  // Update condition
  app.put('/api/whatsapp/chatbot/conditions/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedCondition = await chatbot.updateChatbotCondition(id, req.body);
      if (!updatedCondition) {
        return res.status(404).json({ message: "Chatbot condition not found" });
      }
      res.json(updatedCondition);
    } catch (error) {
      console.error("Error updating chatbot condition:", error);
      res.status(500).json({ message: "Failed to update chatbot condition" });
    }
  });

  // Delete condition
  app.delete('/api/whatsapp/chatbot/conditions/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await chatbot.deleteChatbotCondition(id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete chatbot condition" });
      }
    } catch (error) {
      console.error("Error deleting chatbot condition:", error);
      res.status(500).json({ message: "Failed to delete chatbot condition" });
    }
  });

  // Get actions for a node
  app.get('/api/whatsapp/chatbot/nodes/:nodeId/actions', isAuthenticated, async (req, res) => {
    try {
      const nodeId = parseInt(req.params.nodeId);
      const actions = await chatbot.getChatbotActionsByNode(nodeId);
      res.json(actions);
    } catch (error) {
      console.error("Error fetching chatbot actions:", error);
      res.status(500).json({ message: "Failed to fetch chatbot actions" });
    }
  });

  // Create action for a node
  app.post('/api/whatsapp/chatbot/actions', isAuthenticated, async (req, res) => {
    try {
      const actionData = req.body;
      
      // Check if user has permission to modify this node's flow
      const node = await chatbot.getChatbotNode(actionData.nodeId);
      if (!node) {
        return res.status(404).json({ message: "Chatbot node not found" });
      }
      
      const flow = await chatbot.getChatbotFlow(node.flowId);
      if (!flow) {
        return res.status(404).json({ message: "Chatbot flow not found" });
      }
      
      if (flow.createdBy !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'superadmin') {
        return res.status(403).json({ message: "You don't have permission to modify this flow" });
      }
      
      const newAction = await chatbot.createChatbotAction(actionData);
      res.status(201).json(newAction);
    } catch (error) {
      console.error("Error creating chatbot action:", error);
      res.status(500).json({ message: "Failed to create chatbot action" });
    }
  });

  // Update action
  app.put('/api/whatsapp/chatbot/actions/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedAction = await chatbot.updateChatbotAction(id, req.body);
      if (!updatedAction) {
        return res.status(404).json({ message: "Chatbot action not found" });
      }
      res.json(updatedAction);
    } catch (error) {
      console.error("Error updating chatbot action:", error);
      res.status(500).json({ message: "Failed to update chatbot action" });
    }
  });

  // Delete action
  app.delete('/api/whatsapp/chatbot/actions/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await chatbot.deleteChatbotAction(id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete chatbot action" });
      }
    } catch (error) {
      console.error("Error deleting chatbot action:", error);
      res.status(500).json({ message: "Failed to delete chatbot action" });
    }
  });

  // Get canned responses
  app.get('/api/whatsapp/canned-responses', isAuthenticated, async (req, res) => {
    try {
      const responses = await chatbot.getCannedResponses();
      res.json(responses);
    } catch (error) {
      console.error("Error fetching canned responses:", error);
      res.status(500).json({ message: "Failed to fetch canned responses" });
    }
  });

  // Get canned responses for a consultant
  app.get('/api/whatsapp/canned-responses/consultant/:consultantId', isAuthenticated, async (req, res) => {
    try {
      const consultantId = parseInt(req.params.consultantId);
      const responses = await chatbot.getCannedResponsesByConsultant(consultantId);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching canned responses for consultant:", error);
      res.status(500).json({ message: "Failed to fetch canned responses" });
    }
  });

  // Create canned response
  app.post('/api/whatsapp/canned-responses', isAuthenticated, async (req, res) => {
    try {
      const responseData = {
        ...req.body,
        createdBy: req.user!.id
      };
      
      const newResponse = await chatbot.createCannedResponse(responseData);
      res.status(201).json(newResponse);
    } catch (error) {
      console.error("Error creating canned response:", error);
      res.status(500).json({ message: "Failed to create canned response" });
    }
  });

  // Update canned response
  app.put('/api/whatsapp/canned-responses/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedResponse = await chatbot.updateCannedResponse(id, req.body);
      if (!updatedResponse) {
        return res.status(404).json({ message: "Canned response not found" });
      }
      res.json(updatedResponse);
    } catch (error) {
      console.error("Error updating canned response:", error);
      res.status(500).json({ message: "Failed to update canned response" });
    }
  });

  // Delete canned response
  app.delete('/api/whatsapp/canned-responses/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await chatbot.deleteCannedResponse(id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete canned response" });
      }
    } catch (error) {
      console.error("Error deleting canned response:", error);
      res.status(500).json({ message: "Failed to delete canned response" });
    }
  });

  // Process incoming webhook from WhatsApp
  app.post('/api/whatsapp/webhook', async (req, res) => {
    try {
      const { entry } = req.body;
      
      if (!entry || !Array.isArray(entry) || entry.length === 0) {
        return res.status(400).json({ message: "Invalid webhook payload" });
      }
      
      // Process each entry in the webhook
      for (const e of entry) {
        if (e.changes && Array.isArray(e.changes)) {
          for (const change of e.changes) {
            if (change.value && change.value.messages && Array.isArray(change.value.messages)) {
              for (const message of change.value.messages) {
                // Extract phone number and message text
                const phoneNumber = message.from;
                const messageText = message.text ? message.text.body : "(Media or non-text message)";
                
                // Process the message with the chatbot
                const response = await chatbot.processIncomingMessage(phoneNumber, messageText);
                
                // If we have a response, we'd send it back to the user via the WhatsApp API
                if (response) {
                  console.log(`[WhatsApp Bot] Response to ${phoneNumber}: ${response}`);
                  // In a real implementation, send the message via WhatsApp API
                  // For now, just acknowledge receipt
                }
              }
            }
          }
        }
      }
      
      res.status(200).send("OK");
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Error processing webhook" });
    }
  });

  // WhatsApp webhook verification
  app.get('/api/whatsapp/webhook', async (req, res) => {
    try {
      const settings = await storage.getWhatsappSettings();
      
      if (!settings || !settings.webhookVerifyToken) {
        return res.status(400).json({ message: "WhatsApp settings not configured" });
      }
      
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];
      
      if (mode === 'subscribe' && token === settings.webhookVerifyToken) {
        console.log('WhatsApp webhook verified');
        res.status(200).send(challenge);
      } else {
        console.log('WhatsApp webhook verification failed');
        res.status(403).send('Verification failed');
      }
    } catch (error) {
      console.error("Error verifying webhook:", error);
      res.status(500).json({ message: "Error verifying webhook" });
    }
  });
  
  // ================== End of WhatsApp Chatbot API ==================

  // ================== Titan Email API ==================
  
  // Get Titan Email settings
  app.get('/api/email/settings', isAdmin, async (req, res) => {
    try {
      const settings = await storage.getTitanEmailSettings();
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Titan Email settings" });
    }
  });

  // Save Titan Email settings
  app.post('/api/email/settings', isAdmin, async (req, res) => {
    try {
      const settingsData = insertTitanEmailSettingsSchema.parse(req.body);
      const settings = await storage.getTitanEmailSettings();
      
      if (settings) {
        // Update existing settings
        const updatedSettings = await storage.updateTitanEmailSettings(settings.id, settingsData);
        res.json(updatedSettings);
      } else {
        // Create new settings
        const newSettings = await storage.createTitanEmailSettings(settingsData);
        res.status(201).json(newSettings);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to save Titan Email settings" });
    }
  });
  
  // Test email connection
  app.post('/api/email/test-connection', isAdmin, async (req, res) => {
    try {
      const connectionResult = await storage.testEmailConnection(req.body);
      if (connectionResult) {
        res.json({ success: true, message: "Connection successful" });
      } else {
        res.status(400).json({ success: false, message: "Connection failed" });
      }
    } catch (error) {
      let errorMessage = "Connection test failed";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      console.error("Email connection test failed:", error);
      res.status(500).json({ 
        success: false, 
        message: errorMessage
      });
    }
  });

  // Get Email templates
  app.get('/api/email/templates', isAuthenticated, async (req, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Email templates" });
    }
  });

  // Get Email template by ID
  app.get('/api/email/templates/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getEmailTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Email template" });
    }
  });

  // Get Email templates by category
  app.get('/api/email/templates/category/:category', isAuthenticated, async (req, res) => {
    try {
      const { category } = req.params;
      const templates = await storage.getEmailTemplatesByCategory(category);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Email templates by category" });
    }
  });

  // Create Email template
  app.post('/api/email/templates', isAuthenticated, async (req, res) => {
    try {
      const templateData = insertEmailTemplateSchema.parse(req.body);
      const newTemplate = await storage.createEmailTemplate(templateData);
      res.status(201).json(newTemplate);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create Email template" });
    }
  });

  // Update Email template
  app.patch('/api/email/templates/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const templateData = req.body;
      const updatedTemplate = await storage.updateEmailTemplate(id, templateData);
      if (!updatedTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(updatedTemplate);
    } catch (error) {
      res.status(500).json({ message: "Failed to update Email template" });
    }
  });

  // Delete Email template
  app.delete('/api/email/templates/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEmailTemplate(id);
      if (!success) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete Email template" });
    }
  });

  // Get Email history
  app.get('/api/email/history', isAuthenticated, async (req, res) => {
    try {
      const history = await storage.getEmailHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Email history" });
    }
  });

  // Get Email history by lead ID
  app.get('/api/email/history/lead/:leadId', isAuthenticated, async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId);
      const history = await storage.getEmailHistoryByLeadId(leadId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Email history for lead" });
    }
  });

  // Get Email history by student ID
  app.get('/api/email/history/student/:studentId', isAuthenticated, async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const history = await storage.getEmailHistoryByStudentId(studentId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Email history for student" });
    }
  });

  // Send Email
  app.post('/api/email/send', isAuthenticated, async (req, res) => {
    try {
      const emailData = insertEmailHistorySchema.parse({
        ...req.body,
        createdBy: req.user?.id
      });
      const newEmail = await storage.createEmailHistory(emailData);
      
      // Here we would integrate with the Titan Email API to actually send the email
      // This would require API key verification and using the Titan Email API client
      
      res.status(201).json(newEmail);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to send Email" });
    }
  });
  
  // Send email with attachments
  app.post('/api/email/send-with-attachments', isAuthenticated, upload.array('emailAttachment', 10), async (req, res) => {
    try {
      // Parse form data fields
      const { recipientEmail, subject, bodyText, bodyHtml, useHtml, templateId } = req.body;
      
      if (!recipientEmail || !subject || (!bodyText && !bodyHtml)) {
        return res.status(400).json({ message: "Required fields missing" });
      }
      
      // Get file attachments from the request
      const files = req.files as Express.Multer.File[];
      
      // Store attachment metadata in a safer serializable format
      // We only save the path as a string in the database as per schema
      const attachmentPaths = files.map(file => file.filename);
      
      // Create email history record with the path strings
      const emailData = {
        recipientEmail,
        subject,
        bodyText,
        bodyHtml: useHtml === 'true' ? bodyHtml : null,
        status: "sent",
        createdBy: req.user?.id,
        templateId: templateId ? parseInt(templateId) : null,
        attachments: attachmentPaths
      };
      
      const newEmail = await storage.createEmailHistory(emailData);
      
      // For the response, include the full attachment details
      const responseEmail = {
        ...newEmail,
        attachments: files.map(file => ({
          filename: file.originalname,
          path: file.filename,
          mimetype: file.mimetype,
          size: file.size
        }))
      };
      
      // Here we would integrate with the Titan Email API to actually send the email
      // This would require API key verification and using the Titan Email API client
      
      res.status(201).json(responseEmail);
    } catch (error) {
      console.error("Failed to send email with attachments:", error);
      res.status(500).json({ message: "Failed to send email with attachments" });
    }
  });

  // ================== End of Titan Email API ==================

  // ================== Analytics API ==================
  
  // Get dashboard stats
  app.get('/api/analytics/dashboard', isAuthenticated, async (req, res) => {
    try {
      const stats = await analytics.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard analytics" });
    }
  });

  // Get student analytics
  app.get('/api/analytics/students', isAuthenticated, async (req, res) => {
    try {
      const data = await analytics.getStudentAnalytics();
      res.json(data);
    } catch (error) {
      console.error("Error fetching student analytics:", error);
      res.status(500).json({ message: "Failed to fetch student analytics" });
    }
  });

  // Get financial analytics
  app.get('/api/analytics/financial', isAuthenticated, async (req, res) => {
    try {
      const data = await analytics.getFinancialAnalytics();
      res.json(data);
    } catch (error) {
      console.error("Error fetching financial analytics:", error);
      res.status(500).json({ message: "Failed to fetch financial analytics" });
    }
  });

  // Get course analytics
  app.get('/api/analytics/courses', isAuthenticated, async (req, res) => {
    try {
      const data = await analytics.getCourseAnalytics();
      res.json(data);
    } catch (error) {
      console.error("Error fetching course analytics:", error);
      res.status(500).json({ message: "Failed to fetch course analytics" });
    }
  });

  // Get CRM analytics
  app.get('/api/analytics/crm', isAuthenticated, async (req, res) => {
    try {
      const data = await analytics.getCrmAnalytics();
      res.json(data);
    } catch (error) {
      console.error("Error fetching CRM analytics:", error);
      res.status(500).json({ message: "Failed to fetch CRM analytics" });
    }
  });

  // Get HRM analytics
  app.get('/api/analytics/hrm', isAuthenticated, async (req, res) => {
    try {
      const data = await analytics.getHrmAnalytics();
      res.json(data);
    } catch (error) {
      console.error("Error fetching HRM analytics:", error);
      res.status(500).json({ message: "Failed to fetch HRM analytics" });
    }
  });

  // ================== End of Analytics API ==================

  // ================== Sales Pipeline API ==================
  
  // Pipeline Stages routes
  app.get("/api/pipeline/stages", isAuthenticated, async (req, res) => {
    try {
      const stages = await storage.getPipelineStages();
      res.json(stages);
    } catch (error) {
      console.error("Error fetching pipeline stages:", error);
      res.status(500).json({ message: "Failed to fetch pipeline stages" });
    }
  });
  
  app.get("/api/pipeline/stages/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const stage = await storage.getPipelineStage(id);
      if (!stage) {
        return res.status(404).json({ message: "Pipeline stage not found" });
      }
      res.json(stage);
    } catch (error) {
      console.error("Error fetching pipeline stage:", error);
      res.status(500).json({ message: "Failed to fetch pipeline stage" });
    }
  });
  
  app.post("/api/pipeline/stages", isAdmin, async (req, res) => {
    try {
      const stage = await storage.createPipelineStage({
        ...req.body,
        createdBy: req.user!.id
      });
      res.status(201).json(stage);
    } catch (error) {
      console.error("Error creating pipeline stage:", error);
      res.status(500).json({ message: "Failed to create pipeline stage" });
    }
  });
  
  app.put("/api/pipeline/stages/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const stage = await storage.updatePipelineStage(id, req.body);
      if (!stage) {
        return res.status(404).json({ message: "Pipeline stage not found" });
      }
      res.json(stage);
    } catch (error) {
      console.error("Error updating pipeline stage:", error);
      res.status(500).json({ message: "Failed to update pipeline stage" });
    }
  });
  
  app.delete("/api/pipeline/stages/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await storage.deletePipelineStage(id);
      if (!deleted) {
        return res.status(404).json({ message: "Pipeline stage not found or cannot be deleted" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting pipeline stage:", error);
      res.status(500).json({ message: "Failed to delete pipeline stage" });
    }
  });
  
  // Pipeline Deals routes
  app.get("/api/pipeline/deals", isAuthenticated, async (req, res) => {
    try {
      const deals = await storage.getPipelineDeals();
      res.json(deals);
    } catch (error) {
      console.error("Error fetching pipeline deals:", error);
      res.status(500).json({ message: "Failed to fetch pipeline deals" });
    }
  });
  
  app.get("/api/pipeline/stages/:stageId/deals", isAuthenticated, async (req, res) => {
    try {
      const stageId = parseInt(req.params.stageId, 10);
      const deals = await storage.getPipelineDealsByStage(stageId);
      res.json(deals);
    } catch (error) {
      console.error("Error fetching deals for stage:", error);
      res.status(500).json({ message: "Failed to fetch deals for stage" });
    }
  });
  
  app.get("/api/pipeline/leads/:leadId/deals", isAuthenticated, async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId, 10);
      const deals = await storage.getPipelineDealsByLead(leadId);
      res.json(deals);
    } catch (error) {
      console.error("Error fetching deals for lead:", error);
      res.status(500).json({ message: "Failed to fetch deals for lead" });
    }
  });
  
  app.get("/api/pipeline/corporate-leads/:leadId/deals", isAuthenticated, async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId, 10);
      const deals = await storage.getPipelineDealsByCorporateLead(leadId);
      res.json(deals);
    } catch (error) {
      console.error("Error fetching deals for corporate lead:", error);
      res.status(500).json({ message: "Failed to fetch deals for corporate lead" });
    }
  });
  
  app.get("/api/pipeline/deals/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deal = await storage.getPipelineDeal(id);
      if (!deal) {
        return res.status(404).json({ message: "Pipeline deal not found" });
      }
      res.json(deal);
    } catch (error) {
      console.error("Error fetching pipeline deal:", error);
      res.status(500).json({ message: "Failed to fetch pipeline deal" });
    }
  });
  
  app.post("/api/pipeline/deals", isAuthenticated, async (req, res) => {
    try {
      const deal = await storage.createPipelineDeal({
        ...req.body,
        createdBy: req.user!.id,
        assignedTo: req.body.assignedTo || req.user!.id
      });
      res.status(201).json(deal);
    } catch (error) {
      console.error("Error creating pipeline deal:", error);
      res.status(500).json({ message: "Failed to create pipeline deal" });
    }
  });
  
  app.put("/api/pipeline/deals/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deal = await storage.updatePipelineDeal(id, req.body);
      if (!deal) {
        return res.status(404).json({ message: "Pipeline deal not found" });
      }
      res.json(deal);
    } catch (error) {
      console.error("Error updating pipeline deal:", error);
      res.status(500).json({ message: "Failed to update pipeline deal" });
    }
  });
  
  app.post("/api/pipeline/deals/:id/move", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { stageId, notes } = req.body;
      
      if (!stageId) {
        return res.status(400).json({ message: "Stage ID is required" });
      }
      
      const deal = await storage.movePipelineDealToStage(
        id, 
        parseInt(stageId, 10), 
        notes || 'Moved to new stage', 
        req.user!.id
      );
      
      if (!deal) {
        return res.status(404).json({ message: "Pipeline deal not found" });
      }
      
      res.json(deal);
    } catch (error) {
      console.error("Error moving pipeline deal:", error);
      res.status(500).json({ message: "Failed to move pipeline deal" });
    }
  });
  
  app.delete("/api/pipeline/deals/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await storage.deletePipelineDeal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Pipeline deal not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting pipeline deal:", error);
      res.status(500).json({ message: "Failed to delete pipeline deal" });
    }
  });
  
  // Pipeline Activities routes
  app.get("/api/pipeline/activities", isAuthenticated, async (req, res) => {
    try {
      const activities = await storage.getPipelineActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching pipeline activities:", error);
      res.status(500).json({ message: "Failed to fetch pipeline activities" });
    }
  });
  
  app.get("/api/pipeline/deals/:dealId/activities", isAuthenticated, async (req, res) => {
    try {
      const dealId = parseInt(req.params.dealId, 10);
      const activities = await storage.getPipelineActivitiesByDeal(dealId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities for deal:", error);
      res.status(500).json({ message: "Failed to fetch activities for deal" });
    }
  });
  
  app.get("/api/pipeline/activities/due-today", isAuthenticated, async (req, res) => {
    try {
      const activities = await storage.getPipelineActivitiesDueToday();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities due today:", error);
      res.status(500).json({ message: "Failed to fetch activities due today" });
    }
  });
  
  app.get("/api/pipeline/activities/overdue", isAuthenticated, async (req, res) => {
    try {
      const activities = await storage.getPipelineActivitiesOverdue();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching overdue activities:", error);
      res.status(500).json({ message: "Failed to fetch overdue activities" });
    }
  });
  
  app.get("/api/pipeline/activities/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const activity = await storage.getPipelineActivity(id);
      if (!activity) {
        return res.status(404).json({ message: "Pipeline activity not found" });
      }
      res.json(activity);
    } catch (error) {
      console.error("Error fetching pipeline activity:", error);
      res.status(500).json({ message: "Failed to fetch pipeline activity" });
    }
  });
  
  app.post("/api/pipeline/activities", isAuthenticated, async (req, res) => {
    try {
      const activity = await storage.createPipelineActivity({
        ...req.body,
        createdBy: req.user!.id,
        assignedTo: req.body.assignedTo || req.user!.id
      });
      res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating pipeline activity:", error);
      res.status(500).json({ message: "Failed to create pipeline activity" });
    }
  });
  
  app.put("/api/pipeline/activities/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const activity = await storage.updatePipelineActivity(id, req.body);
      if (!activity) {
        return res.status(404).json({ message: "Pipeline activity not found" });
      }
      res.json(activity);
    } catch (error) {
      console.error("Error updating pipeline activity:", error);
      res.status(500).json({ message: "Failed to update pipeline activity" });
    }
  });
  
  app.post("/api/pipeline/activities/:id/complete", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { outcome } = req.body;
      
      if (!outcome) {
        return res.status(400).json({ message: "Outcome is required" });
      }
      
      const activity = await storage.markPipelineActivityAsComplete(id, outcome);
      if (!activity) {
        return res.status(404).json({ message: "Pipeline activity not found" });
      }
      res.json(activity);
    } catch (error) {
      console.error("Error completing pipeline activity:", error);
      res.status(500).json({ message: "Failed to complete pipeline activity" });
    }
  });
  
  app.delete("/api/pipeline/activities/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await storage.deletePipelineActivity(id);
      if (!deleted) {
        return res.status(404).json({ message: "Pipeline activity not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting pipeline activity:", error);
      res.status(500).json({ message: "Failed to delete pipeline activity" });
    }
  });
  
  // Pipeline Stage History routes
  app.get("/api/pipeline/deals/:dealId/history", isAuthenticated, async (req, res) => {
    try {
      const dealId = parseInt(req.params.dealId, 10);
      const history = await storage.getPipelineStageHistory(dealId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching stage history for deal:", error);
      res.status(500).json({ message: "Failed to fetch stage history for deal" });
    }
  });
  
  // ================== End of Sales Pipeline API ==================

  const httpServer = createServer(app);
  return httpServer;
}
