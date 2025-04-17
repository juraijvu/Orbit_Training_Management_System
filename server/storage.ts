import {
  users, User, InsertUser,
  students, Student, InsertStudent,
  courses, Course, InsertCourse,
  trainers, Trainer, InsertTrainer,
  invoices, Invoice, InsertInvoice,
  schedules, Schedule, InsertSchedule,
  certificates, Certificate, InsertCertificate,
  quotations, Quotation, InsertQuotation,
  proposals, Proposal, InsertProposal,
  leads, Lead, InsertLead,
  campaigns, Campaign, InsertCampaign,
  followUps, FollowUp, InsertFollowUp
} from "@shared/schema";
import { db } from "./db";
import { eq, and, asc, desc, gte, lte, lt } from "drizzle-orm";
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
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<Student>): Promise<Student | undefined>;
  
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
  private proposalsMap: Map<number, Proposal>;
  private leadsMap: Map<number, Lead>;
  private campaignsMap: Map<number, Campaign>;
  private followUpsMap: Map<number, FollowUp>;
  
  private userId: number = 1;
  private studentId: number = 1;
  private courseId: number = 1;
  private trainerId: number = 1;
  private invoiceId: number = 1;
  private scheduleId: number = 1;
  private certificateId: number = 1;
  private quotationId: number = 1;
  private proposalId: number = 1;
  private leadId: number = 1;
  private campaignId: number = 1;
  private followUpId: number = 1;
  
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
    this.proposalsMap = new Map();
    this.leadsMap = new Map();
    this.campaignsMap = new Map();
    this.followUpsMap = new Map();
    
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
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
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

  async createStudent(student: InsertStudent): Promise<Student> {
    const studentWithDefaults = {
      ...student,
      createdAt: new Date(),
      discount: student.discount || null,
      registrationDate: student.registrationDate || new Date()
    };
    const result = await db.insert(students).values(studentWithDefaults).returning();
    return result[0];
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
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
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
    return await db
      .select()
      .from(followUps)
      .orderBy([asc(followUps.nextFollowUp), asc(followUps.nextFollowUpTime)]);
  }

  async getFollowUpsByLeadId(leadId: number): Promise<FollowUp[]> {
    return await db
      .select()
      .from(followUps)
      .where(eq(followUps.leadId, leadId))
      .orderBy(desc(followUps.contactDate));
  }

  async getFollowUpsByConsultant(consultantId: number): Promise<FollowUp[]> {
    return await db
      .select()
      .from(followUps)
      .where(eq(followUps.consultantId, consultantId))
      .orderBy([asc(followUps.nextFollowUp), asc(followUps.nextFollowUpTime)]);
  }

  async getPendingFollowUps(): Promise<FollowUp[]> {
    return await db
      .select()
      .from(followUps)
      .where(eq(followUps.status, "Pending"))
      .orderBy([asc(followUps.nextFollowUp), asc(followUps.nextFollowUpTime)]);
  }

  async getTodaysFollowUps(consultantId?: number): Promise<FollowUp[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let query = db
      .select()
      .from(followUps)
      .where(
        and(
          gte(followUps.nextFollowUp, today),
          lt(followUps.nextFollowUp, tomorrow),
          eq(followUps.status, "Pending")
        )
      );
      
    if (consultantId) {
      query = query.where(eq(followUps.consultantId, consultantId));
    }
    
    return await query.orderBy(asc(followUps.nextFollowUpTime));
  }

  async getHighPriorityFollowUps(consultantId?: number): Promise<FollowUp[]> {
    let query = db
      .select()
      .from(followUps)
      .where(
        and(
          eq(followUps.priority, "High"),
          eq(followUps.status, "Pending")
        )
      );
      
    if (consultantId) {
      query = query.where(eq(followUps.consultantId, consultantId));
    }
    
    return await query.orderBy([asc(followUps.nextFollowUp), asc(followUps.nextFollowUpTime)]);
  }

  async getFollowUpsToNotify(): Promise<FollowUp[]> {
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
      .orderBy([asc(followUps.nextFollowUp), asc(followUps.nextFollowUpTime)]);
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
}

// Create a storage instance (database or memory)
export const storage = new DatabaseStorage();
