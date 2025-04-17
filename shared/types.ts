import { z } from "zod";

// Enums
export enum PaymentStatus {
  PAID = "paid",
  PARTIAL = "partial",
  PENDING = "pending"
}

export enum PaymentMode {
  CASH = "cash",
  UPI = "upi",
  BANK_TRANSFER = "bank_transfer",
  CHEQUE = "cheque"
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other"
}

export enum BatchType {
  MORNING = "morning",
  AFTERNOON = "afternoon",
  EVENING = "evening",
  WEEKEND = "weekend"
}

export enum QuotationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected"
}

export enum ProposalStatus {
  DRAFT = "draft",
  SENT = "sent",
  ACCEPTED = "accepted",
  REJECTED = "rejected"
}

export enum UserRole {
  COUNSELOR = "counselor",
  ADMIN = "admin",
  SUPERADMIN = "superadmin"
}

export enum ScheduleStatus {
  CONFIRMED = "confirmed",
  PENDING = "pending",
  CANCELLED = "cancelled"
}

// Activity Interface
export interface Activity {
  id: string;
  type: 'registration' | 'invoice' | 'schedule' | 'certificate';
  message: string;
  detail: string;
  timestamp: Date;
}

// Dashboard Stats Interface
export interface DashboardStats {
  totalStudents: number;
  activeCourses: number;
  revenue: number;
  certificates: number;
}

// PDF Generation Types
export interface RegistrationPdfData {
  studentId: string;
  fullName: string;
  fatherName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  course: string;
  batch: string;
  registrationDate: string;
  courseFee: number;
  discount: number;
  totalFee: number;
  initialPayment: number;
  balanceDue: number;
  paymentMode: string;
}

export interface InvoicePdfData {
  invoiceNumber: string;
  studentId: string;
  fullName: string;
  address: string;
  phone: string;
  date: string;
  paymentStatus: string;
  course: string;
  duration: string;
  amount: number;
  discount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  paymentMode: string;
  transactionId?: string;
}

export interface CertificatePdfData {
  certificateNumber: string;
  studentName: string;
  courseName: string;
  issueDate: string;
}

export interface QuotationPdfData {
  quotationNumber: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  courseName: string;
  participants: number;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  validity: string;
  date: string;
}

export interface ProposalPdfData {
  proposalNumber: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  courses: string[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  coverPage: string;
  presenterName: string;
  presenterDetails: string;
  courseFormat: string;
  trainingDuration: string;
  trainingLocation: string;
  content: object;
  date: string;
  logo?: string;
  applyWhiteFilter?: boolean;
}
