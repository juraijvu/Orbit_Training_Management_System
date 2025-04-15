import {
  users, User, InsertUser,
  students, Student, InsertStudent,
  courses, Course, InsertCourse,
  trainers, Trainer, InsertTrainer,
  invoices, Invoice, InsertInvoice,
  schedules, Schedule, InsertSchedule,
  certificates, Certificate, InsertCertificate,
  quotations, Quotation, InsertQuotation,
  proposals, Proposal, InsertProposal
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  
  // Session store
  sessionStore: session.SessionStore;
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
  
  private userId: number = 1;
  private studentId: number = 1;
  private courseId: number = 1;
  private trainerId: number = 1;
  private invoiceId: number = 1;
  private scheduleId: number = 1;
  private certificateId: number = 1;
  private quotationId: number = 1;
  private proposalId: number = 1;
  
  sessionStore: session.SessionStore;

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
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize with sample data
    this.initializeData();
  }
  
  private initializeData() {
    // Add a default admin user
    this.createUser({
      username: "admin",
      password: "password", // This will be hashed in auth.ts
      role: "admin",
      fullName: "Admin User",
      email: "admin@orbitinstitute.com",
      phone: "+91 1234567890"
    });
    
    // Add a super admin user
    this.createUser({
      username: "superadmin",
      password: "password", // This will be hashed in auth.ts
      role: "superadmin",
      fullName: "Super Admin",
      email: "superadmin@orbitinstitute.com",
      phone: "+91 9876543210"
    });
  }

  // Users methods
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
    const newUser: User = { ...user, id };
    this.usersMap.set(id, newUser);
    return newUser;
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
}

export const storage = new MemStorage();
