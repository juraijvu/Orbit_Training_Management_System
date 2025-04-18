import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import multer from "multer";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import * as chatbot from "./chatbot";
import { emailNotificationService } from "./notifications";
import {
  insertStudentSchema,
  insertCourseSchema,
  insertTrainerSchema,
  insertInvoiceSchema,
  insertScheduleSchema,
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
  const generateId = (prefix: string, count: number): string => {
    const year = new Date().getFullYear();
    return `${prefix}-${year}-${count.toString().padStart(3, '0')}`;
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
      const invoiceData = insertInvoiceSchema.parse(req.body);
      
      // Generate invoice number
      const invoices = await storage.getInvoices();
      const invoiceNumber = generateId('INV', invoices.length + 1);
      
      const newInvoice = await storage.createInvoice({ ...invoiceData, invoiceNumber });
      
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
      if (req.body.status === 'paid' && existingInvoice.status !== 'paid') {
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
      const scheduleData = insertScheduleSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      const newSchedule = await storage.createSchedule(scheduleData);
      
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
              trainer.name
            );
          }
        }
      } catch (notificationError) {
        console.error("Failed to send schedule notification:", notificationError);
        // Continue with the response even if the notification fails
      }
      
      res.status(201).json(newSchedule);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
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
      if (detailsChanged) {
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
                trainer.name
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
      const certificateData = insertCertificateSchema.parse({
        ...req.body,
        issuedBy: req.user!.id
      });
      
      // Generate certificate number
      const certificates = await storage.getCertificates();
      const certificateNumber = generateId('CERT', certificates.length + 1);
      
      const newCertificate = await storage.createCertificate({ ...certificateData, certificateNumber });
      res.status(201).json(newCertificate);
    } catch (error) {
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

  // Get quotation by ID
  app.get('/api/quotations/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quotation = await storage.getQuotation(id);
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      res.json(quotation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotation" });
    }
  });

  // Create quotation
  app.post('/api/quotations', isAuthenticated, async (req, res) => {
    try {
      const quotationData = insertQuotationSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      // Generate quotation number
      const quotations = await storage.getQuotations();
      const quotationNumber = generateId('QUOT', quotations.length + 1);
      
      const newQuotation = await storage.createQuotation({ ...quotationData, quotationNumber });
      res.status(201).json(newQuotation);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create quotation" });
    }
  });

  // Update quotation
  app.patch('/api/quotations/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingQuotation = await storage.getQuotation(id);
      if (!existingQuotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      
      const updatedQuotation = await storage.updateQuotation(id, req.body);
      res.json(updatedQuotation);
    } catch (error) {
      res.status(500).json({ message: "Failed to update quotation" });
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
  app.patch('/api/users/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Prevent role escalation - only superadmin can create superadmins
      if (req.body.role === 'superadmin' && req.user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Only superadmins can create or modify superadmin accounts" });
      }
      
      // Prevent updating your own role
      if (id === req.user?.id && req.body.role) {
        return res.status(403).json({ message: "You cannot modify your own role" });
      }
      
      const updatedUser = await storage.updateUser(id, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
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

  const httpServer = createServer(app);
  return httpServer;
}
