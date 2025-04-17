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

// CRM Tables
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  whatsappNumber: text("whatsapp_number"),
  consultantId: integer("consultant_id").notNull(), // User ID of consultant
  source: text("source").notNull(), // website, social media, referral, etc.
  interestedCourses: text("interested_courses").notNull(), // Store as JSON array of course IDs
  status: text("status").notNull().default("New"), // New, Interested Highly, Register Soon, Wrong Enquiry, Not Interested, Called Back, Converted
  priority: text("priority").notNull().default("Medium"), // High, Medium, Low
  followupStatus: text("followup_status").default("Pending"), // Pending, Completed, No Response
  notes: text("notes"),
  meetingDate: timestamp("meeting_date"),
  assignedTo: integer("assigned_to"), // User ID
  lastContactDate: timestamp("last_contact_date"),
  nextFollowUpDate: timestamp("next_follow_up_date"),
  nextFollowUpTime: text("next_follow_up_time"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  platform: text("platform").notNull(), // Meta Ads, Google Ads, LinkedIn Ads, TikTok Ads, etc.
  adAccount: text("ad_account"),
  adCampaignId: text("ad_campaign_id"),
  targetAudience: text("target_audience"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  budget: numeric("budget"),
  status: text("status").notNull(), // planned, active, completed
  results: text("results"), // Stored as JSON
  conversions: integer("conversions").default(0),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  costPerLead: numeric("cost_per_lead"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
});

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export const followUps = pgTable("follow_ups", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull(),
  contactDate: timestamp("contact_date").notNull(),
  contactTime: text("contact_time"),
  contactType: text("contact_type").notNull(), // call, email, meeting, whatsapp, etc.
  notes: text("notes"),
  outcome: text("outcome"), // Interested Highly, Called Back, No Response, Wrong Enquiry, Not Interested
  nextFollowUp: timestamp("next_follow_up"),
  nextFollowUpTime: text("next_follow_up_time"),
  priority: text("priority").notNull().default("Medium"), // High, Medium, Low
  status: text("status").notNull().default("Pending"), // Pending, Completed, Missed
  isNotified: boolean("is_notified").default(false),
  createdBy: integer("created_by").notNull(),
  consultantId: integer("consultant_id").notNull(), // to track which consultant created the follow-up
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFollowUpSchema = createInsertSchema(followUps).omit({
  id: true,
  createdAt: true,
});

export type InsertFollowUp = z.infer<typeof insertFollowUpSchema>;
export type FollowUp = typeof followUps.$inferSelect;

// WhatsApp Integration
export const whatsappSettings = pgTable("whatsapp_settings", {
  id: serial("id").primaryKey(),
  apiKey: text("api_key").notNull(),
  phoneNumberId: text("phone_number_id").notNull(),
  businessAccountId: text("business_account_id").notNull(),
  accessToken: text("access_token").notNull(),
  webhookVerifyToken: text("webhook_verify_token").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWhatsappSettingsSchema = createInsertSchema(whatsappSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWhatsappSettings = z.infer<typeof insertWhatsappSettingsSchema>;
export type WhatsappSettings = typeof whatsappSettings.$inferSelect;

export const whatsappTemplates = pgTable("whatsapp_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  content: text("content").notNull(),
  type: text("type").notNull(), // welcome, followup, course_info, payment_reminder, etc.
  variables: text("variables"), // JSON array of variable names in the template
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWhatsappTemplateSchema = createInsertSchema(whatsappTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWhatsappTemplate = z.infer<typeof insertWhatsappTemplateSchema>;
export type WhatsappTemplate = typeof whatsappTemplates.$inferSelect;

export const whatsappChats = pgTable("whatsapp_chats", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull(),
  phoneNumber: text("phone_number").notNull(),
  consultantId: integer("consultant_id"), // The consultant assigned to this chat
  lastMessageTime: timestamp("last_message_time").notNull().defaultNow(),
  unreadCount: integer("unread_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWhatsappChatSchema = createInsertSchema(whatsappChats).omit({
  id: true,
  createdAt: true,
});

export type InsertWhatsappChat = z.infer<typeof insertWhatsappChatSchema>;
export type WhatsappChat = typeof whatsappChats.$inferSelect;

export const whatsappMessages = pgTable("whatsapp_messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull(),
  messageId: text("message_id"), // WhatsApp message ID for sent/received messages
  content: text("content").notNull(),
  mediaUrl: text("media_url"), // URL to any media in the message
  mediaType: text("media_type"), // image, video, audio, document
  direction: text("direction").notNull(), // inbound (received) or outbound (sent)
  status: text("status").notNull(), // sent, delivered, read, failed
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  sentBy: integer("sent_by"), // User ID if sent by a user
  isTemplateMessage: boolean("is_template_message").default(false),
  templateId: integer("template_id"), // Reference to the template used
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWhatsappMessageSchema = createInsertSchema(whatsappMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertWhatsappMessage = z.infer<typeof insertWhatsappMessageSchema>;
export type WhatsappMessage = typeof whatsappMessages.$inferSelect;
