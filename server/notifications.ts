import { storage } from './storage';
import { Invoice, Schedule, Student } from '@shared/schema';
import { format } from 'date-fns';

export interface EmailNotificationService {
  // Schedule notifications
  sendScheduleCreationNotice(schedule: Schedule, students: Student[], courseName: string, trainerName: string): Promise<boolean>;
  sendScheduleUpdateNotice(schedule: Schedule, students: Student[], courseName: string, trainerName: string): Promise<boolean>;
  sendScheduleCancellationNotice(schedule: Schedule, students: Student[], courseName: string, trainerName: string): Promise<boolean>;
  sendScheduleReminder(schedule: Schedule, students: Student[], courseName: string, trainerName: string, hoursBeforeStart: number): Promise<boolean>;
  
  // Invoice notifications
  sendInvoiceCreationNotice(invoice: Invoice, student: Student, courseName: string): Promise<boolean>;
  sendPaymentReceiptNotice(invoice: Invoice, student: Student, courseName: string): Promise<boolean>;
  sendPaymentDueReminder(invoice: Invoice, student: Student, courseName: string, daysOverdue: number): Promise<boolean>;
}

export class EmailNotificationServiceImpl implements EmailNotificationService {
  
  // Schedule Notifications
  async sendScheduleCreationNotice(schedule: Schedule, students: Student[], courseName: string, trainerName: string): Promise<boolean> {
    try {
      // Generate email for each student
      const results = await Promise.all(students.map(async (student) => {
        if (!student.email) {
          console.warn(`Cannot send schedule creation notice: Student ${student.id} has no email`);
          return false;
        }
        
        const subject = `New Class Schedule: ${courseName}`;
        const startDate = format(new Date(schedule.startTime), 'PPP');
        const startTime = format(new Date(schedule.startTime), 'p');
        const endTime = format(new Date(schedule.endTime), 'p');
        
        const bodyText = `Dear ${student.fullName},

We're pleased to inform you that a new class session has been scheduled:

Course: ${courseName}
Trainer: ${trainerName}
Date: ${startDate}
Time: ${startTime} - ${endTime}
Title: ${schedule.title}

Please ensure you are present at the scheduled time.

Regards,
Orbit Institute`;

        const bodyHtml = `
<p>Dear ${student.fullName},</p>

<p>We're pleased to inform you that a new class session has been scheduled:</p>

<ul>
  <li><strong>Course:</strong> ${courseName}</li>
  <li><strong>Trainer:</strong> ${trainerName}</li>
  <li><strong>Date:</strong> ${startDate}</li>
  <li><strong>Time:</strong> ${startTime} - ${endTime}</li>
  <li><strong>Title:</strong> ${schedule.title}</li>
</ul>

<p>Please ensure you are present at the scheduled time.</p>

<p>Regards,<br>
Orbit Institute</p>`;
        
        // Create email record
        await storage.createEmailHistory({
          recipientEmail: student.email,
          recipientName: student.fullName,
          subject,
          bodyText,
          bodyHtml,
          status: "sent",
          studentId: student.id,
          createdBy: schedule.createdBy
        });
        
        return true;
      }));
      
      return results.some(result => result === true);
    } catch (error) {
      console.error('Failed to send schedule creation notice:', error);
      return false;
    }
  }
  
  async sendScheduleUpdateNotice(schedule: Schedule, students: Student[], courseName: string, trainerName: string): Promise<boolean> {
    try {
      // Generate email for each student
      const results = await Promise.all(students.map(async (student) => {
        if (!student.email) {
          console.warn(`Cannot send schedule update notice: Student ${student.id} has no email`);
          return false;
        }
        
        const subject = `Updated Class Schedule: ${courseName}`;
        const startDate = format(new Date(schedule.startTime), 'PPP');
        const startTime = format(new Date(schedule.startTime), 'p');
        const endTime = format(new Date(schedule.endTime), 'p');
        
        const bodyText = `Dear ${student.fullName},

Please note that a class session has been updated:

Course: ${courseName}
Trainer: ${trainerName}
Date: ${startDate}
Time: ${startTime} - ${endTime}
Title: ${schedule.title}

Please make a note of these changes and ensure you are present at the rescheduled time.

Regards,
Orbit Institute`;

        const bodyHtml = `
<p>Dear ${student.fullName},</p>

<p>Please note that a class session has been updated:</p>

<ul>
  <li><strong>Course:</strong> ${courseName}</li>
  <li><strong>Trainer:</strong> ${trainerName}</li>
  <li><strong>Date:</strong> ${startDate}</li>
  <li><strong>Time:</strong> ${startTime} - ${endTime}</li>
  <li><strong>Title:</strong> ${schedule.title}</li>
</ul>

<p>Please make a note of these changes and ensure you are present at the rescheduled time.</p>

<p>Regards,<br>
Orbit Institute</p>`;
        
        // Create email record
        await storage.createEmailHistory({
          recipientEmail: student.email,
          recipientName: student.fullName,
          subject,
          bodyText,
          bodyHtml,
          status: "sent",
          studentId: student.id,
          createdBy: schedule.createdBy
        });
        
        return true;
      }));
      
      return results.some(result => result === true);
    } catch (error) {
      console.error('Failed to send schedule update notice:', error);
      return false;
    }
  }
  
  async sendScheduleCancellationNotice(schedule: Schedule, students: Student[], courseName: string, trainerName: string): Promise<boolean> {
    try {
      // Generate email for each student
      const results = await Promise.all(students.map(async (student) => {
        if (!student.email) {
          console.warn(`Cannot send schedule cancellation notice: Student ${student.id} has no email`);
          return false;
        }
        
        const subject = `Cancelled Class: ${courseName}`;
        const startDate = format(new Date(schedule.startTime), 'PPP');
        const startTime = format(new Date(schedule.startTime), 'p');
        
        const bodyText = `Dear ${student.fullName},

We regret to inform you that the following class has been cancelled:

Course: ${courseName}
Trainer: ${trainerName}
Date: ${startDate}
Time: ${startTime}
Title: ${schedule.title}

We apologize for any inconvenience this may cause. A new schedule will be communicated to you shortly.

Regards,
Orbit Institute`;

        const bodyHtml = `
<p>Dear ${student.fullName},</p>

<p>We regret to inform you that the following class has been cancelled:</p>

<ul>
  <li><strong>Course:</strong> ${courseName}</li>
  <li><strong>Trainer:</strong> ${trainerName}</li>
  <li><strong>Date:</strong> ${startDate}</li>
  <li><strong>Time:</strong> ${startTime}</li>
  <li><strong>Title:</strong> ${schedule.title}</li>
</ul>

<p>We apologize for any inconvenience this may cause. A new schedule will be communicated to you shortly.</p>

<p>Regards,<br>
Orbit Institute</p>`;
        
        // Create email record
        await storage.createEmailHistory({
          recipientEmail: student.email,
          recipientName: student.fullName,
          subject,
          bodyText,
          bodyHtml,
          status: "sent",
          studentId: student.id,
          createdBy: schedule.createdBy
        });
        
        return true;
      }));
      
      return results.some(result => result === true);
    } catch (error) {
      console.error('Failed to send schedule cancellation notice:', error);
      return false;
    }
  }
  
  async sendScheduleReminder(schedule: Schedule, students: Student[], courseName: string, trainerName: string, hoursBeforeStart: number): Promise<boolean> {
    try {
      // Generate email for each student
      const results = await Promise.all(students.map(async (student) => {
        if (!student.email) {
          console.warn(`Cannot send schedule reminder: Student ${student.id} has no email`);
          return false;
        }
        
        const subject = `Reminder: Upcoming Class for ${courseName}`;
        const startDate = format(new Date(schedule.startTime), 'PPP');
        const startTime = format(new Date(schedule.startTime), 'p');
        const endTime = format(new Date(schedule.endTime), 'p');
        
        const bodyText = `Dear ${student.fullName},

This is a friendly reminder that you have a class coming up in ${hoursBeforeStart} hours:

Course: ${courseName}
Trainer: ${trainerName}
Date: ${startDate}
Time: ${startTime} - ${endTime}
Title: ${schedule.title}

Please ensure you are present at the scheduled time.

Regards,
Orbit Institute`;

        const bodyHtml = `
<p>Dear ${student.fullName},</p>

<p>This is a friendly reminder that you have a class coming up in <strong>${hoursBeforeStart} hours</strong>:</p>

<ul>
  <li><strong>Course:</strong> ${courseName}</li>
  <li><strong>Trainer:</strong> ${trainerName}</li>
  <li><strong>Date:</strong> ${startDate}</li>
  <li><strong>Time:</strong> ${startTime} - ${endTime}</li>
  <li><strong>Title:</strong> ${schedule.title}</li>
</ul>

<p>Please ensure you are present at the scheduled time.</p>

<p>Regards,<br>
Orbit Institute</p>`;
        
        // Create email record
        await storage.createEmailHistory({
          recipientEmail: student.email,
          recipientName: student.fullName,
          subject,
          bodyText,
          bodyHtml,
          status: "sent",
          studentId: student.id,
          createdBy: schedule.createdBy
        });
        
        return true;
      }));
      
      return results.some(result => result === true);
    } catch (error) {
      console.error('Failed to send schedule reminder:', error);
      return false;
    }
  }
  
  // Invoice Notifications
  async sendInvoiceCreationNotice(invoice: Invoice, student: Student, courseName: string): Promise<boolean> {
    try {
      if (!student.email) {
        console.warn(`Cannot send invoice creation notice: Student ${student.id} has no email`);
        return false;
      }
      
      const subject = `New Invoice #${invoice.invoiceNumber}`;
      const paymentDate = format(new Date(invoice.paymentDate), 'PPP');
      
      const bodyText = `Dear ${student.fullName},

An invoice has been created for your course registration:

Invoice Number: ${invoice.invoiceNumber}
Course: ${courseName}
Amount: AED ${invoice.amount}
Payment Status: ${invoice.status}
Date: ${paymentDate}

Please arrange payment at your earliest convenience.

Regards,
Orbit Institute`;

      const bodyHtml = `
<p>Dear ${student.fullName},</p>

<p>An invoice has been created for your course registration:</p>

<ul>
  <li><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</li>
  <li><strong>Course:</strong> ${courseName}</li>
  <li><strong>Amount:</strong> AED ${invoice.amount}</li>
  <li><strong>Payment Status:</strong> ${invoice.status}</li>
  <li><strong>Date:</strong> ${paymentDate}</li>
</ul>

<p>Please arrange payment at your earliest convenience.</p>

<p>Regards,<br>
Orbit Institute</p>`;
      
      // Create email record
      await storage.createEmailHistory({
        recipientEmail: student.email,
        recipientName: student.fullName,
        subject,
        bodyText,
        bodyHtml,
        status: "sent",
        studentId: student.id,
        createdBy: 1 // system user
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send invoice creation notice:', error);
      return false;
    }
  }
  
  async sendPaymentReceiptNotice(invoice: Invoice, student: Student, courseName: string): Promise<boolean> {
    try {
      if (!student.email) {
        console.warn(`Cannot send payment receipt: Student ${student.id} has no email`);
        return false;
      }
      
      const subject = `Payment Receipt for Invoice #${invoice.invoiceNumber}`;
      const paymentDate = format(new Date(invoice.paymentDate), 'PPP');
      
      const bodyText = `Dear ${student.fullName},

Thank you for your payment. We've received your payment for:

Invoice Number: ${invoice.invoiceNumber}
Course: ${courseName}
Amount: AED ${invoice.amount}
Payment Method: ${invoice.paymentMode}
Transaction ID: ${invoice.transactionId || 'N/A'}
Date: ${paymentDate}

This email serves as your receipt. Please keep it for your records.

Regards,
Orbit Institute`;

      const bodyHtml = `
<p>Dear ${student.fullName},</p>

<p>Thank you for your payment. We've received your payment for:</p>

<ul>
  <li><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</li>
  <li><strong>Course:</strong> ${courseName}</li>
  <li><strong>Amount:</strong> AED ${invoice.amount}</li>
  <li><strong>Payment Method:</strong> ${invoice.paymentMode}</li>
  <li><strong>Transaction ID:</strong> ${invoice.transactionId || 'N/A'}</li>
  <li><strong>Date:</strong> ${paymentDate}</li>
</ul>

<p>This email serves as your receipt. Please keep it for your records.</p>

<p>Regards,<br>
Orbit Institute</p>`;
      
      // Create email record
      await storage.createEmailHistory({
        recipientEmail: student.email,
        recipientName: student.fullName,
        subject,
        bodyText,
        bodyHtml,
        status: "sent",
        studentId: student.id,
        createdBy: 1 // system user
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send payment receipt:', error);
      return false;
    }
  }
  
  async sendPaymentDueReminder(invoice: Invoice, student: Student, courseName: string, daysOverdue: number): Promise<boolean> {
    try {
      if (!student.email) {
        console.warn(`Cannot send payment due reminder: Student ${student.id} has no email`);
        return false;
      }
      
      const subject = `Payment Reminder for Invoice #${invoice.invoiceNumber}`;
      const paymentDate = format(new Date(invoice.paymentDate), 'PPP');
      
      const bodyText = `Dear ${student.fullName},

This is a friendly reminder that payment for the following invoice is now ${daysOverdue} days overdue:

Invoice Number: ${invoice.invoiceNumber}
Course: ${courseName}
Amount: AED ${invoice.amount}
Due Date: ${paymentDate}

Please arrange payment as soon as possible to avoid any disruption to your course access.

Regards,
Orbit Institute`;

      const bodyHtml = `
<p>Dear ${student.fullName},</p>

<p>This is a friendly reminder that payment for the following invoice is now <strong>${daysOverdue} days overdue</strong>:</p>

<ul>
  <li><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</li>
  <li><strong>Course:</strong> ${courseName}</li>
  <li><strong>Amount:</strong> AED ${invoice.amount}</li>
  <li><strong>Due Date:</strong> ${paymentDate}</li>
</ul>

<p>Please arrange payment as soon as possible to avoid any disruption to your course access.</p>

<p>Regards,<br>
Orbit Institute</p>`;
      
      // Create email record
      await storage.createEmailHistory({
        recipientEmail: student.email,
        recipientName: student.fullName,
        subject,
        bodyText,
        bodyHtml,
        status: "sent",
        studentId: student.id,
        createdBy: 1 // system user
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send payment due reminder:', error);
      return false;
    }
  }
}

// Singleton instance
export const emailNotificationService = new EmailNotificationServiceImpl();