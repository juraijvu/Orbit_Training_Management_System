import { pgTable, text, serial, integer, boolean, date, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("counselor"), // counselor, admin, superadmin
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  fullName: true,
  email: true,
  phone: true,
});

// Students Table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull().unique(), // e.g., STU-2023-001
  fullName: text("full_name").notNull(),
  fatherName: text("father_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  dob: date("dob").notNull(),
  gender: text("gender").notNull(),
  address: text("address").notNull(),
  courseId: integer("course_id").notNull(),
  batch: text("batch").notNull(),
  registrationDate: timestamp("registration_date").notNull().defaultNow(),
  courseFee: numeric("course_fee").notNull(),
  discount: numeric("discount").default("0"),
  totalFee: numeric("total_fee").notNull(),
  initialPayment: numeric("initial_payment").notNull(),
  balanceDue: numeric("balance_due").notNull(),
  paymentMode: text("payment_mode").notNull(),
  paymentStatus: text("payment_status").notNull(), // paid, partial, pending
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

// Courses Table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
  fee: numeric("fee").notNull(),
  content: text("content"), // Stored as a JSON string
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

// Trainers Table
export const trainers = pgTable("trainers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  specialization: text("specialization").notNull(),
  courses: text("courses").notNull(), // Stored as comma-separated course IDs
  availability: text("availability").notNull(), // Stored as JSON
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTrainerSchema = createInsertSchema(trainers).omit({
  id: true,
  createdAt: true,
});

// Invoices Table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(), // e.g., INV-2023-001
  studentId: integer("student_id").notNull(),
  amount: numeric("amount").notNull(),
  paymentMode: text("payment_mode").notNull(),
  transactionId: text("transaction_id"),
  paymentDate: timestamp("payment_date").notNull().defaultNow(),
  status: text("status").notNull(), // paid, pending
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

// Schedule Table
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  courseId: integer("course_id").notNull(),
  trainerId: integer("trainer_id").notNull(),
  studentIds: text("student_ids").notNull(), // Stored as comma-separated student IDs
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default("confirmed"), // confirmed, pending, cancelled
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
  createdAt: true,
});

// Certificates Table
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  certificateNumber: text("certificate_number").notNull().unique(), // e.g., CERT-2023-001
  studentId: integer("student_id").notNull(),
  courseId: integer("course_id").notNull(),
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  issuedBy: integer("issued_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  createdAt: true,
});

// Quotations Table
export const quotations = pgTable("quotations", {
  id: serial("id").primaryKey(),
  quotationNumber: text("quotation_number").notNull().unique(), // e.g., QUOT-2023-001
  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  courseId: integer("course_id").notNull(),
  participants: integer("participants").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  discount: numeric("discount").default("0"),
  finalAmount: numeric("final_amount").notNull(),
  validity: date("validity").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertQuotationSchema = createInsertSchema(quotations).omit({
  id: true,
  createdAt: true,
});

// Proposals Table
export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  proposalNumber: text("proposal_number").notNull().unique(), // e.g., PROP-2023-001
  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  courseIds: text("course_ids").notNull(), // Stored as comma-separated course IDs
  totalAmount: numeric("total_amount").notNull(),
  discount: numeric("discount").default("0"),
  finalAmount: numeric("final_amount").notNull(),
  coverPage: text("cover_page"), // URL or content
  content: text("content"), // Stored as JSON
  status: text("status").notNull().default("draft"), // draft, sent, accepted, rejected
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

export type InsertTrainer = z.infer<typeof insertTrainerSchema>;
export type Trainer = typeof trainers.$inferSelect;

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;

export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;

export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type Quotation = typeof quotations.$inferSelect;

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;
