import {
  users, User, InsertUser,
  students, Student, InsertStudent,
  courses, Course, InsertCourse,
  trainers, Trainer, InsertTrainer,
  invoices, Invoice, InsertInvoice,
  schedules, Schedule, InsertSchedule,
  certificates, Certificate, InsertCertificate,
  quotations, Quotation, InsertQuotation,
  quotationItems, QuotationItem, InsertQuotationItem,
  proposals, Proposal, InsertProposal,
  leads, Lead, InsertLead,
  campaigns, Campaign, InsertCampaign,
  followUps, FollowUp, InsertFollowUp,
  whatsappSettings, WhatsappSettings, InsertWhatsappSettings,
  whatsappTemplates, WhatsappTemplate, InsertWhatsappTemplate,
  whatsappChats, WhatsappChat, InsertWhatsappChat,
  whatsappMessages, WhatsappMessage, InsertWhatsappMessage,
  titanEmailSettings, TitanEmailSettings, InsertTitanEmailSettings,
  emailTemplates, EmailTemplate, InsertEmailTemplate,
  emailHistory, EmailHistory, InsertEmailHistory,
  // CRM and WhatsApp features
  crmMeetings, CrmMeeting, InsertCrmMeeting,
  corporateLeads, CorporateLead, InsertCorporateLead,
  crmPosts, CrmPost, InsertCrmPost,
  whatsAppTemplates, WhatsAppTemplate, InsertWhatsAppTemplate,
  whatsAppChats, WhatsAppChat, InsertWhatsAppChat,
  // Registration courses
  registrationCourses, RegistrationCourse, InsertRegistrationCourse,
  // Chatbot related imports
  chatbotFlows, ChatbotFlow, InsertChatbotFlow,
  chatbotNodes, ChatbotNode, InsertChatbotNode,
  chatbotConditions, ChatbotCondition, InsertChatbotCondition,
  chatbotActions, ChatbotAction, InsertChatbotAction,
  chatbotSessions, ChatbotSession, InsertChatbotSession,
  cannedResponses, CannedResponse, InsertCannedResponse
} from "@shared/schema";
import { db } from "./db";
import { eq, and, asc, desc, gte, lte, lt, sql } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Storage interface
export interface IStorage {
  // Session store
  sessionStore: any;
  
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Institute settings
  getInstitute(): Promise<any>;
  updateInstitute(settings: any): Promise<any>;
  
  // Students
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  getStudentByRegisterLink(token: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<Student>): Promise<Student | undefined>;
  
  // Registration Courses
  getRegistrationCourses(studentId: number): Promise<RegistrationCourse[]>;
  getRegistrationCourse(id: number): Promise<RegistrationCourse | undefined>;
  createRegistrationCourse(course: InsertRegistrationCourse): Promise<RegistrationCourse>;
  deleteRegistrationCourse(id: number): Promise<boolean>;
  
  // Courses
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  
  // Trainers
  getTrainers(): Promise<Trainer[]>;
  getTrainer(id: number): Promise<Trainer | undefined>;
  createTrainer(trainer: InsertTrainer): Promise<Trainer>;
  updateTrainer(id: number, trainer: Partial<Trainer>): Promise<Trainer | undefined>;
  deleteTrainer(id: number): Promise<boolean>;
  
  // Invoices
  getInvoices(): Promise<Invoice[]>;
  getInvoicesByStudentId(studentId: number): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  
  // Schedules
  getSchedules(): Promise<Schedule[]>;
  getSchedule(id: number): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, schedule: Partial<Schedule>): Promise<Schedule | undefined>;
  deleteSchedule(id: number): Promise<boolean>;
  
  // Certificates
  getCertificates(): Promise<Certificate[]>;
  getCertificatesByStudentId(studentId: number): Promise<Certificate[]>;
  getCertificate(id: number): Promise<Certificate | undefined>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  
  // Quotations
  getQuotations(): Promise<Quotation[]>;
  getQuotation(id: number): Promise<Quotation | undefined>;
  createQuotation(quotation: InsertQuotation): Promise<Quotation>;
  updateQuotation(id: number, quotation: Partial<Quotation>): Promise<Quotation | undefined>;
  
  // Quotation Items
  getQuotationItems(quotationId: number): Promise<QuotationItem[]>;
  getQuotationItem(id: number): Promise<QuotationItem | undefined>;
  createQuotationItem(item: InsertQuotationItem): Promise<QuotationItem>;
  updateQuotationItem(id: number, item: Partial<QuotationItem>): Promise<QuotationItem | undefined>;
  deleteQuotationItem(id: number): Promise<boolean>;
  
  // Proposals
  getProposals(): Promise<Proposal[]>;
  getProposal(id: number): Promise<Proposal | undefined>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposal(id: number, proposal: Partial<Proposal>): Promise<Proposal | undefined>;
  
  // CRM - Leads
  getLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  getLeadsByConsultant(consultantId: number): Promise<Lead[]>;
  getLeadsByStatus(status: string): Promise<Lead[]>;
  getLeadsByPriority(priority: string): Promise<Lead[]>;
  getLeadsDueForFollowUp(date?: Date): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<Lead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  
  // CRM - Campaigns
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignsByPlatform(platform: string): Promise<Campaign[]>;
  getActiveCampaigns(): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;
  
  // CRM - Follow Ups
  getFollowUps(): Promise<FollowUp[]>;
  getFollowUpsByLeadId(leadId: number): Promise<FollowUp[]>;
  getFollowUpsByConsultant(consultantId: number): Promise<FollowUp[]>;
  getPendingFollowUps(): Promise<FollowUp[]>;
  getTodaysFollowUps(consultantId?: number): Promise<FollowUp[]>;
  getHighPriorityFollowUps(consultantId?: number): Promise<FollowUp[]>;
  getFollowUpsToNotify(): Promise<FollowUp[]>;
  getFollowUp(id: number): Promise<FollowUp | undefined>;
  createFollowUp(followUp: InsertFollowUp): Promise<FollowUp>;
  updateFollowUp(id: number, followUp: Partial<FollowUp>): Promise<FollowUp | undefined>;
  markFollowUpAsNotified(id: number): Promise<FollowUp | undefined>;
  deleteFollowUp(id: number): Promise<boolean>;
  
  // WhatsApp API Settings
  getWhatsappSettings(): Promise<WhatsappSettings | undefined>;
  createWhatsappSettings(settings: InsertWhatsappSettings): Promise<WhatsappSettings>;
  updateWhatsappSettings(id: number, settings: Partial<WhatsappSettings>): Promise<WhatsappSettings | undefined>;
  
  // WhatsApp Templates
  getWhatsappTemplates(): Promise<WhatsappTemplate[]>;
  getWhatsappTemplate(id: number): Promise<WhatsappTemplate | undefined>;
  createWhatsappTemplate(template: InsertWhatsappTemplate): Promise<WhatsappTemplate>;
  updateWhatsappTemplate(id: number, template: Partial<WhatsappTemplate>): Promise<WhatsappTemplate | undefined>;
  deleteWhatsappTemplate(id: number): Promise<boolean>;
  
  // WhatsApp Chats
  getWhatsappChats(): Promise<WhatsappChat[]>;
  getWhatsappChat(id: number): Promise<WhatsappChat | undefined>;
  getWhatsappChatsByConsultantId(consultantId: number): Promise<WhatsappChat[]>;
  createWhatsappChat(chat: InsertWhatsappChat): Promise<WhatsappChat>;
  updateWhatsappChat(id: number, chat: Partial<WhatsappChat>): Promise<WhatsappChat | undefined>;
  
  // WhatsApp Messages
  getWhatsappMessagesByChatId(chatId: number): Promise<WhatsappMessage[]>;
  createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage>;
  
  // CRM Meetings
  getCrmMeetings(): Promise<CrmMeeting[]>;
  getCrmMeetingsByLeadId(leadId: number): Promise<CrmMeeting[]>;
  getCrmMeetingsByCorporateLeadId(corporateLeadId: number): Promise<CrmMeeting[]>;
  getCrmMeetingsByAssignedTo(userId: number): Promise<CrmMeeting[]>;
  getCrmMeetingsByDate(date: Date): Promise<CrmMeeting[]>;
  getCrmMeetingsByStatus(status: string): Promise<CrmMeeting[]>;
  getCrmMeeting(id: number): Promise<CrmMeeting | undefined>;
  createCrmMeeting(meeting: InsertCrmMeeting): Promise<CrmMeeting>;
  updateCrmMeeting(id: number, meeting: Partial<CrmMeeting>): Promise<CrmMeeting | undefined>;
  deleteCrmMeeting(id: number): Promise<boolean>;
  markMeetingNotificationSent(id: number): Promise<CrmMeeting | undefined>;
  markMeetingReminderSent(id: number): Promise<CrmMeeting | undefined>;
  
  // Corporate Leads
  getCorporateLeads(): Promise<CorporateLead[]>;
  getCorporateLeadsByConsultant(consultantId: number): Promise<CorporateLead[]>;
  getCorporateLeadsByStatus(status: string): Promise<CorporateLead[]>;
  getCorporateLeadsByPriority(priority: string): Promise<CorporateLead[]>;
  getCorporateLead(id: number): Promise<CorporateLead | undefined>;
  createCorporateLead(lead: InsertCorporateLead): Promise<CorporateLead>;
  updateCorporateLead(id: number, lead: Partial<CorporateLead>): Promise<CorporateLead | undefined>;
  deleteCorporateLead(id: number): Promise<boolean>;
  
  // Today's Posts and Status
  getCrmPosts(): Promise<CrmPost[]>;
  getCrmPostsByCategory(category: string): Promise<CrmPost[]>;
  getCrmPostsByCreator(userId: number): Promise<CrmPost[]>;
  getCrmPostsByTags(tags: string[]): Promise<CrmPost[]>;
  getCrmPost(id: number): Promise<CrmPost | undefined>;
  createCrmPost(post: InsertCrmPost): Promise<CrmPost>;
  updateCrmPost(id: number, post: Partial<CrmPost>): Promise<CrmPost | undefined>;
  deleteCrmPost(id: number): Promise<boolean>;
  incrementCrmPostViewCount(id: number): Promise<CrmPost | undefined>;
  incrementCrmPostDownloadCount(id: number): Promise<CrmPost | undefined>;
  incrementCrmPostShareCount(id: number): Promise<CrmPost | undefined>;
  approveCrmPost(id: number, approvedBy: number): Promise<CrmPost | undefined>;
  
  // WhatsApp Integration (new format)
  getWhatsAppTemplates(): Promise<WhatsAppTemplate[]>;
  getWhatsAppTemplatesByCategory(category: string): Promise<WhatsAppTemplate[]>;
  getWhatsAppTemplate(id: number): Promise<WhatsAppTemplate | undefined>;
  createWhatsAppTemplate(template: InsertWhatsAppTemplate): Promise<WhatsAppTemplate>;
  updateWhatsAppTemplate(id: number, template: Partial<WhatsAppTemplate>): Promise<WhatsAppTemplate | undefined>;
  deleteWhatsAppTemplate(id: number): Promise<boolean>;
  
  // WhatsApp Chats (new format)
  getWhatsAppChats(): Promise<WhatsAppChat[]>;
  getWhatsAppChatsByPhoneNumber(phoneNumber: string): Promise<WhatsAppChat[]>;
  getWhatsAppChatsByLead(leadId: number): Promise<WhatsAppChat[]>;
  getWhatsAppChatsByCorporateLead(corporateLeadId: number): Promise<WhatsAppChat[]>;
  getWhatsAppChatsByMeeting(meetingId: number): Promise<WhatsAppChat[]>;
  getWhatsAppChat(id: number): Promise<WhatsAppChat | undefined>;
  createWhatsAppChat(chat: InsertWhatsAppChat): Promise<WhatsAppChat>;
  updateWhatsAppChatStatus(id: number, status: string): Promise<WhatsAppChat | undefined>;
  
  // Titan Email Settings
  getTitanEmailSettings(): Promise<TitanEmailSettings | undefined>;
  createTitanEmailSettings(settings: InsertTitanEmailSettings): Promise<TitanEmailSettings>;
  updateTitanEmailSettings(id: number, settings: Partial<TitanEmailSettings>): Promise<TitanEmailSettings | undefined>;
  testEmailConnection(settings: Partial<TitanEmailSettings>): Promise<boolean>;
  
  // Email Templates
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplate(id: number): Promise<EmailTemplate | undefined>;
  getEmailTemplatesByCategory(category: string): Promise<EmailTemplate[]>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, template: Partial<EmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: number): Promise<boolean>;
  
  // Email History
  getEmailHistory(): Promise<EmailHistory[]>;
  getEmailHistoryByLeadId(leadId: number): Promise<EmailHistory[]>;
  getEmailHistoryByStudentId(studentId: number): Promise<EmailHistory[]>;
  createEmailHistory(email: InsertEmailHistory): Promise<EmailHistory>;
  
  // Registration Courses
  getRegistrationCourses(studentId: number): Promise<RegistrationCourse[]>;
  getRegistrationCourse(id: number): Promise<RegistrationCourse | undefined>;
  createRegistrationCourse(course: InsertRegistrationCourse): Promise<RegistrationCourse>;
  deleteRegistrationCourse(id: number): Promise<boolean>;
  
  // Chatbot Flows
  getChatbotFlows(): Promise<ChatbotFlow[]>;
  getChatbotFlowsByConsultant(consultantId: number): Promise<ChatbotFlow[]>;
  getChatbotFlow(id: number): Promise<ChatbotFlow | undefined>;
  getChatbotFlowByKeyword(keyword: string): Promise<ChatbotFlow | undefined>;
  getDefaultChatbotFlow(): Promise<ChatbotFlow | undefined>;
  createChatbotFlow(flow: InsertChatbotFlow): Promise<ChatbotFlow>;
  updateChatbotFlow(id: number, flow: Partial<ChatbotFlow>): Promise<ChatbotFlow | undefined>;
  deleteChatbotFlow(id: number): Promise<boolean>;
  
  // Chatbot Nodes
  getChatbotNodes(flowId: number): Promise<ChatbotNode[]>;
  getChatbotNode(id: number): Promise<ChatbotNode | undefined>;
  createChatbotNode(node: InsertChatbotNode): Promise<ChatbotNode>;
  updateChatbotNode(id: number, node: Partial<ChatbotNode>): Promise<ChatbotNode | undefined>;
  deleteChatbotNode(id: number): Promise<boolean>;
  
  // Chatbot Conditions
  getChatbotConditionsByNode(nodeId: number): Promise<ChatbotCondition[]>;
  createChatbotCondition(condition: InsertChatbotCondition): Promise<ChatbotCondition>;
  updateChatbotCondition(id: number, condition: Partial<ChatbotCondition>): Promise<ChatbotCondition | undefined>;
  deleteChatbotCondition(id: number): Promise<boolean>;
  
  // Chatbot Actions
  getChatbotActionsByNode(nodeId: number): Promise<ChatbotAction[]>;
  createChatbotAction(action: InsertChatbotAction): Promise<ChatbotAction>;
  updateChatbotAction(id: number, action: Partial<ChatbotAction>): Promise<ChatbotAction | undefined>;
  deleteChatbotAction(id: number): Promise<boolean>;
  
  // Chatbot Sessions
  getChatbotSessions(): Promise<ChatbotSession[]>;
  getChatbotSessionsByChat(chatId: number): Promise<ChatbotSession[]>;
  getChatbotActiveSession(chatId: number): Promise<ChatbotSession | undefined>;
  createChatbotSession(session: InsertChatbotSession): Promise<ChatbotSession>;
  updateChatbotSession(id: number, session: Partial<ChatbotSession>): Promise<ChatbotSession | undefined>;
  endChatbotSession(id: number): Promise<ChatbotSession | undefined>;
  
  // Canned Responses
  getCannedResponses(): Promise<CannedResponse[]>;
  getCannedResponsesByConsultant(consultantId: number): Promise<CannedResponse[]>;
  getCannedResponseByShortcut(shortcut: string, consultantId: number): Promise<CannedResponse | undefined>;
  createCannedResponse(response: InsertCannedResponse): Promise<CannedResponse>;
  updateCannedResponse(id: number, response: Partial<CannedResponse>): Promise<CannedResponse | undefined>;
  deleteCannedResponse(id: number): Promise<boolean>;
}

// Memory Storage implementation
export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private studentsMap: Map<number, Student>;
  private coursesMap: Map<number, Course>;
  private trainersMap: Map<number, Trainer>;
  private invoicesMap: Map<number, Invoice>;
  private schedulesMap: Map<number, Schedule>;
  private certificatesMap: Map<number, Certificate>;
  private quotationsMap: Map<number, Quotation>;
  private quotationItemsMap: Map<number, QuotationItem>;
  private proposalsMap: Map<number, Proposal>;
  private leadsMap: Map<number, Lead>;
  private campaignsMap: Map<number, Campaign>;
  private followUpsMap: Map<number, FollowUp>;
  private whatsappSettingsMap: Map<number, WhatsappSettings>;
  private whatsappTemplatesMap: Map<number, WhatsappTemplate>;
  private whatsappChatsMap: Map<number, WhatsappChat>;
  private whatsappMessagesMap: Map<number, WhatsappMessage>;
  private titanEmailSettingsMap: Map<number, TitanEmailSettings>;
  private registrationCoursesMap: Map<number, RegistrationCourse>;
  private emailTemplatesMap: Map<number, EmailTemplate>;
  private emailHistoryMap: Map<number, EmailHistory>;
  private chatbotFlowsMap: Map<number, ChatbotFlow>;
  private chatbotNodesMap: Map<number, ChatbotNode>;
  private chatbotConditionsMap: Map<number, ChatbotCondition>;
  private chatbotActionsMap: Map<number, ChatbotAction>;
  private chatbotSessionsMap: Map<number, ChatbotSession>;
  private cannedResponsesMap: Map<number, CannedResponse>;
  
  // New CRM and WhatsApp features
  private crmMeetingsMap: Map<number, CrmMeeting>;
  private corporateLeadsMap: Map<number, CorporateLead>;
  private crmPostsMap: Map<number, CrmPost>;
  private whatsAppTemplatesMap: Map<number, WhatsAppTemplate>;
  private whatsAppChatsMap: Map<number, WhatsAppChat>;
  
  private userId: number = 1;
  private studentId: number = 1;
  private courseId: number = 1;
  private trainerId: number = 1;
  private invoiceId: number = 1;
  private scheduleId: number = 1;
  private certificateId: number = 1;
  private quotationId: number = 1;
  private quotationItemId: number = 1;
  private proposalId: number = 1;
  private leadId: number = 1;
  private campaignId: number = 1;
  private followUpId: number = 1;
  private whatsappSettingsId: number = 1;
  private whatsappTemplateId: number = 1;
  private whatsappChatId: number = 1;
  private whatsappMessageId: number = 1;
  private titanEmailSettingsId: number = 1;
  private emailTemplateId: number = 1;
  private emailHistoryId: number = 1;
  private chatbotFlowId: number = 1;
  private chatbotNodeId: number = 1;
  private chatbotConditionId: number = 1;
  private chatbotActionId: number = 1;
  private chatbotSessionId: number = 1;
  private cannedResponseId: number = 1;
  
  // New IDs for the CRM and WhatsApp features
  private crmMeetingId: number = 1;
  private corporateLeadId: number = 1;
  private crmPostId: number = 1;
  private whatsAppTemplateId: number = 1;
  private whatsAppChatId: number = 1;
  private registrationCourseId: number = 1;
  
  sessionStore: any;

  constructor() {
    this.usersMap = new Map();
    this.studentsMap = new Map();
    this.coursesMap = new Map();
    this.trainersMap = new Map();
    this.invoicesMap = new Map();
    this.schedulesMap = new Map();
    this.certificatesMap = new Map();
    this.quotationsMap = new Map();
    this.quotationItemsMap = new Map();
    this.proposalsMap = new Map();
    this.leadsMap = new Map();
    this.campaignsMap = new Map();
    this.followUpsMap = new Map();
    this.whatsappSettingsMap = new Map();
    this.whatsappTemplatesMap = new Map();
    this.whatsappChatsMap = new Map();
    this.whatsappMessagesMap = new Map();
    this.titanEmailSettingsMap = new Map();
    this.emailTemplatesMap = new Map();
    this.emailHistoryMap = new Map();
    this.chatbotFlowsMap = new Map();
    this.chatbotNodesMap = new Map();
    this.chatbotConditionsMap = new Map();
    this.chatbotActionsMap = new Map();
    this.chatbotSessionsMap = new Map();
    this.cannedResponsesMap = new Map();
    this.registrationCoursesMap = new Map();
    
    // Initialize new CRM and WhatsApp feature maps
    this.crmMeetingsMap = new Map();
    this.corporateLeadsMap = new Map();
    this.crmPostsMap = new Map();
    this.whatsAppTemplatesMap = new Map();
    this.whatsAppChatsMap = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize with sample data
    this.initializeData();
  }
  
  private initializeData() {
    // Add a default admin user with pre-hashed password
    const adminUser: User = {
      id: this.userId++,
      username: "admin",
      password: "48e1764216295a7dd6154b61ccd8e3260b2cc67bd14dc04bae3f583e63779c885d337094d9aa063ce399b2e76efe42891aa210f8fbe6fa702fc51125bf8d7267.e034e67f101c48dede83a2920fe39c76", // hashed 'password'
      role: "admin",
      fullName: "Admin User",
      email: "admin@orbitinstitute.com",
      phone: "+91 1234567890"
    };
    this.usersMap.set(adminUser.id, adminUser);
    
    // Add a super admin user with pre-hashed password
    const superAdminUser: User = {
      id: this.userId++,
      username: "superadmin",
      password: "48e1764216295a7dd6154b61ccd8e3260b2cc67bd14dc04bae3f583e63779c885d337094d9aa063ce399b2e76efe42891aa210f8fbe6fa702fc51125bf8d7267.e034e67f101c48dede83a2920fe39c76", // hashed 'password'
      role: "superadmin",
      fullName: "Super Admin",
      email: "superadmin@orbitinstitute.com",
      phone: "+91 9876543210"
    };
    this.usersMap.set(superAdminUser.id, superAdminUser);
  }

  // Users methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { 
      ...user, 
      id, 
      role: user.role || "counselor",
      email: user.email || null,
      phone: user.phone || null 
    };
    this.usersMap.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const existingUser = this.usersMap.get(id);
    if (!existingUser) return undefined;

    const updatedUser = { ...existingUser, ...user };
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.usersMap.delete(id);
  }
  
  // Institute settings methods
  private institute = {
    name: "Orbit Institute",
    address: "Sheikh Zayed Road, Dubai, UAE",
    phone: "+971 4 123 4567",
    email: "info@orbitinstitute.com",
    website: "www.orbitinstitute.com",
    logo: "/logo.png"
  };
  
  async getInstitute(): Promise<any> {
    return this.institute;
  }
  
  async updateInstitute(settings: any): Promise<any> {
    this.institute = { ...this.institute, ...settings };
    return this.institute;
  }

  // Students methods
  async getStudents(): Promise<Student[]> {
    return Array.from(this.studentsMap.values());
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.studentsMap.get(id);
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    return Array.from(this.studentsMap.values()).find(
      (student) => student.studentId === studentId
    );
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const id = this.studentId++;
    const newStudent: Student = { ...student, id, createdAt: new Date() };
    this.studentsMap.set(id, newStudent);
    return newStudent;
  }

  async updateStudent(id: number, student: Partial<Student>): Promise<Student | undefined> {
    const existingStudent = this.studentsMap.get(id);
    if (!existingStudent) return undefined;

    const updatedStudent = { ...existingStudent, ...student };
    this.studentsMap.set(id, updatedStudent);
    return updatedStudent;
  }

  // Courses methods
  async getCourses(): Promise<Course[]> {
    return Array.from(this.coursesMap.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.coursesMap.get(id);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.courseId++;
    const newCourse: Course = { ...course, id, createdAt: new Date() };
    this.coursesMap.set(id, newCourse);
    return newCourse;
  }

  async updateCourse(id: number, course: Partial<Course>): Promise<Course | undefined> {
    const existingCourse = this.coursesMap.get(id);
    if (!existingCourse) return undefined;

    const updatedCourse = { ...existingCourse, ...course };
    this.coursesMap.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<boolean> {
    return this.coursesMap.delete(id);
  }

  // Trainers methods
  async getTrainers(): Promise<Trainer[]> {
    return Array.from(this.trainersMap.values());
  }

  async getTrainer(id: number): Promise<Trainer | undefined> {
    return this.trainersMap.get(id);
  }

  async createTrainer(trainer: InsertTrainer): Promise<Trainer> {
    const id = this.trainerId++;
    const newTrainer: Trainer = { ...trainer, id, createdAt: new Date() };
    this.trainersMap.set(id, newTrainer);
    return newTrainer;
  }

  async updateTrainer(id: number, trainer: Partial<Trainer>): Promise<Trainer | undefined> {
    const existingTrainer = this.trainersMap.get(id);
    if (!existingTrainer) return undefined;

    const updatedTrainer = { ...existingTrainer, ...trainer };
    this.trainersMap.set(id, updatedTrainer);
    return updatedTrainer;
  }

  async deleteTrainer(id: number): Promise<boolean> {
    return this.trainersMap.delete(id);
  }

  // Invoices methods
  async getInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoicesMap.values());
  }

  async getInvoicesByStudentId(studentId: number): Promise<Invoice[]> {
    return Array.from(this.invoicesMap.values()).filter(
      (invoice) => invoice.studentId === studentId
    );
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoicesMap.get(id);
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceId++;
    const newInvoice: Invoice = { ...invoice, id, createdAt: new Date() };
    this.invoicesMap.set(id, newInvoice);
    return newInvoice;
  }

  // Schedules methods
  async getSchedules(): Promise<Schedule[]> {
    return Array.from(this.schedulesMap.values());
  }

  async getSchedule(id: number): Promise<Schedule | undefined> {
    return this.schedulesMap.get(id);
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const id = this.scheduleId++;
    const newSchedule: Schedule = { ...schedule, id, createdAt: new Date() };
    this.schedulesMap.set(id, newSchedule);
    return newSchedule;
  }
  
  // Registration Courses methods
  async getRegistrationCourses(studentId: number): Promise<RegistrationCourse[]> {
    return Array.from(this.registrationCoursesMap.values())
      .filter(course => course.studentId === studentId);
  }
  
  async getRegistrationCourse(id: number): Promise<RegistrationCourse | undefined> {
    return this.registrationCoursesMap.get(id);
  }
  
  async createRegistrationCourse(course: InsertRegistrationCourse): Promise<RegistrationCourse> {
    const id = this.registrationCourseId++;
    const newCourse: RegistrationCourse = { ...course, id, createdAt: new Date() };
    this.registrationCoursesMap.set(id, newCourse);
    return newCourse;
  }
  
  async deleteRegistrationCourse(id: number): Promise<boolean> {
    return this.registrationCoursesMap.delete(id);
  }

  async updateSchedule(id: number, schedule: Partial<Schedule>): Promise<Schedule | undefined> {
    const existingSchedule = this.schedulesMap.get(id);
    if (!existingSchedule) return undefined;

    const updatedSchedule = { ...existingSchedule, ...schedule };
    this.schedulesMap.set(id, updatedSchedule);
    return updatedSchedule;
  }

  async deleteSchedule(id: number): Promise<boolean> {
    return this.schedulesMap.delete(id);
  }

  // Certificates methods
  async getCertificates(): Promise<Certificate[]> {
    return Array.from(this.certificatesMap.values());
  }

  async getCertificatesByStudentId(studentId: number): Promise<Certificate[]> {
    return Array.from(this.certificatesMap.values()).filter(
      (certificate) => certificate.studentId === studentId
    );
  }

  async getCertificate(id: number): Promise<Certificate | undefined> {
    return this.certificatesMap.get(id);
  }

  async createCertificate(certificate: InsertCertificate): Promise<Certificate> {
    const id = this.certificateId++;
    const newCertificate: Certificate = { ...certificate, id, createdAt: new Date() };
    this.certificatesMap.set(id, newCertificate);
    return newCertificate;
  }

  // Quotations methods
  async getQuotations(): Promise<Quotation[]> {
    return Array.from(this.quotationsMap.values());
  }

  async getQuotation(id: number): Promise<Quotation | undefined> {
    return this.quotationsMap.get(id);
  }

  async createQuotation(quotation: InsertQuotation): Promise<Quotation> {
    const id = this.quotationId++;
    const newQuotation: Quotation = { ...quotation, id, createdAt: new Date() };
    this.quotationsMap.set(id, newQuotation);
    return newQuotation;
  }

  async updateQuotation(id: number, quotation: Partial<Quotation>): Promise<Quotation | undefined> {
    const existingQuotation = this.quotationsMap.get(id);
    if (!existingQuotation) return undefined;

    const updatedQuotation = { ...existingQuotation, ...quotation };
    this.quotationsMap.set(id, updatedQuotation);
    return updatedQuotation;
  }
  
  // Quotation Items methods
  async getQuotationItems(quotationId: number): Promise<QuotationItem[]> {
    return Array.from(this.quotationItemsMap.values()).filter(
      (item) => item.quotationId === quotationId
    );
  }

  async getQuotationItem(id: number): Promise<QuotationItem | undefined> {
    return this.quotationItemsMap.get(id);
  }

  async createQuotationItem(item: InsertQuotationItem): Promise<QuotationItem> {
    const id = this.quotationItemId++;
    const newItem: QuotationItem = { ...item, id, createdAt: new Date() };
    this.quotationItemsMap.set(id, newItem);
    return newItem;
  }

  async updateQuotationItem(id: number, item: Partial<QuotationItem>): Promise<QuotationItem | undefined> {
    const existingItem = this.quotationItemsMap.get(id);
    if (!existingItem) return undefined;

    const updatedItem = { ...existingItem, ...item };
    this.quotationItemsMap.set(id, updatedItem);
    return updatedItem;
  }

  async deleteQuotationItem(id: number): Promise<boolean> {
    return this.quotationItemsMap.delete(id);
  }

  // Proposals methods
  async getProposals(): Promise<Proposal[]> {
    return Array.from(this.proposalsMap.values());
  }

  async getProposal(id: number): Promise<Proposal | undefined> {
    return this.proposalsMap.get(id);
  }

  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    const id = this.proposalId++;
    const newProposal: Proposal = { ...proposal, id, createdAt: new Date() };
    this.proposalsMap.set(id, newProposal);
    return newProposal;
  }

  async updateProposal(id: number, proposal: Partial<Proposal>): Promise<Proposal | undefined> {
    const existingProposal = this.proposalsMap.get(id);
    if (!existingProposal) return undefined;

    const updatedProposal = { ...existingProposal, ...proposal };
    this.proposalsMap.set(id, updatedProposal);
    return updatedProposal;
  }
  
  // CRM Meetings methods
  async getCrmMeetings(): Promise<CrmMeeting[]> {
    return Array.from(this.crmMeetingsMap.values())
      .sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
  }

  async getCrmMeetingsByLeadId(leadId: number): Promise<CrmMeeting[]> {
    return Array.from(this.crmMeetingsMap.values())
      .filter(meeting => meeting.leadId === leadId)
      .sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
  }

  async getCrmMeetingsByCorporateLeadId(corporateLeadId: number): Promise<CrmMeeting[]> {
    return Array.from(this.crmMeetingsMap.values())
      .filter(meeting => meeting.corporateLeadId === corporateLeadId)
      .sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
  }

  async getCrmMeetingsByAssignedTo(userId: number): Promise<CrmMeeting[]> {
    return Array.from(this.crmMeetingsMap.values())
      .filter(meeting => meeting.assignedTo === userId)
      .sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
  }

  async getCrmMeetingsByDate(date: Date): Promise<CrmMeeting[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return Array.from(this.crmMeetingsMap.values())
      .filter(meeting => {
        const meetingDate = new Date(meeting.meetingDate);
        return meetingDate >= startOfDay && meetingDate <= endOfDay;
      })
      .sort((a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime());
  }

  async getCrmMeetingsByStatus(status: string): Promise<CrmMeeting[]> {
    return Array.from(this.crmMeetingsMap.values())
      .filter(meeting => meeting.status === status)
      .sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
  }

  async getCrmMeeting(id: number): Promise<CrmMeeting | undefined> {
    return this.crmMeetingsMap.get(id);
  }

  async createCrmMeeting(meeting: InsertCrmMeeting): Promise<CrmMeeting> {
    const id = this.crmMeetingId++;
    const newMeeting: CrmMeeting = { 
      ...meeting, 
      id, 
      notificationSent: false,
      reminderSent: false,
      createdAt: new Date(),
      updatedAt: new Date() 
    };
    this.crmMeetingsMap.set(id, newMeeting);
    return newMeeting;
  }

  async updateCrmMeeting(id: number, meeting: Partial<CrmMeeting>): Promise<CrmMeeting | undefined> {
    const existingMeeting = this.crmMeetingsMap.get(id);
    if (!existingMeeting) return undefined;

    const updatedMeeting = { 
      ...existingMeeting, 
      ...meeting,
      updatedAt: new Date()
    };
    this.crmMeetingsMap.set(id, updatedMeeting);
    return updatedMeeting;
  }

  async deleteCrmMeeting(id: number): Promise<boolean> {
    return this.crmMeetingsMap.delete(id);
  }

  async markMeetingNotificationSent(id: number): Promise<CrmMeeting | undefined> {
    const meeting = this.crmMeetingsMap.get(id);
    if (!meeting) return undefined;
    
    const updatedMeeting = { 
      ...meeting, 
      notificationSent: true,
      updatedAt: new Date()
    };
    this.crmMeetingsMap.set(id, updatedMeeting);
    return updatedMeeting;
  }

  async markMeetingReminderSent(id: number): Promise<CrmMeeting | undefined> {
    const meeting = this.crmMeetingsMap.get(id);
    if (!meeting) return undefined;
    
    const updatedMeeting = { 
      ...meeting, 
      reminderSent: true,
      updatedAt: new Date()
    };
    this.crmMeetingsMap.set(id, updatedMeeting);
    return updatedMeeting;
  }

  // Corporate Leads methods
  async getCorporateLeads(): Promise<CorporateLead[]> {
    return Array.from(this.corporateLeadsMap.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCorporateLeadsByConsultant(consultantId: number): Promise<CorporateLead[]> {
    return Array.from(this.corporateLeadsMap.values())
      .filter(lead => lead.assignedTo === consultantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCorporateLeadsByStatus(status: string): Promise<CorporateLead[]> {
    return Array.from(this.corporateLeadsMap.values())
      .filter(lead => lead.leadStatus === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCorporateLeadsByPriority(priority: string): Promise<CorporateLead[]> {
    return Array.from(this.corporateLeadsMap.values())
      .filter(lead => lead.priority === priority)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCorporateLead(id: number): Promise<CorporateLead | undefined> {
    return this.corporateLeadsMap.get(id);
  }

  async createCorporateLead(lead: InsertCorporateLead): Promise<CorporateLead> {
    const id = this.corporateLeadId++;
    const newLead: CorporateLead = { 
      ...lead, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.corporateLeadsMap.set(id, newLead);
    return newLead;
  }

  async updateCorporateLead(id: number, lead: Partial<CorporateLead>): Promise<CorporateLead | undefined> {
    const existingLead = this.corporateLeadsMap.get(id);
    if (!existingLead) return undefined;

    const updatedLead = { 
      ...existingLead, 
      ...lead,
      updatedAt: new Date()
    };
    this.corporateLeadsMap.set(id, updatedLead);
    return updatedLead;
  }

  async deleteCorporateLead(id: number): Promise<boolean> {
    return this.corporateLeadsMap.delete(id);
  }

  // Today's Posts methods
  async getCrmPosts(): Promise<CrmPost[]> {
    return Array.from(this.crmPostsMap.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCrmPostsByCategory(category: string): Promise<CrmPost[]> {
    return Array.from(this.crmPostsMap.values())
      .filter(post => post.category === category)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCrmPostsByCreator(userId: number): Promise<CrmPost[]> {
    return Array.from(this.crmPostsMap.values())
      .filter(post => post.createdBy === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCrmPostsByTags(tags: string[]): Promise<CrmPost[]> {
    return Array.from(this.crmPostsMap.values())
      .filter(post => post.tags && post.tags.some(tag => tags.includes(tag)))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCrmPost(id: number): Promise<CrmPost | undefined> {
    return this.crmPostsMap.get(id);
  }

  async createCrmPost(post: InsertCrmPost): Promise<CrmPost> {
    const id = this.crmPostId++;
    const newPost: CrmPost = { 
      ...post, 
      id, 
      viewCount: 0,
      downloadCount: 0,
      shareCount: 0,
      isApproved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.crmPostsMap.set(id, newPost);
    return newPost;
  }

  async updateCrmPost(id: number, post: Partial<CrmPost>): Promise<CrmPost | undefined> {
    const existingPost = this.crmPostsMap.get(id);
    if (!existingPost) return undefined;

    const updatedPost = { 
      ...existingPost, 
      ...post,
      updatedAt: new Date()
    };
    this.crmPostsMap.set(id, updatedPost);
    return updatedPost;
  }

  async deleteCrmPost(id: number): Promise<boolean> {
    return this.crmPostsMap.delete(id);
  }

  async incrementCrmPostViewCount(id: number): Promise<CrmPost | undefined> {
    const post = this.crmPostsMap.get(id);
    if (!post) return undefined;
    
    const updatedPost = { 
      ...post, 
      viewCount: (post.viewCount || 0) + 1,
      updatedAt: new Date()
    };
    this.crmPostsMap.set(id, updatedPost);
    return updatedPost;
  }

  async incrementCrmPostDownloadCount(id: number): Promise<CrmPost | undefined> {
    const post = this.crmPostsMap.get(id);
    if (!post) return undefined;
    
    const updatedPost = { 
      ...post, 
      downloadCount: (post.downloadCount || 0) + 1,
      updatedAt: new Date()
    };
    this.crmPostsMap.set(id, updatedPost);
    return updatedPost;
  }

  async incrementCrmPostShareCount(id: number): Promise<CrmPost | undefined> {
    const post = this.crmPostsMap.get(id);
    if (!post) return undefined;
    
    const updatedPost = { 
      ...post, 
      shareCount: (post.shareCount || 0) + 1,
      updatedAt: new Date()
    };
    this.crmPostsMap.set(id, updatedPost);
    return updatedPost;
  }

  async approveCrmPost(id: number, approvedBy: number): Promise<CrmPost | undefined> {
    const post = this.crmPostsMap.get(id);
    if (!post) return undefined;
    
    const updatedPost = { 
      ...post, 
      isApproved: true,
      approvedBy,
      updatedAt: new Date()
    };
    this.crmPostsMap.set(id, updatedPost);
    return updatedPost;
  }

  // WhatsApp Templates (new format)
  async getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
    return Array.from(this.whatsAppTemplatesMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getWhatsAppTemplatesByCategory(category: string): Promise<WhatsAppTemplate[]> {
    return Array.from(this.whatsAppTemplatesMap.values())
      .filter(template => template.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getWhatsAppTemplate(id: number): Promise<WhatsAppTemplate | undefined> {
    return this.whatsAppTemplatesMap.get(id);
  }

  async createWhatsAppTemplate(template: InsertWhatsAppTemplate): Promise<WhatsAppTemplate> {
    const id = this.whatsAppTemplateId++;
    const newTemplate: WhatsAppTemplate = {
      ...template,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.whatsAppTemplatesMap.set(id, newTemplate);
    return newTemplate;
  }

  async updateWhatsAppTemplate(id: number, template: Partial<WhatsAppTemplate>): Promise<WhatsAppTemplate | undefined> {
    const existingTemplate = this.whatsAppTemplatesMap.get(id);
    if (!existingTemplate) return undefined;

    const updatedTemplate = {
      ...existingTemplate,
      ...template,
      updatedAt: new Date()
    };
    this.whatsAppTemplatesMap.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteWhatsAppTemplate(id: number): Promise<boolean> {
    return this.whatsAppTemplatesMap.delete(id);
  }

  // WhatsApp Chats (new format)
  async getWhatsAppChats(): Promise<WhatsAppChat[]> {
    return Array.from(this.whatsAppChatsMap.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getWhatsAppChatsByPhoneNumber(phoneNumber: string): Promise<WhatsAppChat[]> {
    return Array.from(this.whatsAppChatsMap.values())
      .filter(chat => chat.phoneNumber === phoneNumber)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getWhatsAppChatsByLead(leadId: number): Promise<WhatsAppChat[]> {
    return Array.from(this.whatsAppChatsMap.values())
      .filter(chat => chat.leadId === leadId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getWhatsAppChatsByCorporateLead(corporateLeadId: number): Promise<WhatsAppChat[]> {
    return Array.from(this.whatsAppChatsMap.values())
      .filter(chat => chat.corporateLeadId === corporateLeadId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getWhatsAppChatsByMeeting(meetingId: number): Promise<WhatsAppChat[]> {
    return Array.from(this.whatsAppChatsMap.values())
      .filter(chat => chat.meetingId === meetingId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getWhatsAppChat(id: number): Promise<WhatsAppChat | undefined> {
    return this.whatsAppChatsMap.get(id);
  }

  async createWhatsAppChat(chat: InsertWhatsAppChat): Promise<WhatsAppChat> {
    const id = this.whatsAppChatId++;
    const newChat: WhatsAppChat = {
      ...chat,
      id,
      timestamp: new Date(),
      createdAt: new Date()
    };
    this.whatsAppChatsMap.set(id, newChat);
    return newChat;
  }

  async updateWhatsAppChatStatus(id: number, status: string): Promise<WhatsAppChat | undefined> {
    const chat = this.whatsAppChatsMap.get(id);
    if (!chat) return undefined;
    
    const updatedChat = { ...chat, status };
    this.whatsAppChatsMap.set(id, updatedChat);
    return updatedChat;
  }

  // CRM - Leads methods
  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leadsMap.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getLead(id: number): Promise<Lead | undefined> {
    return this.leadsMap.get(id);
  }
  
  async getLeadsByConsultant(consultantId: number): Promise<Lead[]> {
    return Array.from(this.leadsMap.values())
      .filter(lead => lead.consultantId === consultantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getLeadsByStatus(status: string): Promise<Lead[]> {
    return Array.from(this.leadsMap.values())
      .filter(lead => lead.status === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getLeadsByPriority(priority: string): Promise<Lead[]> {
    return Array.from(this.leadsMap.values())
      .filter(lead => lead.priority === priority)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getLeadsDueForFollowUp(date?: Date): Promise<Lead[]> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return Array.from(this.leadsMap.values())
      .filter(lead => {
        if (!lead.nextFollowUpDate) return false;
        const followUpDate = new Date(lead.nextFollowUpDate);
        return followUpDate >= targetDate && followUpDate < nextDay;
      })
      .sort((a, b) => {
        if (!a.nextFollowUpTime || !b.nextFollowUpTime) return 0;
        return a.nextFollowUpTime.localeCompare(b.nextFollowUpTime);
      });
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const id = this.leadId++;
    const newLead: Lead = { 
      ...lead, 
      id, 
      createdAt: new Date(),
      status: lead.status || "New",
      priority: lead.priority || "Medium",
      email: lead.email || null,
      whatsappNumber: lead.whatsappNumber || null,
      source: lead.source || null,
      notes: lead.notes || null,
      assignedTo: lead.assignedTo || lead.consultantId
    };
    this.leadsMap.set(id, newLead);
    return newLead;
  }

  async updateLead(id: number, lead: Partial<Lead>): Promise<Lead | undefined> {
    const existingLead = this.leadsMap.get(id);
    if (!existingLead) return undefined;

    const updatedLead = { 
      ...existingLead, 
      ...lead,
      lastContactDate: lead.lastContactDate || new Date()
    };
    this.leadsMap.set(id, updatedLead);
    return updatedLead;
  }

  async deleteLead(id: number): Promise<boolean> {
    return this.leadsMap.delete(id);
  }
  
  // CRM - Campaigns methods
  async getCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaignsMap.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaignsMap.get(id);
  }
  
  async getCampaignsByPlatform(platform: string): Promise<Campaign[]> {
    return Array.from(this.campaignsMap.values())
      .filter(campaign => campaign.platform === platform)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaignsMap.values())
      .filter(campaign => campaign.status === "active")
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        return b.startDate.getTime() - a.startDate.getTime();
      });
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const id = this.campaignId++;
    const newCampaign: Campaign = { 
      ...campaign, 
      id, 
      createdAt: new Date(),
      budget: campaign.budget || null,
      platform: campaign.platform || null,
      status: campaign.status || "planned",
      description: campaign.description || null,
      results: campaign.results || null,
      adAccount: campaign.adAccount || null,
      adCampaignId: campaign.adCampaignId || null,
      targetAudience: campaign.targetAudience || null,
      endDate: campaign.endDate || null,
      costPerLead: campaign.costPerLead || null,
      impressions: campaign.impressions || 0,
      clicks: campaign.clicks || 0,
      conversions: campaign.conversions || 0
    };
    this.campaignsMap.set(id, newCampaign);
    return newCampaign;
  }

  async updateCampaign(id: number, campaign: Partial<Campaign>): Promise<Campaign | undefined> {
    const existingCampaign = this.campaignsMap.get(id);
    if (!existingCampaign) return undefined;

    const updatedCampaign = { ...existingCampaign, ...campaign };
    this.campaignsMap.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaignsMap.delete(id);
  }
  
  // CRM - Follow Ups methods
  async getFollowUps(): Promise<FollowUp[]> {
    return Array.from(this.followUpsMap.values())
      .sort((a, b) => {
        if (!a.nextFollowUp || !b.nextFollowUp) return 0;
        const result = a.nextFollowUp.getTime() - b.nextFollowUp.getTime();
        if (result === 0 && a.nextFollowUpTime && b.nextFollowUpTime) {
          return a.nextFollowUpTime.localeCompare(b.nextFollowUpTime);
        }
        return result;
      });
  }

  async getFollowUpsByLeadId(leadId: number): Promise<FollowUp[]> {
    return Array.from(this.followUpsMap.values())
      .filter(followUp => followUp.leadId === leadId)
      .sort((a, b) => b.contactDate.getTime() - a.contactDate.getTime());
  }
  
  async getFollowUpsByConsultant(consultantId: number): Promise<FollowUp[]> {
    return Array.from(this.followUpsMap.values())
      .filter(followUp => followUp.consultantId === consultantId)
      .sort((a, b) => {
        if (!a.nextFollowUp || !b.nextFollowUp) return 0;
        const result = a.nextFollowUp.getTime() - b.nextFollowUp.getTime();
        if (result === 0 && a.nextFollowUpTime && b.nextFollowUpTime) {
          return a.nextFollowUpTime.localeCompare(b.nextFollowUpTime);
        }
        return result;
      });
  }

  async getPendingFollowUps(): Promise<FollowUp[]> {
    return Array.from(this.followUpsMap.values())
      .filter(followUp => followUp.status === "Pending")
      .sort((a, b) => {
        if (!a.nextFollowUp || !b.nextFollowUp) return 0;
        const result = a.nextFollowUp.getTime() - b.nextFollowUp.getTime();
        if (result === 0 && a.nextFollowUpTime && b.nextFollowUpTime) {
          return a.nextFollowUpTime.localeCompare(b.nextFollowUpTime);
        }
        return result;
      });
  }

  async getTodaysFollowUps(consultantId?: number): Promise<FollowUp[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return Array.from(this.followUpsMap.values())
      .filter(followUp => {
        if (!followUp.nextFollowUp) return false;
        const matchesDate = followUp.nextFollowUp >= today && followUp.nextFollowUp < tomorrow;
        const matchesStatus = followUp.status === "Pending";
        const matchesConsultant = !consultantId || followUp.consultantId === consultantId;
        return matchesDate && matchesStatus && matchesConsultant;
      })
      .sort((a, b) => {
        if (!a.nextFollowUpTime || !b.nextFollowUpTime) return 0;
        return a.nextFollowUpTime.localeCompare(b.nextFollowUpTime);
      });
  }

  async getHighPriorityFollowUps(consultantId?: number): Promise<FollowUp[]> {
    return Array.from(this.followUpsMap.values())
      .filter(followUp => {
        const matchesPriority = followUp.priority === "High";
        const matchesStatus = followUp.status === "Pending";
        const matchesConsultant = !consultantId || followUp.consultantId === consultantId;
        return matchesPriority && matchesStatus && matchesConsultant;
      })
      .sort((a, b) => {
        if (!a.nextFollowUp || !b.nextFollowUp) return 0;
        return a.nextFollowUp.getTime() - b.nextFollowUp.getTime();
      });
  }

  async getFollowUpsToNotify(): Promise<FollowUp[]> {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);
    
    return Array.from(this.followUpsMap.values())
      .filter(followUp => {
        if (!followUp.nextFollowUp) return false;
        return followUp.nextFollowUp >= now && 
               followUp.nextFollowUp <= thirtyMinutesFromNow && 
               followUp.isNotified === false &&
               followUp.status === "Pending";
      })
      .sort((a, b) => {
        if (!a.nextFollowUp || !b.nextFollowUp) return 0;
        return a.nextFollowUp.getTime() - b.nextFollowUp.getTime();
      });
  }

  async getFollowUp(id: number): Promise<FollowUp | undefined> {
    return this.followUpsMap.get(id);
  }

  async createFollowUp(followUp: InsertFollowUp): Promise<FollowUp> {
    const id = this.followUpId++;
    const newFollowUp: FollowUp = { 
      ...followUp, 
      id, 
      createdAt: new Date(),
      notes: followUp.notes || null,
      outcome: followUp.outcome || null,
      nextFollowUp: followUp.nextFollowUp || null,
      nextFollowUpTime: followUp.nextFollowUpTime || null,
      contactTime: followUp.contactTime || null,
      priority: followUp.priority || "Medium",
      status: followUp.status || "Pending",
      isNotified: followUp.isNotified || false
    };
    this.followUpsMap.set(id, newFollowUp);
    return newFollowUp;
  }

  async updateFollowUp(id: number, followUp: Partial<FollowUp>): Promise<FollowUp | undefined> {
    const existingFollowUp = this.followUpsMap.get(id);
    if (!existingFollowUp) return undefined;

    const updatedFollowUp = { ...existingFollowUp, ...followUp };
    this.followUpsMap.set(id, updatedFollowUp);
    return updatedFollowUp;
  }
  
  async markFollowUpAsNotified(id: number): Promise<FollowUp | undefined> {
    const existingFollowUp = this.followUpsMap.get(id);
    if (!existingFollowUp) return undefined;

    const notifiedFollowUp = { ...existingFollowUp, isNotified: true };
    this.followUpsMap.set(id, notifiedFollowUp);
    return notifiedFollowUp;
  }

  async deleteFollowUp(id: number): Promise<boolean> {
    return this.followUpsMap.delete(id);
  }
  
  // WhatsApp API Settings methods
  async getWhatsappSettings(): Promise<WhatsappSettings | undefined> {
    const settings = Array.from(this.whatsappSettingsMap.values());
    return settings.length > 0 ? settings[0] : undefined;
  }

  async createWhatsappSettings(settings: InsertWhatsappSettings): Promise<WhatsappSettings> {
    const id = this.whatsappSettingsId++;
    const newSettings: WhatsappSettings = { 
      ...settings, 
      id, 
      createdAt: new Date() 
    };
    this.whatsappSettingsMap.set(id, newSettings);
    return newSettings;
  }

  async updateWhatsappSettings(id: number, settings: Partial<WhatsappSettings>): Promise<WhatsappSettings | undefined> {
    const existingSettings = this.whatsappSettingsMap.get(id);
    if (!existingSettings) return undefined;

    const updatedSettings = { ...existingSettings, ...settings };
    this.whatsappSettingsMap.set(id, updatedSettings);
    return updatedSettings;
  }

  // WhatsApp Templates methods
  async getWhatsappTemplates(): Promise<WhatsappTemplate[]> {
    return Array.from(this.whatsappTemplatesMap.values());
  }

  async getWhatsappTemplate(id: number): Promise<WhatsappTemplate | undefined> {
    return this.whatsappTemplatesMap.get(id);
  }

  async createWhatsappTemplate(template: InsertWhatsappTemplate): Promise<WhatsappTemplate> {
    const id = this.whatsappTemplateId++;
    const newTemplate: WhatsappTemplate = { 
      ...template, 
      id, 
      createdAt: new Date() 
    };
    this.whatsappTemplatesMap.set(id, newTemplate);
    return newTemplate;
  }

  async updateWhatsappTemplate(id: number, template: Partial<WhatsappTemplate>): Promise<WhatsappTemplate | undefined> {
    const existingTemplate = this.whatsappTemplatesMap.get(id);
    if (!existingTemplate) return undefined;

    const updatedTemplate = { ...existingTemplate, ...template };
    this.whatsappTemplatesMap.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteWhatsappTemplate(id: number): Promise<boolean> {
    return this.whatsappTemplatesMap.delete(id);
  }

  // WhatsApp Chats methods
  async getWhatsappChats(): Promise<WhatsappChat[]> {
    return Array.from(this.whatsappChatsMap.values())
      .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
  }

  async getWhatsappChat(id: number): Promise<WhatsappChat | undefined> {
    return this.whatsappChatsMap.get(id);
  }

  async getWhatsappChatsByConsultantId(consultantId: number): Promise<WhatsappChat[]> {
    return Array.from(this.whatsappChatsMap.values())
      .filter(chat => chat.consultantId === consultantId)
      .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
  }

  async createWhatsappChat(chat: InsertWhatsappChat): Promise<WhatsappChat> {
    const id = this.whatsappChatId++;
    const newChat: WhatsappChat = { 
      ...chat, 
      id, 
      createdAt: new Date(),
      lastMessageTime: new Date(),
      unreadCount: 0
    };
    this.whatsappChatsMap.set(id, newChat);
    return newChat;
  }

  async updateWhatsappChat(id: number, chat: Partial<WhatsappChat>): Promise<WhatsappChat | undefined> {
    const existingChat = this.whatsappChatsMap.get(id);
    if (!existingChat) return undefined;

    const updatedChat = { ...existingChat, ...chat };
    this.whatsappChatsMap.set(id, updatedChat);
    return updatedChat;
  }

  // WhatsApp Messages methods
  async getWhatsappMessagesByChatId(chatId: number): Promise<WhatsappMessage[]> {
    return Array.from(this.whatsappMessagesMap.values())
      .filter(message => message.chatId === chatId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage> {
    const id = this.whatsappMessageId++;
    const newMessage: WhatsappMessage = { 
      ...message, 
      id, 
      createdAt: new Date() 
    };
    this.whatsappMessagesMap.set(id, newMessage);
    
    // Update the chat's last message time
    const chat = this.whatsappChatsMap.get(message.chatId);
    if (chat) {
      const updatedChat = { 
        ...chat, 
        lastMessageTime: new Date(),
        unreadCount: message.sentBy !== chat.consultantId ? chat.unreadCount + 1 : chat.unreadCount
      };
      this.whatsappChatsMap.set(chat.id, updatedChat);
    }
    
    return newMessage;
  }
  
  // Titan Email Settings
  async getTitanEmailSettings(): Promise<TitanEmailSettings | undefined> {
    const settings = Array.from(this.titanEmailSettingsMap.values());
    return settings.length > 0 ? settings[0] : undefined;
  }

  async createTitanEmailSettings(settings: InsertTitanEmailSettings): Promise<TitanEmailSettings> {
    const id = this.titanEmailSettingsId++;
    const newSettings: TitanEmailSettings = { 
      ...settings, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.titanEmailSettingsMap.set(id, newSettings);
    return newSettings;
  }

  async updateTitanEmailSettings(id: number, settings: Partial<TitanEmailSettings>): Promise<TitanEmailSettings | undefined> {
    const existingSettings = this.titanEmailSettingsMap.get(id);
    if (!existingSettings) return undefined;

    const updatedSettings = { 
      ...existingSettings, 
      ...settings,
      updatedAt: new Date()
    };
    this.titanEmailSettingsMap.set(id, updatedSettings);
    return updatedSettings;
  }
  
  async testEmailConnection(settings: Partial<TitanEmailSettings>): Promise<boolean> {
    // Here we would implement actual email connection testing functionality
    // This is a simplified mock implementation for demonstration purposes
    
    // Simulate connection testing based on whether required fields are provided
    try {
      // Check if using API
      if (settings.useApi) {
        // Test API connection
        if (!settings.apiKey || !settings.apiSecret) {
          throw new Error("API Key and API Secret are required for API connection");
        }
        
        // Simulate API connection success (in a real implementation, we would make an actual API call)
        return true;
      } else {
        // Test SMTP connection
        if (!settings.smtpServer || !settings.smtpPort) {
          throw new Error("SMTP Server and Port are required");
        }
        
        if (settings.smtpAuthRequired && (!settings.smtpUsername || !settings.smtpPassword)) {
          throw new Error("SMTP Username and Password are required when authentication is enabled");
        }
        
        // Test IMAP connection if provided
        if (settings.imapServer && !settings.imapPort) {
          throw new Error("IMAP Port is required when IMAP Server is specified");
        }
        
        // Simulate connection success (in a real implementation, we would attempt to connect to the servers)
        return true;
      }
    } catch (error) {
      console.error("Email connection test failed:", error);
      return false;
    }
  }
  
  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return Array.from(this.emailTemplatesMap.values());
  }

  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    return this.emailTemplatesMap.get(id);
  }
  
  async getEmailTemplatesByCategory(category: string): Promise<EmailTemplate[]> {
    return Array.from(this.emailTemplatesMap.values())
      .filter(template => template.category === category);
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const id = this.emailTemplateId++;
    const newTemplate: EmailTemplate = { 
      ...template, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: template.isActive !== undefined ? template.isActive : true,
      variables: template.variables || null
    };
    this.emailTemplatesMap.set(id, newTemplate);
    return newTemplate;
  }

  async updateEmailTemplate(id: number, template: Partial<EmailTemplate>): Promise<EmailTemplate | undefined> {
    const existingTemplate = this.emailTemplatesMap.get(id);
    if (!existingTemplate) return undefined;

    const updatedTemplate = { 
      ...existingTemplate, 
      ...template,
      updatedAt: new Date()
    };
    this.emailTemplatesMap.set(id, updatedTemplate);
    return updatedTemplate;
  }
  
  async deleteEmailTemplate(id: number): Promise<boolean> {
    return this.emailTemplatesMap.delete(id);
  }
  
  // Email History
  async getEmailHistory(): Promise<EmailHistory[]> {
    return Array.from(this.emailHistoryMap.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getEmailHistoryByLeadId(leadId: number): Promise<EmailHistory[]> {
    return Array.from(this.emailHistoryMap.values())
      .filter(email => email.leadId === leadId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getEmailHistoryByStudentId(studentId: number): Promise<EmailHistory[]> {
    return Array.from(this.emailHistoryMap.values())
      .filter(email => email.studentId === studentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createEmailHistory(email: InsertEmailHistory): Promise<EmailHistory> {
    const id = this.emailHistoryId++;
    const newEmail: EmailHistory = { 
      ...email, 
      id, 
      createdAt: new Date(),
      status: email.status || "sent",
      attachments: email.attachments || null,
      cc: email.cc || null,
      bcc: email.bcc || null
    };
    this.emailHistoryMap.set(id, newEmail);
    return newEmail;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  private whatsappSettingsId: number = 1;
  private whatsappTemplateId: number = 1;
  private whatsappChatId: number = 1;
  private whatsappMessageId: number = 1;
  private titanEmailSettingsId: number = 1;
  private emailTemplateId: number = 1;
  private emailHistoryId: number = 1;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      tableName: 'user_sessions',
      createTableIfMissing: true
    });
  }

  // Users methods
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const userWithDefaults = {
      ...user,
      role: user.role || "counselor",
      email: user.email || null,
      phone: user.phone || null
    };
    const result = await db.insert(users).values(userWithDefaults).returning();
    return result[0];
  }
  
  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }
  
  // Institute settings
  // Using a private variable to simulate a database table for institute settings
  private instituteSettings = {
    name: "Orbit Institute",
    address: "Sheikh Zayed Road, Dubai, UAE",
    phone: "+971 4 123 4567",
    email: "info@orbitinstitute.com",
    website: "www.orbitinstitute.com",
    logo: "/logo.png"
  };
  
  async getInstitute(): Promise<any> {
    return this.instituteSettings;
  }
  
  async updateInstitute(settings: any): Promise<any> {
    this.instituteSettings = { ...this.instituteSettings, ...settings };
    return this.instituteSettings;
  }

  // Students methods
  async getStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const result = await db.select().from(students).where(eq(students.id, id));
    return result[0];
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    const result = await db.select().from(students).where(eq(students.studentId, studentId));
    return result[0];
  }
  
  async getStudentByRegisterLink(token: string): Promise<Student | undefined> {
    const result = await db.select().from(students).where(eq(students.registerLink, token));
    return result[0];
  }
  
  async getStudentsByCourseId(courseId: number): Promise<Student[]> {
    // In an actual implementation, this would use a proper relationship
    // For now, we're checking if the courseId matches
    const result = await db.select()
      .from(students)
      .where(eq(students.courseId, courseId));
    return result;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    try {
      // If student_id is not provided, generate one
      if (!student.studentId) {
        // Generate a student ID like "ST-23-0001"
        const year = new Date().getFullYear().toString().substr(2); // get last 2 digits of year
        
        // Get the latest student ID to generate the next one
        const latestStudent = await db.select({ max: sql`MAX(student_id)` }).from(students).execute();
        let nextNumber = 1;
        
        if (latestStudent[0]?.max) {
          // If there's an existing student, extract the number and increment
          const match = latestStudent[0].max.match(/ST-\d{2}-(\d{4})/);
          if (match) {
            nextNumber = parseInt(match[1]) + 1;
          }
        }
        
        // Format the number with leading zeros
        const formattedNumber = nextNumber.toString().padStart(4, '0');
        student.studentId = `ST-${year}-${formattedNumber}`; // Using backticks for template literal
      }
      
      // Process date fields properly
      // Make sure dates are proper Date objects before insertion
      const now = new Date();
      
      // Ensure dateOfBirth is a proper Date object if present
      if (student.dateOfBirth && !(student.dateOfBirth instanceof Date)) {
        // If it's a string, parse it to a Date
        if (typeof student.dateOfBirth === 'string') {
          student.dateOfBirth = new Date(student.dateOfBirth);
        }
      }
      
      // Ensure signatureDate is a proper Date object if present
      if (student.signatureDate && !(student.signatureDate instanceof Date)) {
        // If it's a string, parse it to a Date
        if (typeof student.signatureDate === 'string') {
          student.signatureDate = new Date(student.signatureDate);
        } else {
          // If it's not a string or Date, set to null
          student.signatureDate = null;
        }
      }
      
      // Set full_name field (required) by combining first and last name if not provided
      if (!student.fullName && student.firstName && student.lastName) {
        student.fullName = `${student.firstName} ${student.lastName}`;
      }
      
      // Set phone field (required) from phoneNo if not provided
      if (!student.phone && student.phoneNo) {
        student.phone = student.phoneNo;
      }
      
      // Ensure other required fields are present or set defaults
      const studentWithDefaults = {
        ...student,
        createdAt: now,
        discount: student.discount || null,
        registrationDate: student.registrationDate || now,
        fullName: student.fullName || 'Not Provided',
        fatherName: student.fatherName || 'Not Provided',
        phone: student.phone || (student.phoneNo || 'Not Provided'),
        dob: student.dob || (student.dateOfBirth ? student.dateOfBirth : now),
        gender: student.gender || 'Not Specified',
        address: student.address || 'Not Provided',
        courseId: student.courseId || 0,
        batch: student.batch || 'Regular',
        courseFee: student.courseFee || 0,
        totalFee: student.totalFee || 0,
        initialPayment: student.initialPayment || 0,
        balanceDue: student.balanceDue || 0,
        paymentMode: student.paymentMode || 'Cash',
        paymentStatus: student.paymentStatus || 'pending'
      };
      
      console.log("Creating student with data:", JSON.stringify(studentWithDefaults));
      
      const result = await db.insert(students).values(studentWithDefaults).returning();
      return result[0];
    } catch (error) {
      console.error("Error in createStudent:", error);
      throw error;
    }
  }

  async updateStudent(id: number, student: Partial<Student>): Promise<Student | undefined> {
    const result = await db.update(students).set(student).where(eq(students.id, id)).returning();
    return result[0];
  }

  // Courses methods
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const result = await db.select().from(courses).where(eq(courses.id, id));
    return result[0];
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const courseWithDefaults = {
      ...course,
      createdAt: new Date(),
      content: course.content || null,
      active: course.active || true
    };
    const result = await db.insert(courses).values(courseWithDefaults).returning();
    return result[0];
  }

  async updateCourse(id: number, course: Partial<Course>): Promise<Course | undefined> {
    const result = await db.update(courses).set(course).where(eq(courses.id, id)).returning();
    return result[0];
  }

  async deleteCourse(id: number): Promise<boolean> {
    const result = await db.delete(courses).where(eq(courses.id, id)).returning();
    return result.length > 0;
  }

  // Trainers methods
  async getTrainers(): Promise<Trainer[]> {
    return await db.select().from(trainers);
  }

  async getTrainer(id: number): Promise<Trainer | undefined> {
    const result = await db.select().from(trainers).where(eq(trainers.id, id));
    return result[0];
  }

  async createTrainer(trainer: InsertTrainer): Promise<Trainer> {
    const trainerWithDefaults = {
      ...trainer,
      createdAt: new Date(),
      profileImage: trainer.profileImage || null,
      certifications: trainer.certifications || null
    };
    const result = await db.insert(trainers).values(trainerWithDefaults).returning();
    return result[0];
  }

  async updateTrainer(id: number, trainer: Partial<Trainer>): Promise<Trainer | undefined> {
    const result = await db.update(trainers).set(trainer).where(eq(trainers.id, id)).returning();
    return result[0];
  }

  async deleteTrainer(id: number): Promise<boolean> {
    const result = await db.delete(trainers).where(eq(trainers.id, id)).returning();
    return result.length > 0;
  }

  // Invoices methods
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices);
  }

  async getInvoicesByStudentId(studentId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.studentId, studentId));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const result = await db.select().from(invoices).where(eq(invoices.id, id));
    return result[0];
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const invoiceWithDefaults = {
      ...invoice,
      createdAt: new Date(),
      transactionId: invoice.transactionId || null,
      paymentDate: invoice.paymentDate || new Date()
    };
    const result = await db.insert(invoices).values(invoiceWithDefaults).returning();
    return result[0];
  }
  
  async updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice | undefined> {
    const result = await db.update(invoices).set(invoice).where(eq(invoices.id, id)).returning();
    return result[0];
  }

  // Schedules methods
  async getSchedules(): Promise<Schedule[]> {
    return await db.select().from(schedules);
  }

  async getSchedule(id: number): Promise<Schedule | undefined> {
    const result = await db.select().from(schedules).where(eq(schedules.id, id));
    return result[0];
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const scheduleWithDefaults = {
      ...schedule,
      createdAt: new Date(),
      status: schedule.status || 'pending'
    };
    const result = await db.insert(schedules).values(scheduleWithDefaults).returning();
    return result[0];
  }

  async updateSchedule(id: number, schedule: Partial<Schedule>): Promise<Schedule | undefined> {
    const result = await db.update(schedules).set(schedule).where(eq(schedules.id, id)).returning();
    return result[0];
  }

  async deleteSchedule(id: number): Promise<boolean> {
    const result = await db.delete(schedules).where(eq(schedules.id, id)).returning();
    return result.length > 0;
  }

  // Certificates methods
  async getCertificates(): Promise<Certificate[]> {
    return await db.select().from(certificates);
  }

  async getCertificatesByStudentId(studentId: number): Promise<Certificate[]> {
    return await db.select().from(certificates).where(eq(certificates.studentId, studentId));
  }

  async getCertificate(id: number): Promise<Certificate | undefined> {
    const result = await db.select().from(certificates).where(eq(certificates.id, id));
    return result[0];
  }

  async createCertificate(certificate: InsertCertificate): Promise<Certificate> {
    const certificateWithDefaults = {
      ...certificate,
      createdAt: new Date(),
      issueDate: certificate.issueDate || new Date()
    };
    const result = await db.insert(certificates).values(certificateWithDefaults).returning();
    return result[0];
  }

  // Quotations methods
  async getQuotations(): Promise<Quotation[]> {
    return await db.select().from(quotations);
  }

  async getQuotation(id: number): Promise<Quotation | undefined> {
    const result = await db.select().from(quotations).where(eq(quotations.id, id));
    return result[0];
  }

  async createQuotation(quotation: InsertQuotation): Promise<Quotation> {
    const quotationWithDefaults = {
      ...quotation,
      createdAt: new Date(),
      discount: quotation.discount || null,
      status: quotation.status || 'pending'
    };
    const result = await db.insert(quotations).values(quotationWithDefaults).returning();
    return result[0];
  }

  async updateQuotation(id: number, quotation: Partial<Quotation>): Promise<Quotation | undefined> {
    const result = await db.update(quotations).set(quotation).where(eq(quotations.id, id)).returning();
    return result[0];
  }
  
  // Quotation Items methods
  async getQuotationItems(quotationId: number): Promise<QuotationItem[]> {
    return await db.select().from(quotationItems).where(eq(quotationItems.quotationId, quotationId));
  }
  
  async getQuotationItem(id: number): Promise<QuotationItem | undefined> {
    const result = await db.select().from(quotationItems).where(eq(quotationItems.id, id));
    return result[0];
  }
  
  async createQuotationItem(item: InsertQuotationItem): Promise<QuotationItem> {
    const itemWithDefaults = {
      ...item,
      createdAt: new Date()
    };
    const result = await db.insert(quotationItems).values(itemWithDefaults).returning();
    return result[0];
  }
  
  async updateQuotationItem(id: number, item: Partial<QuotationItem>): Promise<QuotationItem | undefined> {
    const result = await db.update(quotationItems).set(item).where(eq(quotationItems.id, id)).returning();
    return result[0];
  }
  
  async deleteQuotationItem(id: number): Promise<boolean> {
    const result = await db.delete(quotationItems).where(eq(quotationItems.id, id));
    return result.rowCount > 0;
  }

  // Proposals methods
  async getProposals(): Promise<Proposal[]> {
    return await db.select().from(proposals);
  }

  async getProposal(id: number): Promise<Proposal | undefined> {
    const result = await db.select().from(proposals).where(eq(proposals.id, id));
    return result[0];
  }

  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    const proposalWithDefaults = {
      ...proposal,
      createdAt: new Date(),
      discount: proposal.discount || null,
      content: proposal.content || null,
      coverPage: proposal.coverPage || null,
      status: proposal.status || 'draft'
    };
    const result = await db.insert(proposals).values(proposalWithDefaults).returning();
    return result[0];
  }

  async updateProposal(id: number, proposal: Partial<Proposal>): Promise<Proposal | undefined> {
    const result = await db.update(proposals).set(proposal).where(eq(proposals.id, id)).returning();
    return result[0];
  }
  
  // CRM - Leads methods
  async getLeads(): Promise<Lead[]> {
    try {
      return await db.select().from(leads).orderBy(desc(leads.createdAt));
    } catch (error) {
      console.error("Error fetching leads:", error);
      return [];
    }
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.id, id));
    return result[0];
  }

  async getLeadsByConsultant(consultantId: number): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.consultantId, consultantId))
      .orderBy(desc(leads.createdAt));
  }

  async getLeadsByStatus(status: string): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.status, status))
      .orderBy(desc(leads.createdAt));
  }

  async getLeadsByPriority(priority: string): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.priority, priority))
      .orderBy(desc(leads.createdAt));
  }

  async getLeadsDueForFollowUp(date?: Date): Promise<Lead[]> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return await db
      .select()
      .from(leads)
      .where(
        and(
          gte(leads.nextFollowUpDate, targetDate),
          lt(leads.nextFollowUpDate, nextDay)
        )
      )
      .orderBy(leads.nextFollowUpTime);
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const leadWithDefaults = {
      ...lead,
      createdAt: new Date(),
      status: lead.status || "New",
      priority: lead.priority || "Medium",
      source: lead.source || null,
      notes: lead.notes || null,
      email: lead.email || null,
      whatsappNumber: lead.whatsappNumber || null,
      assignedTo: lead.assignedTo || lead.consultantId
    };
    const result = await db.insert(leads).values(leadWithDefaults).returning();
    return result[0];
  }

  async updateLead(id: number, lead: Partial<Lead>): Promise<Lead | undefined> {
    // Update lastContactDate if not explicitly provided but other changes are made
    const updatedLead = { 
      ...lead,
      lastContactDate: lead.lastContactDate || new Date()
    };
    
    const result = await db.update(leads).set(updatedLead).where(eq(leads.id, id)).returning();
    return result[0];
  }

  async deleteLead(id: number): Promise<boolean> {
    const result = await db.delete(leads).where(eq(leads.id, id)).returning();
    return result.length > 0;
  }
  
  // CRM - Campaigns methods
  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const result = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return result[0];
  }

  async getCampaignsByPlatform(platform: string): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.platform, platform))
      .orderBy(desc(campaigns.createdAt));
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.status, "active"))
      .orderBy(desc(campaigns.startDate));
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const campaignWithDefaults = {
      ...campaign,
      createdAt: new Date(),
      budget: campaign.budget || null,
      platform: campaign.platform || null,
      status: campaign.status || "planned",
      description: campaign.description || null,
      results: campaign.results || null,
      adAccount: campaign.adAccount || null,
      adCampaignId: campaign.adCampaignId || null,
      targetAudience: campaign.targetAudience || null,
      endDate: campaign.endDate || null,
      costPerLead: campaign.costPerLead || null
    };
    const result = await db.insert(campaigns).values(campaignWithDefaults).returning();
    return result[0];
  }

  async updateCampaign(id: number, campaign: Partial<Campaign>): Promise<Campaign | undefined> {
    const result = await db.update(campaigns).set(campaign).where(eq(campaigns.id, id)).returning();
    return result[0];
  }

  async deleteCampaign(id: number): Promise<boolean> {
    const result = await db.delete(campaigns).where(eq(campaigns.id, id)).returning();
    return result.length > 0;
  }
  
  // CRM - Follow Ups methods
  async getFollowUps(): Promise<FollowUp[]> {
    try {
      return await db
        .select()
        .from(followUps)
        .orderBy(desc(followUps.createdAt));
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
      return [];
    }
  }

  async getFollowUpsByLeadId(leadId: number): Promise<FollowUp[]> {
    return await db
      .select()
      .from(followUps)
      .where(eq(followUps.leadId, leadId))
      .orderBy(desc(followUps.contactDate));
  }

  async getFollowUpsByConsultant(consultantId: number): Promise<FollowUp[]> {
    try {
      return await db
        .select()
        .from(followUps)
        .where(eq(followUps.consultantId, consultantId))
        .orderBy(asc(followUps.nextFollowUp));
    } catch (error) {
      console.error("Error fetching follow-ups by consultant:", error);
      return [];
    }
  }

  async getPendingFollowUps(): Promise<FollowUp[]> {
    try {
      return await db
        .select()
        .from(followUps)
        .where(eq(followUps.status, "Pending"))
        .orderBy(asc(followUps.nextFollowUp));
    } catch (error) {
      console.error("Error fetching pending follow-ups:", error);
      return [];
    }
  }

  async getTodaysFollowUps(consultantId?: number): Promise<FollowUp[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      let queryBuilder = db.select().from(followUps)
        .where(
          and(
            eq(followUps.status, "Pending"),
            gte(followUps.nextFollowUp, today),
            lt(followUps.nextFollowUp, tomorrow)
          )
        );
      
      if (consultantId) {
        queryBuilder = queryBuilder.where(eq(followUps.consultantId, consultantId));
      }
      
      return await queryBuilder.orderBy(asc(followUps.contactDate));
    } catch (error) {
      console.error("Error fetching today's follow-ups:", error);
      return [];
    }
  }

  async getHighPriorityFollowUps(consultantId?: number): Promise<FollowUp[]> {
    try {
      let queryBuilder = db.select().from(followUps)
        .where(
          and(
            eq(followUps.priority, "High"),
            eq(followUps.status, "Pending")
          )
        );
        
      if (consultantId) {
        queryBuilder = queryBuilder.where(eq(followUps.consultantId, consultantId));
      }
      
      return await queryBuilder.orderBy(asc(followUps.nextFollowUp));
    } catch (error) {
      console.error("Error fetching high priority follow-ups:", error);
      return [];
    }
  }

  async getFollowUpsToNotify(): Promise<FollowUp[]> {
    try {
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);
      
      return await db
        .select()
        .from(followUps)
        .where(
          and(
            gte(followUps.nextFollowUp, now),
            lte(followUps.nextFollowUp, thirtyMinutesFromNow),
            eq(followUps.isNotified, false),
            eq(followUps.status, "Pending")
          )
        )
        .orderBy(asc(followUps.nextFollowUp));
    } catch (error) {
      console.error("Error fetching follow-ups to notify:", error);
      return [];
    }
  }

  async getFollowUp(id: number): Promise<FollowUp | undefined> {
    const result = await db.select().from(followUps).where(eq(followUps.id, id));
    return result[0];
  }

  async createFollowUp(followUp: InsertFollowUp): Promise<FollowUp> {
    const followUpWithDefaults = {
      ...followUp,
      createdAt: new Date(),
      notes: followUp.notes || null,
      outcome: followUp.outcome || null,
      nextFollowUp: followUp.nextFollowUp || null,
      nextFollowUpTime: followUp.nextFollowUpTime || null,
      contactTime: followUp.contactTime || null,
      priority: followUp.priority || "Medium",
      status: followUp.status || "Pending",
      isNotified: followUp.isNotified || false
    };
    const result = await db.insert(followUps).values(followUpWithDefaults).returning();
    return result[0];
  }

  async updateFollowUp(id: number, followUp: Partial<FollowUp>): Promise<FollowUp | undefined> {
    const result = await db.update(followUps).set(followUp).where(eq(followUps.id, id)).returning();
    return result[0];
  }

  async markFollowUpAsNotified(id: number): Promise<FollowUp | undefined> {
    const result = await db
      .update(followUps)
      .set({ isNotified: true })
      .where(eq(followUps.id, id))
      .returning();
    return result[0];
  }

  async deleteFollowUp(id: number): Promise<boolean> {
    const result = await db.delete(followUps).where(eq(followUps.id, id)).returning();
    return result.length > 0;
  }
  // WhatsApp API Settings methods
  async getWhatsappSettings(): Promise<WhatsappSettings | undefined> {
    const result = await db.select().from(whatsappSettings);
    return result[0];
  }

  async createWhatsappSettings(settings: InsertWhatsappSettings): Promise<WhatsappSettings> {
    const settingsWithDefaults = {
      ...settings,
      createdAt: new Date()
    };
    const result = await db.insert(whatsappSettings).values(settingsWithDefaults).returning();
    return result[0];
  }

  async updateWhatsappSettings(id: number, settings: Partial<WhatsappSettings>): Promise<WhatsappSettings | undefined> {
    const result = await db.update(whatsappSettings).set(settings).where(eq(whatsappSettings.id, id)).returning();
    return result[0];
  }

  // WhatsApp Templates methods
  async getWhatsappTemplates(): Promise<WhatsappTemplate[]> {
    return await db.select().from(whatsappTemplates);
  }
  
  // Titan Email Settings
  async getTitanEmailSettings(): Promise<TitanEmailSettings | undefined> {
    const result = await db.select().from(titanEmailSettings);
    return result[0];
  }
  
  async createTitanEmailSettings(settings: InsertTitanEmailSettings): Promise<TitanEmailSettings> {
    const settingsWithDefaults = {
      ...settings,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.insert(titanEmailSettings).values(settingsWithDefaults).returning();
    return result[0];
  }
  
  async updateTitanEmailSettings(id: number, settings: Partial<TitanEmailSettings>): Promise<TitanEmailSettings | undefined> {
    const settingsWithUpdatedAt = {
      ...settings,
      updatedAt: new Date()
    };
    const result = await db.update(titanEmailSettings)
      .set(settingsWithUpdatedAt)
      .where(eq(titanEmailSettings.id, id))
      .returning();
    return result[0];
  }
  
  async testEmailConnection(settings: Partial<TitanEmailSettings>): Promise<boolean> {
    // Here we would implement actual email connection testing functionality
    // This is a simplified mock implementation for demonstration purposes
    
    // Simulate connection testing based on whether required fields are provided
    try {
      // Check if using API
      if (settings.useApi) {
        // Test API connection
        if (!settings.apiKey || !settings.apiSecret) {
          throw new Error("API Key and API Secret are required for API connection");
        }
        
        // Simulate API connection success (in a real implementation, we would make an actual API call)
        return true;
      } else {
        // Test SMTP connection
        if (!settings.smtpServer || !settings.smtpPort) {
          throw new Error("SMTP Server and Port are required");
        }
        
        if (settings.smtpAuthRequired && (!settings.smtpUsername || !settings.smtpPassword)) {
          throw new Error("SMTP Username and Password are required when authentication is enabled");
        }
        
        // Test IMAP connection if provided
        if (settings.imapServer && !settings.imapPort) {
          throw new Error("IMAP Port is required when IMAP Server is specified");
        }
        
        // Simulate connection success (in a real implementation, we would attempt to connect to the servers)
        return true;
      }
    } catch (error) {
      console.error("Email connection test failed:", error);
      return false;
    }
  }
  
  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const result = await db.select().from(emailTemplates);
    return result;
  }
  
  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    const result = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return result[0];
  }
  
  async getEmailTemplatesByCategory(category: string): Promise<EmailTemplate[]> {
    const result = await db.select().from(emailTemplates).where(eq(emailTemplates.category, category));
    return result;
  }
  
  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const templateWithDefaults = {
      ...template,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.insert(emailTemplates).values(templateWithDefaults).returning();
    return result[0];
  }
  
  async updateEmailTemplate(id: number, template: Partial<EmailTemplate>): Promise<EmailTemplate | undefined> {
    const templateWithUpdatedAt = {
      ...template,
      updatedAt: new Date()
    };
    const result = await db.update(emailTemplates)
      .set(templateWithUpdatedAt)
      .where(eq(emailTemplates.id, id))
      .returning();
    return result[0];
  }
  
  async deleteEmailTemplate(id: number): Promise<boolean> {
    const result = await db.delete(emailTemplates).where(eq(emailTemplates.id, id)).returning();
    return result.length > 0;
  }
  
  // Email History
  async getEmailHistory(): Promise<EmailHistory[]> {
    const result = await db.select().from(emailHistory)
      .orderBy(desc(emailHistory.createdAt));
    return result;
  }
  
  async getEmailHistoryByLeadId(leadId: number): Promise<EmailHistory[]> {
    const result = await db.select().from(emailHistory)
      .where(eq(emailHistory.leadId, leadId))
      .orderBy(desc(emailHistory.createdAt));
    return result;
  }
  
  async getEmailHistoryByStudentId(studentId: number): Promise<EmailHistory[]> {
    const result = await db.select().from(emailHistory)
      .where(eq(emailHistory.studentId, studentId))
      .orderBy(desc(emailHistory.createdAt));
    return result;
  }
  
  async createEmailHistory(email: InsertEmailHistory): Promise<EmailHistory> {
    const emailWithDefaults = {
      ...email,
      createdAt: new Date()
    };
    const result = await db.insert(emailHistory).values(emailWithDefaults).returning();
    return result[0];
  }
  
  // Registration Courses methods
  async getRegistrationCourses(studentId: number): Promise<RegistrationCourse[]> {
    const result = await db.select().from(registrationCourses)
      .where(eq(registrationCourses.studentId, studentId))
      .orderBy(desc(registrationCourses.createdAt));
    return result;
  }
  
  async getRegistrationCourse(id: number): Promise<RegistrationCourse | undefined> {
    const result = await db.select().from(registrationCourses)
      .where(eq(registrationCourses.id, id));
    return result[0];
  }
  
  async createRegistrationCourse(course: InsertRegistrationCourse): Promise<RegistrationCourse> {
    try {
      console.log("Creating registration course with data:", JSON.stringify(course));
      
      // Create a fresh date instance
      const now = new Date();
      
      const courseWithDefaults = {
        ...course,
        createdAt: now
      };
      
      const result = await db.insert(registrationCourses).values(courseWithDefaults).returning();
      return result[0];
    } catch (error) {
      console.error("Error in createRegistrationCourse:", error);
      throw error;
    }
  }
  
  async deleteRegistrationCourse(id: number): Promise<boolean> {
    const result = await db.delete(registrationCourses)
      .where(eq(registrationCourses.id, id))
      .returning();
    return result.length > 0;
  }

  async getWhatsappTemplate(id: number): Promise<WhatsappTemplate | undefined> {
    const result = await db.select().from(whatsappTemplates).where(eq(whatsappTemplates.id, id));
    return result[0];
  }

  async createWhatsappTemplate(template: InsertWhatsappTemplate): Promise<WhatsappTemplate> {
    const templateWithDefaults = {
      ...template,
      createdAt: new Date()
    };
    const result = await db.insert(whatsappTemplates).values(templateWithDefaults).returning();
    return result[0];
  }

  async updateWhatsappTemplate(id: number, template: Partial<WhatsappTemplate>): Promise<WhatsappTemplate | undefined> {
    const result = await db.update(whatsappTemplates).set(template).where(eq(whatsappTemplates.id, id)).returning();
    return result[0];
  }

  async deleteWhatsappTemplate(id: number): Promise<boolean> {
    const result = await db.delete(whatsappTemplates).where(eq(whatsappTemplates.id, id)).returning();
    return result.length > 0;
  }

  // WhatsApp Chats methods
  async getWhatsappChats(): Promise<WhatsappChat[]> {
    return await db.select().from(whatsappChats).orderBy(desc(whatsappChats.lastMessageTime));
  }

  async getWhatsappChat(id: number): Promise<WhatsappChat | undefined> {
    const result = await db.select().from(whatsappChats).where(eq(whatsappChats.id, id));
    return result[0];
  }

  async getWhatsappChatsByConsultantId(consultantId: number): Promise<WhatsappChat[]> {
    return await db
      .select()
      .from(whatsappChats)
      .where(eq(whatsappChats.consultantId, consultantId))
      .orderBy(desc(whatsappChats.lastMessageTime));
  }

  async createWhatsappChat(chat: InsertWhatsappChat): Promise<WhatsappChat> {
    const chatWithDefaults = {
      ...chat,
      createdAt: new Date(),
      lastMessageTime: new Date(),
      unreadCount: 0
    };
    const result = await db.insert(whatsappChats).values(chatWithDefaults).returning();
    return result[0];
  }

  async updateWhatsappChat(id: number, chat: Partial<WhatsappChat>): Promise<WhatsappChat | undefined> {
    const result = await db.update(whatsappChats).set(chat).where(eq(whatsappChats.id, id)).returning();
    return result[0];
  }

  // WhatsApp Messages methods
  async getWhatsappMessagesByChatId(chatId: number): Promise<WhatsappMessage[]> {
    return await db
      .select()
      .from(whatsappMessages)
      .where(eq(whatsappMessages.chatId, chatId))
      .orderBy(asc(whatsappMessages.timestamp));
  }

  async createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage> {
    const messageWithDefaults = {
      ...message,
      createdAt: new Date()
    };
    const result = await db.insert(whatsappMessages).values(messageWithDefaults).returning();
    return result[0];
  }
  // CRM Meetings implementation
  async getCrmMeetings(): Promise<CrmMeeting[]> {
    try {
      return await db.select().from(crmMeetings).orderBy(desc(crmMeetings.meetingDate));
    } catch (error) {
      console.error("Error fetching CRM meetings:", error);
      return [];
    }
  }

  async getCrmMeetingsByLeadId(leadId: number): Promise<CrmMeeting[]> {
    return await db
      .select()
      .from(crmMeetings)
      .where(eq(crmMeetings.leadId, leadId))
      .orderBy(desc(crmMeetings.meetingDate));
  }

  async getCrmMeetingsByCorporateLeadId(corporateLeadId: number): Promise<CrmMeeting[]> {
    return await db
      .select()
      .from(crmMeetings)
      .where(eq(crmMeetings.corporateLeadId, corporateLeadId))
      .orderBy(desc(crmMeetings.meetingDate));
  }

  async getCrmMeetingsByAssignedTo(userId: number): Promise<CrmMeeting[]> {
    return await db
      .select()
      .from(crmMeetings)
      .where(eq(crmMeetings.assignedTo, userId))
      .orderBy(desc(crmMeetings.meetingDate));
  }

  async getCrmMeetingsByDate(date: Date): Promise<CrmMeeting[]> {
    // Format date to YYYY-MM-DD for comparison
    const dateStr = date.toISOString().split('T')[0];
    
    // Create start and end date range for the given day
    const startDate = new Date(`${dateStr}T00:00:00.000Z`);
    const endDate = new Date(`${dateStr}T23:59:59.999Z`);
    
    return await db
      .select()
      .from(crmMeetings)
      .where(
        and(
          gte(crmMeetings.meetingDate, startDate),
          lte(crmMeetings.meetingDate, endDate)
        )
      )
      .orderBy(asc(crmMeetings.meetingDate));
  }

  async getCrmMeetingsByStatus(status: string): Promise<CrmMeeting[]> {
    return await db
      .select()
      .from(crmMeetings)
      .where(eq(crmMeetings.status, status))
      .orderBy(desc(crmMeetings.meetingDate));
  }

  async getCrmMeeting(id: number): Promise<CrmMeeting | undefined> {
    const result = await db.select().from(crmMeetings).where(eq(crmMeetings.id, id));
    return result[0];
  }

  async createCrmMeeting(meeting: InsertCrmMeeting): Promise<CrmMeeting> {
    const meetingWithDefaults = {
      ...meeting,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.insert(crmMeetings).values(meetingWithDefaults).returning();
    return result[0];
  }

  async updateCrmMeeting(id: number, meeting: Partial<CrmMeeting>): Promise<CrmMeeting | undefined> {
    const updatedData = {
      ...meeting,
      updatedAt: new Date()
    };
    const result = await db.update(crmMeetings).set(updatedData).where(eq(crmMeetings.id, id)).returning();
    return result[0];
  }

  async deleteCrmMeeting(id: number): Promise<boolean> {
    const result = await db.delete(crmMeetings).where(eq(crmMeetings.id, id)).returning();
    return result.length > 0;
  }

  async markMeetingNotificationSent(id: number): Promise<CrmMeeting | undefined> {
    const result = await db
      .update(crmMeetings)
      .set({ 
        notificationSent: true,
        updatedAt: new Date()
      })
      .where(eq(crmMeetings.id, id))
      .returning();
    return result[0];
  }

  async markMeetingReminderSent(id: number): Promise<CrmMeeting | undefined> {
    const result = await db
      .update(crmMeetings)
      .set({ 
        reminderSent: true,
        updatedAt: new Date()
      })
      .where(eq(crmMeetings.id, id))
      .returning();
    return result[0];
  }

  // Corporate Leads implementation
  async getCorporateLeads(): Promise<CorporateLead[]> {
    try {
      return await db.select().from(corporateLeads).orderBy(desc(corporateLeads.createdAt));
    } catch (error) {
      console.error("Error fetching corporate leads:", error);
      return [];
    }
  }

  async getCorporateLeadsByConsultant(consultantId: number): Promise<CorporateLead[]> {
    return await db
      .select()
      .from(corporateLeads)
      .where(eq(corporateLeads.consultantId, consultantId))
      .orderBy(desc(corporateLeads.createdAt));
  }

  async getCorporateLeadsByStatus(status: string): Promise<CorporateLead[]> {
    return await db
      .select()
      .from(corporateLeads)
      .where(eq(corporateLeads.status, status))
      .orderBy(desc(corporateLeads.createdAt));
  }

  async getCorporateLeadsByPriority(priority: string): Promise<CorporateLead[]> {
    return await db
      .select()
      .from(corporateLeads)
      .where(eq(corporateLeads.priority, priority))
      .orderBy(desc(corporateLeads.createdAt));
  }

  async getCorporateLead(id: number): Promise<CorporateLead | undefined> {
    const result = await db.select().from(corporateLeads).where(eq(corporateLeads.id, id));
    return result[0];
  }

  async createCorporateLead(lead: InsertCorporateLead): Promise<CorporateLead> {
    const leadWithDefaults = {
      ...lead,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.insert(corporateLeads).values(leadWithDefaults).returning();
    return result[0];
  }

  async updateCorporateLead(id: number, lead: Partial<CorporateLead>): Promise<CorporateLead | undefined> {
    const updatedData = {
      ...lead,
      updatedAt: new Date()
    };
    const result = await db.update(corporateLeads).set(updatedData).where(eq(corporateLeads.id, id)).returning();
    return result[0];
  }

  async deleteCorporateLead(id: number): Promise<boolean> {
    const result = await db.delete(corporateLeads).where(eq(corporateLeads.id, id)).returning();
    return result.length > 0;
  }

  // CRM Posts implementation
  async getCrmPosts(): Promise<CrmPost[]> {
    try {
      return await db.select().from(crmPosts).orderBy(desc(crmPosts.createdAt));
    } catch (error) {
      console.error("Error fetching CRM posts:", error);
      return [];
    }
  }

  async getCrmPostsByCategory(category: string): Promise<CrmPost[]> {
    return await db
      .select()
      .from(crmPosts)
      .where(eq(crmPosts.category, category))
      .orderBy(desc(crmPosts.createdAt));
  }

  async getCrmPostsByCreator(userId: number): Promise<CrmPost[]> {
    return await db
      .select()
      .from(crmPosts)
      .where(eq(crmPosts.createdBy, userId))
      .orderBy(desc(crmPosts.createdAt));
  }

  async getCrmPostsByTags(tags: string[]): Promise<CrmPost[]> {
    // This is a simplified implementation - ideally we would use an array contains operator
    // But for simplicity, we'll fetch all posts and filter in memory
    const allPosts = await this.getCrmPosts();
    
    return allPosts.filter(post => {
      if (!post.tags || !post.tags.length) return false;
      
      // Check if any of the requested tags exists in the post's tags
      return tags.some(tag => post.tags.includes(tag));
    });
  }

  async getCrmPost(id: number): Promise<CrmPost | undefined> {
    const result = await db.select().from(crmPosts).where(eq(crmPosts.id, id));
    return result[0];
  }

  async createCrmPost(post: InsertCrmPost): Promise<CrmPost> {
    const postWithDefaults = {
      ...post,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      downloadCount: 0,
      shareCount: 0,
      approved: false,
      approvedBy: null,
      approvedAt: null
    };
    const result = await db.insert(crmPosts).values(postWithDefaults).returning();
    return result[0];
  }

  async updateCrmPost(id: number, post: Partial<CrmPost>): Promise<CrmPost | undefined> {
    const updatedData = {
      ...post,
      updatedAt: new Date()
    };
    const result = await db.update(crmPosts).set(updatedData).where(eq(crmPosts.id, id)).returning();
    return result[0];
  }

  async deleteCrmPost(id: number): Promise<boolean> {
    const result = await db.delete(crmPosts).where(eq(crmPosts.id, id)).returning();
    return result.length > 0;
  }

  async incrementCrmPostViewCount(id: number): Promise<CrmPost | undefined> {
    const post = await this.getCrmPost(id);
    if (!post) return undefined;
    
    const result = await db
      .update(crmPosts)
      .set({ 
        viewCount: (post.viewCount || 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(crmPosts.id, id))
      .returning();
    return result[0];
  }

  async incrementCrmPostDownloadCount(id: number): Promise<CrmPost | undefined> {
    const post = await this.getCrmPost(id);
    if (!post) return undefined;
    
    const result = await db
      .update(crmPosts)
      .set({ 
        downloadCount: (post.downloadCount || 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(crmPosts.id, id))
      .returning();
    return result[0];
  }

  async incrementCrmPostShareCount(id: number): Promise<CrmPost | undefined> {
    const post = await this.getCrmPost(id);
    if (!post) return undefined;
    
    const result = await db
      .update(crmPosts)
      .set({ 
        shareCount: (post.shareCount || 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(crmPosts.id, id))
      .returning();
    return result[0];
  }

  async approveCrmPost(id: number, approvedBy: number): Promise<CrmPost | undefined> {
    const result = await db
      .update(crmPosts)
      .set({ 
        approved: true,
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(crmPosts.id, id))
      .returning();
    return result[0];
  }
  
  // WhatsApp Integration methods (new format)
  async getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
    try {
      return await db.select().from(whatsAppTemplates);
    } catch (error) {
      console.error("Error fetching WhatsApp templates:", error);
      return [];
    }
  }
  
  async getWhatsAppTemplatesByCategory(category: string): Promise<WhatsAppTemplate[]> {
    return await db
      .select()
      .from(whatsAppTemplates)
      .where(eq(whatsAppTemplates.category, category));
  }
  
  async getWhatsAppTemplate(id: number): Promise<WhatsAppTemplate | undefined> {
    const result = await db.select().from(whatsAppTemplates).where(eq(whatsAppTemplates.id, id));
    return result[0];
  }
  
  async createWhatsAppTemplate(template: InsertWhatsAppTemplate): Promise<WhatsAppTemplate> {
    const result = await db.insert(whatsAppTemplates).values(template).returning();
    return result[0];
  }
  
  async updateWhatsAppTemplate(id: number, template: Partial<WhatsAppTemplate>): Promise<WhatsAppTemplate | undefined> {
    const result = await db.update(whatsAppTemplates).set(template).where(eq(whatsAppTemplates.id, id)).returning();
    return result[0];
  }
  
  async deleteWhatsAppTemplate(id: number): Promise<boolean> {
    const result = await db.delete(whatsAppTemplates).where(eq(whatsAppTemplates.id, id)).returning();
    return result.length > 0;
  }
  
  // WhatsApp Chats (new format)
  async getWhatsAppChats(): Promise<WhatsAppChat[]> {
    try {
      return await db.select().from(whatsAppChats).orderBy(desc(whatsAppChats.lastActivity));
    } catch (error) {
      console.error("Error fetching WhatsApp chats:", error);
      return [];
    }
  }
  
  async getWhatsAppChatsByPhoneNumber(phoneNumber: string): Promise<WhatsAppChat[]> {
    return await db
      .select()
      .from(whatsAppChats)
      .where(eq(whatsAppChats.phoneNumber, phoneNumber))
      .orderBy(desc(whatsAppChats.lastActivity));
  }
  
  async getWhatsAppChatsByLead(leadId: number): Promise<WhatsAppChat[]> {
    return await db
      .select()
      .from(whatsAppChats)
      .where(eq(whatsAppChats.leadId, leadId))
      .orderBy(desc(whatsAppChats.lastActivity));
  }
  
  async getWhatsAppChatsByCorporateLead(corporateLeadId: number): Promise<WhatsAppChat[]> {
    return await db
      .select()
      .from(whatsAppChats)
      .where(eq(whatsAppChats.corporateLeadId, corporateLeadId))
      .orderBy(desc(whatsAppChats.lastActivity));
  }
  
  async getWhatsAppChatsByMeeting(meetingId: number): Promise<WhatsAppChat[]> {
    return await db
      .select()
      .from(whatsAppChats)
      .where(eq(whatsAppChats.meetingId, meetingId))
      .orderBy(desc(whatsAppChats.lastActivity));
  }
  
  async getWhatsAppChat(id: number): Promise<WhatsAppChat | undefined> {
    const result = await db.select().from(whatsAppChats).where(eq(whatsAppChats.id, id));
    return result[0];
  }
  
  async createWhatsAppChat(chat: InsertWhatsAppChat): Promise<WhatsAppChat> {
    const chatWithDefaults = {
      ...chat,
      lastActivity: new Date(),
      createdAt: new Date()
    };
    const result = await db.insert(whatsAppChats).values(chatWithDefaults).returning();
    return result[0];
  }
  
  async updateWhatsAppChatStatus(id: number, status: string): Promise<WhatsAppChat | undefined> {
    const result = await db
      .update(whatsAppChats)
      .set({ 
        status,
        lastActivity: new Date()
      })
      .where(eq(whatsAppChats.id, id))
      .returning();
    return result[0];
  }
  
  // Registration Courses methods
  async getRegistrationCourses(studentId: number): Promise<RegistrationCourse[]> {
    try {
      return await db
        .select()
        .from(registrationCourses)
        .where(eq(registrationCourses.studentId, studentId));
    } catch (error) {
      console.error("Error fetching registration courses:", error);
      return [];
    }
  }
  
  async getRegistrationCourse(id: number): Promise<RegistrationCourse | undefined> {
    try {
      const [course] = await db
        .select()
        .from(registrationCourses)
        .where(eq(registrationCourses.id, id));
      return course;
    } catch (error) {
      console.error("Error fetching registration course:", error);
      return undefined;
    }
  }
  
  async createRegistrationCourse(course: InsertRegistrationCourse): Promise<RegistrationCourse> {
    try {
      const [newCourse] = await db
        .insert(registrationCourses)
        .values(course)
        .returning();
      return newCourse;
    } catch (error) {
      console.error("Error creating registration course:", error);
      throw error;
    }
  }
  
  async deleteRegistrationCourse(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(registrationCourses)
        .where(eq(registrationCourses.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting registration course:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
