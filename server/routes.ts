import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import {
  insertStudentSchema,
  insertCourseSchema,
  insertTrainerSchema,
  insertInvoiceSchema,
  insertScheduleSchema,
  insertCertificateSchema,
  insertQuotationSchema,
  insertProposalSchema,
  insertUserSchema
} from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
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
      res.status(201).json(newInvoice);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create invoice" });
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

  const httpServer = createServer(app);
  return httpServer;
}
