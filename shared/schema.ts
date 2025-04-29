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
  registrationNumber: text("registration_number"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phoneNo: text("phone_no").notNull(),
  alternativeNo: text("alternative_no"),
  dateOfBirth: date("date_of_birth").notNull(),
  passportNo: text("passport_no"),
  uidNo: text("uid_no"),
  emiratesIdNo: text("emirates_id_no"),
  emirates: text("emirates"), // The specific emirate (Dubai, Abu Dhabi, etc.)
  nationality: text("nationality"),
  education: text("education"),
  gender: text("gender"),
  address: text("address"),
  country: text("country"),
  companyOrUniversityName: text("company_or_university_name"),
  classType: text("class_type"), // online, offline, private, batch
  registrationDate: timestamp("registration_date").notNull().defaultNow(),
  balanceDue: numeric("balance_due"),
  paymentMode: text("payment_mode"),
  paymentStatus: text("payment_status"), // paid, partial, pending
  signatureData: text("signature_data"), // Store base64 signature image data
  termsAccepted: boolean("terms_accepted").default(false), // Whether terms & conditions were accepted
  signatureDate: timestamp("signature_date"), // Date when signature was done
  registerLink: text("register_link"), // Unique link for online registration
  registerLinkExpiry: timestamp("register_link_expiry"), // When the registration link expires
  registerLinkDiscount: numeric("register_link_discount").default("0"), // Pre-set discount for online registration
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by"),
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
  fee: numeric("fee").notNull(), // Standard fee
  onlineRate: numeric("online_rate"), // Fee for online courses
  offlineRate: numeric("offline_rate"), // Fee for offline courses
  privateRate: numeric("private_rate"), // Fee for private sessions
  batchRate: numeric("batch_rate"), // Fee for batch sessions
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
  profilePdf: text("profile_pdf"), // URL to the uploaded profile PDF
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
}).transform((data) => {
  // Convert paymentDate string to Date if it's a string
  if (typeof data.paymentDate === 'string') {
    data.paymentDate = new Date(data.paymentDate);
  }
  return data;
});

// Schedule Table
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  courseId: integer("course_id").notNull(),
  trainerId: integer("trainer_id").notNull(),
  studentIds: text("student_ids").notNull(), // Stored as comma-separated student IDs
  sessionType: text("session_type").notNull().default("one_to_one"), // batch, one_to_one, private, corporate
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  duration: integer("duration").notNull(), // Duration in minutes
  occurrenceDays: text("occurrence_days").notNull(), // Stored as comma-separated days (mon,tue,wed,thu,fri,sat,sun)
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
  clientName: text("client_name").notNull(),
  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  schedule: text("schedule").notNull(),
  trainingVenue: text("training_venue").notNull(),
  consultantName: text("consultant_name").notNull(),
  consultantEmail: text("consultant_email").notNull(),
  consultantNumber: text("consultant_number").notNull(),
  position: text("position").notNull(),
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

// Quotation Items Table
export const quotationItems = pgTable("quotation_items", {
  id: serial("id").primaryKey(),
  quotationId: integer("quotation_id").notNull(),
  courseId: integer("course_id").notNull(),
  duration: text("duration").notNull(),
  numberOfPersons: integer("number_of_persons").notNull(),
  rate: numeric("rate").notNull(),
  total: numeric("total").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertQuotationItemSchema = createInsertSchema(quotationItems).omit({
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
  trainerId: integer("trainer_id"), // Reference to the trainer who will conduct the training
  totalAmount: numeric("total_amount").notNull(),
  discount: numeric("discount").default("0"),
  finalAmount: numeric("final_amount").notNull(),
  coverPage: text("cover_page"), // URL or content
  content: text("content"), // Stored as JSON
  companyProfile: text("company_profile"), // Company profile PDF URL or path
  companyProfileFilename: text("company_profile_filename"), // Original filename of the company profile
  companyProfileMimeType: text("company_profile_mime_type"), // MIME type of the company profile file
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

export type InsertQuotationItem = z.infer<typeof insertQuotationItemSchema>;
export type QuotationItem = typeof quotationItems.$inferSelect;

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;

// Registration Courses Table for tracking courses in a registration
export const registrationCourses = pgTable("registration_courses", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  courseId: integer("course_id").notNull(),
  price: numeric("price").notNull(),
  discount: numeric("discount").default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRegistrationCourseSchema = createInsertSchema(registrationCourses).omit({
  id: true,
  createdAt: true,
});

export type InsertRegistrationCourse = z.infer<typeof insertRegistrationCourseSchema>;
export type RegistrationCourse = typeof registrationCourses.$inferSelect;

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

// WhatsApp Chatbot Tables
export const chatbotFlows = pgTable("chatbot_flows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  consultantId: integer("consultant_id").notNull(), // The consultant who owns this flow
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false), // If true, this flow will be used as fallback
  triggerKeywords: text("trigger_keywords"), // comma-separated keywords that trigger this flow
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertChatbotFlowSchema = createInsertSchema(chatbotFlows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertChatbotFlow = z.infer<typeof insertChatbotFlowSchema>;
export type ChatbotFlow = typeof chatbotFlows.$inferSelect;

export const chatbotNodes = pgTable("chatbot_nodes", {
  id: serial("id").primaryKey(),
  flowId: integer("flow_id").notNull(), // Reference to the chatbot flow
  nodeType: text("node_type").notNull(), // message, question, condition, action
  content: text("content").notNull(), // Message content or condition logic (JSON)
  responseType: text("response_type").default("text"), // text, buttons, list, media
  responseOptions: text("response_options"), // JSON array of possible responses
  position: integer("position").notNull(), // Order within the flow
  nextNodeId: integer("next_node_id"), // Next node to execute
  waitForInput: boolean("wait_for_input").default(false), // Whether to wait for user input
  variableName: text("variable_name"), // If input is stored, the variable name
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChatbotNodeSchema = createInsertSchema(chatbotNodes).omit({
  id: true,
  createdAt: true,
});

export type InsertChatbotNode = z.infer<typeof insertChatbotNodeSchema>;
export type ChatbotNode = typeof chatbotNodes.$inferSelect;

export const chatbotConditions = pgTable("chatbot_conditions", {
  id: serial("id").primaryKey(),
  nodeId: integer("node_id").notNull(), // Reference to the parent node
  conditionType: text("condition_type").notNull(), // equals, contains, greater_than, etc.
  variable: text("variable").notNull(), // Variable to check
  value: text("value").notNull(), // Value to compare against
  nextNodeId: integer("next_node_id").notNull(), // Node to go to if condition is met
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChatbotConditionSchema = createInsertSchema(chatbotConditions).omit({
  id: true,
  createdAt: true,
});

export type InsertChatbotCondition = z.infer<typeof insertChatbotConditionSchema>;
export type ChatbotCondition = typeof chatbotConditions.$inferSelect;

export const chatbotActions = pgTable("chatbot_actions", {
  id: serial("id").primaryKey(),
  nodeId: integer("node_id").notNull(), // Reference to the parent node
  actionType: text("action_type").notNull(), // create_lead, update_lead, assign_consultant, etc.
  actionData: text("action_data").notNull(), // JSON with action parameters
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChatbotActionSchema = createInsertSchema(chatbotActions).omit({
  id: true,
  createdAt: true,
});

export type InsertChatbotAction = z.infer<typeof insertChatbotActionSchema>;
export type ChatbotAction = typeof chatbotActions.$inferSelect;

export const chatbotSessions = pgTable("chatbot_sessions", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull(), // Reference to the WhatsApp chat
  flowId: integer("flow_id").notNull(), // Current flow being executed
  currentNodeId: integer("current_node_id"), // Current node in the flow
  sessionData: text("session_data"), // JSON with collected variables
  isActive: boolean("is_active").default(true),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  lastInteractionAt: timestamp("last_interaction_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChatbotSessionSchema = createInsertSchema(chatbotSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertChatbotSession = z.infer<typeof insertChatbotSessionSchema>;
export type ChatbotSession = typeof chatbotSessions.$inferSelect;

export const cannedResponses = pgTable("canned_responses", {
  id: serial("id").primaryKey(),
  consultantId: integer("consultant_id").notNull(), // Consultant who created this
  shortcut: text("shortcut").notNull(), // Shortcut text to trigger the response
  message: text("message").notNull(), // Full message content
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCannedResponseSchema = createInsertSchema(cannedResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCannedResponse = z.infer<typeof insertCannedResponseSchema>;
export type CannedResponse = typeof cannedResponses.$inferSelect;

// Titan Email settings
export const titanEmailSettings = pgTable("titan_email_settings", {
  id: serial("id").primaryKey(),
  // Email account information
  accountName: text("account_name"),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email").notNull(),
  emailPassword: text("email_password"),
  replyToEmail: text("reply_to_email"),
  signature: text("signature"), // HTML signature
  
  // Incoming server settings (IMAP)
  imapServer: text("imap_server"),
  imapPort: integer("imap_port"),
  imapSecurity: text("imap_security"), // none, ssl, tls
  imapUsername: text("imap_username"),
  imapPassword: text("imap_password"),
  
  // Outgoing server settings (SMTP)
  smtpServer: text("smtp_server"),
  smtpPort: integer("smtp_port"),
  smtpSecurity: text("smtp_security"), // none, ssl, tls
  smtpUsername: text("smtp_username"),
  smtpPassword: text("smtp_password"),
  smtpAuthRequired: boolean("smtp_auth_required").default(true),
  
  // API settings (if using Titan API)
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  
  // Advanced settings
  connectionTimeout: integer("connection_timeout").default(30),
  enabled: boolean("enabled").default(false),
  useApi: boolean("use_api").default(true), // true = use API, false = use SMTP/IMAP
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTitanEmailSettingsSchema = createInsertSchema(titanEmailSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTitanEmailSettings = z.infer<typeof insertTitanEmailSettingsSchema>;
export type TitanEmailSettings = typeof titanEmailSettings.$inferSelect;

// Email Templates
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  bodyText: text("body_text").notNull(),
  bodyHtml: text("body_html").notNull(),
  isDefault: boolean("is_default").default(false),
  category: text("category").notNull(), // lead_follow_up, course_info, invoice, etc.
  variables: text("variables").array(), // Array of variable placeholders used in the template
  createdBy: integer("created_by"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;

// Email History
export const emailHistory = pgTable("email_history", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id"),
  subject: text("subject").notNull(),
  bodyText: text("body_text"),
  bodyHtml: text("body_html"),
  recipientEmail: text("recipient_email").notNull(),
  recipientName: text("recipient_name"),
  ccRecipients: text("cc_recipients").array(),
  bccRecipients: text("bcc_recipients").array(),
  attachments: text("attachments").array(), // Array of file paths for attachments
  senderId: integer("sender_id"), // User who sent the email
  status: text("status").notNull(), // sent, failed, delivered, opened
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  leadId: integer("lead_id"), // If the email was sent to a lead
  studentId: integer("student_id"), // If the email was sent to a student
  titanMessageId: text("titan_message_id"), // Message ID returned by Titan API
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEmailHistorySchema = createInsertSchema(emailHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertEmailHistory = z.infer<typeof insertEmailHistorySchema>;
export type EmailHistory = typeof emailHistory.$inferSelect;



// Corporate Leads
export const corporateLeads = pgTable("corporate_leads", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  industry: text("industry"),
  website: text("website"),
  employeeCount: integer("employee_count"),
  annualRevenue: text("annual_revenue"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  primaryContactName: text("primary_contact_name").notNull(),
  primaryContactTitle: text("primary_contact_title"),
  primaryContactEmail: text("primary_contact_email"),
  primaryContactPhone: text("primary_contact_phone").notNull(),
  secondaryContactName: text("secondary_contact_name"),
  secondaryContactTitle: text("secondary_contact_title"),
  secondaryContactEmail: text("secondary_contact_email"),
  secondaryContactPhone: text("secondary_contact_phone"),
  leadSource: text("lead_source"), // website, referral, event, etc.
  leadStatus: text("lead_status").notNull().default("new"), // new, contacted, qualified, proposal, converted, closed
  priority: text("priority").default("medium"), // low, medium, high
  notes: text("notes"),
  requirements: text("requirements"),
  budget: text("budget"),
  timeframe: text("timeframe"),
  assignedTo: integer("assigned_to").notNull(),
  lastContactDate: timestamp("last_contact_date"),
  nextFollowUpDate: timestamp("next_follow_up_date"),
  tags: text("tags").array(),
  createdBy: integer("created_by").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCorporateLeadSchema = createInsertSchema(corporateLeads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCorporateLead = z.infer<typeof insertCorporateLeadSchema>;
export type CorporateLead = typeof corporateLeads.$inferSelect;

// Today's Posts & Status
export const crmPosts = pgTable("crm_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mediaUrl: text("media_url"), // URL to an image or video
  tags: text("tags").array(),
  category: text("category").notNull(), // motivational, promotional, informational, etc.
  postType: text("post_type").notNull(), // text, image, video, carousel
  isApproved: boolean("is_approved").default(false),
  approvedBy: integer("approved_by"),
  viewCount: integer("view_count").default(0),
  downloadCount: integer("download_count").default(0),
  shareCount: integer("share_count").default(0),
  expiryDate: timestamp("expiry_date"), // When the post should no longer be visible
  createdBy: integer("created_by").notNull(),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCrmPostSchema = createInsertSchema(crmPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  downloadCount: true,
  shareCount: true,
});

export type InsertCrmPost = z.infer<typeof insertCrmPostSchema>;
export type CrmPost = typeof crmPosts.$inferSelect;

// WhatsApp Message Templates
export const whatsAppTemplates = pgTable("whatsapp_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // meeting_invitation, follow_up, welcome, etc.
  variables: text("variables").array(), // Array of variables used in the template
  isApproved: boolean("is_approved").default(false),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWhatsAppTemplateSchema = createInsertSchema(whatsAppTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWhatsAppTemplate = z.infer<typeof insertWhatsAppTemplateSchema>;
export type WhatsAppTemplate = typeof whatsAppTemplates.$inferSelect;

// CRM Meetings
export const crmMeetings = pgTable("crm_meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  meetingType: text("meeting_type").notNull(), // in-person, virtual, phone
  meetingDate: timestamp("meeting_date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  location: text("location"),
  meetingLink: text("meeting_link"), // For virtual meetings
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled, rescheduled
  leadId: integer("lead_id"), // If meeting is with a regular lead
  corporateLeadId: integer("corporate_lead_id"), // If meeting is with a corporate lead
  attendees: text("attendees").array(), // Array of user IDs who will attend
  notes: text("notes"), // Notes before the meeting
  followUpNotes: text("follow_up_notes"), // Notes after the meeting
  outcome: text("outcome"), // Result of the meeting
  notificationSent: boolean("notification_sent").default(false), // Whether WhatsApp notification was sent
  notificationTemplateId: integer("notification_template_id"), // Which template was used
  reminderScheduled: boolean("reminder_scheduled").default(false), // Whether reminder is scheduled
  reminderSent: boolean("reminder_sent").default(false), // Whether reminder was sent
  assignedTo: integer("assigned_to").notNull(), // User responsible for the meeting
  createdBy: integer("created_by").notNull(),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCrmMeetingSchema = createInsertSchema(crmMeetings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  notificationSent: true,
  reminderSent: true,
});

export type InsertCrmMeeting = z.infer<typeof insertCrmMeetingSchema>;
export type CrmMeeting = typeof crmMeetings.$inferSelect;


// WhatsApp Chat Messages
export const whatsAppChats = pgTable("whatsapp_chats", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  direction: text("direction").notNull(), // incoming, outgoing
  content: text("content").notNull(),
  messageType: text("message_type").notNull().default("text"), // text, image, document, location
  mediaUrl: text("media_url"), // URL to media if message contains media
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  status: text("status").notNull().default("sent"), // sent, delivered, read, failed
  leadId: integer("lead_id"), // Associated lead if any
  corporateLeadId: integer("corporate_lead_id"), // Associated corporate lead if any
  meetingId: integer("meeting_id"), // Associated meeting if any
  templateId: integer("template_id"), // Template used if it was a template message
  sentBy: integer("sent_by"), // User who sent the message (for outgoing)
  sessionId: integer("session_id"), // Reference to chatbot session if automated
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWhatsAppChatSchema = createInsertSchema(whatsAppChats).omit({
  id: true,
  createdAt: true,
  timestamp: true,
});

export type InsertWhatsAppChat = z.infer<typeof insertWhatsAppChatSchema>;
export type WhatsAppChat = typeof whatsAppChats.$inferSelect;
