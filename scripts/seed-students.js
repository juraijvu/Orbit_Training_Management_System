/**
 * Script to seed sample student data and invoices
 * 
 * Run this script to create sample students with their registration courses and invoices
 */

import { db } from "../server/db.js";
import { students, registrationCourses, invoices } from "../shared/schema.js";
import { eq } from "drizzle-orm";

async function seedStudents() {
  console.log("Seeding sample student data...");
  
  try {
    // First, check if we already have some students
    const existingStudents = await db.select({ count: db.fn.count() }).from(students);
    
    if (parseInt(existingStudents[0].count) > 0) {
      console.log(`Found ${existingStudents[0].count} existing students, skipping student seeding`);
      return;
    }
    
    // Sample student data
    const sampleStudents = [
      {
        firstName: "Ahmed",
        lastName: "Al-Mansoori",
        email: "ahmed.almansoori@example.com",
        phoneNo: "+971501234567",
        alternativeNo: "+971551234567",
        dateOfBirth: "1995-03-15",
        passportNo: "A12345678",
        emiratesIdNo: "784-1995-1234567-8",
        nationality: "Emirati",
        education: "Bachelor's in Civil Engineering",
        address: "Villa 23, Al Wasl Road, Dubai",
        country: "United Arab Emirates",
        companyOrUniversityName: "Dubai Municipality",
        classType: "offline",
        studentId: "ST-2023-001",
        registrationNumber: "ORB-2023-001",
        createdAt: new Date(),
        createdBy: 2 // superadmin
      },
      {
        firstName: "Sara",
        lastName: "Khan",
        email: "sara.khan@example.com",
        phoneNo: "+971502345678",
        alternativeNo: null,
        dateOfBirth: "1998-07-22",
        passportNo: "B87654321",
        emiratesIdNo: "784-1998-7654321-0",
        nationality: "Pakistani",
        education: "Bachelor's in Computer Science",
        address: "Apartment 405, Al Nahda 2, Dubai",
        country: "United Arab Emirates",
        companyOrUniversityName: "Tech Solutions LLC",
        classType: "online",
        studentId: "ST-2023-002",
        registrationNumber: "ORB-2023-002",
        createdAt: new Date(),
        createdBy: 2 // superadmin
      },
      {
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@example.com",
        phoneNo: "+971503456789",
        alternativeNo: "+971553456789",
        dateOfBirth: "1990-11-10",
        passportNo: "C45678901",
        emiratesIdNo: "784-1990-4567890-1",
        nationality: "British",
        education: "Master's in Architecture",
        address: "Villa 78, Jumeirah 3, Dubai",
        country: "United Arab Emirates",
        companyOrUniversityName: "ABC Architects",
        classType: "private",
        studentId: "ST-2023-003",
        registrationNumber: "ORB-2023-003",
        createdAt: new Date(),
        createdBy: 2 // superadmin
      }
    ];
    
    // Insert students
    for (const student of sampleStudents) {
      await db.insert(students).values(student);
    }
    
    console.log(`Added ${sampleStudents.length} sample students`);
    
    // Get the students we just inserted
    const insertedStudents = await db.select().from(students);
    
    // Get courses
    const courses = await db.execute(
      'SELECT id, name, fee, online_rate, offline_rate, private_rate, batch_rate FROM courses'
    );
    
    if (!courses.length) {
      console.error("No courses found. Please seed courses first.");
      return;
    }
    
    // Sample registration courses
    const registrationCoursesData = [];
    
    // For each student, register 1-2 courses
    for (const student of insertedStudents) {
      // Get 1-2 random courses
      const numberOfCourses = Math.floor(Math.random() * 2) + 1;
      const shuffledCourses = [...courses].sort(() => 0.5 - Math.random());
      const selectedCourses = shuffledCourses.slice(0, numberOfCourses);
      
      for (const course of selectedCourses) {
        // Calculate price based on class type
        let price;
        
        switch (student.classType) {
          case "online":
            price = parseFloat(course.online_rate || course.fee);
            break;
          case "offline":
            price = parseFloat(course.offline_rate || course.fee);
            break;
          case "private":
            price = parseFloat(course.private_rate || course.fee);
            break;
          case "batch":
            price = parseFloat(course.batch_rate || course.fee);
            break;
          default:
            price = parseFloat(course.fee);
        }
        
        // Apply random discount (0-15%)
        const discount = Math.floor(Math.random() * 16); // 0-15
        
        registrationCoursesData.push({
          studentId: student.id,
          courseId: course.id,
          price: price.toString(),
          discount: discount.toString(),
          createdAt: new Date()
        });
      }
    }
    
    // Insert registration courses
    for (const course of registrationCoursesData) {
      await db.insert(registrationCourses).values(course);
    }
    
    console.log(`Added ${registrationCoursesData.length} registration courses`);
    
    // Create invoices for each student
    const invoiceData = [];
    
    for (const student of insertedStudents) {
      // Get registration courses for this student
      const studentCourses = registrationCoursesData.filter(c => c.studentId === student.id);
      
      if (studentCourses.length === 0) continue;
      
      // Calculate total amount
      let totalAmount = 0;
      
      for (const course of studentCourses) {
        const price = parseFloat(course.price);
        const discount = parseFloat(course.discount);
        const discountAmount = price * (discount / 100);
        totalAmount += price - discountAmount;
      }
      
      // Add VAT (5%)
      totalAmount += totalAmount * 0.05;
      
      // Generate invoice number
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(student.id).padStart(3, '0')}`;
      
      // Random payment mode
      const paymentModes = ["Cash", "Card", "Tabby", "Tamara"];
      const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];
      
      // Random status (80% paid, 20% pending)
      const status = Math.random() < 0.8 ? "paid" : "pending";
      
      // Transaction ID for card payments
      const transactionId = paymentMode === "Card" ? `TXN-${Math.floor(Math.random() * 1000000)}` : null;
      
      invoiceData.push({
        invoiceNumber,
        studentId: student.id,
        amount: totalAmount.toFixed(2),
        paymentMode,
        transactionId,
        paymentDate: new Date(),
        status,
        createdAt: new Date()
      });
    }
    
    // Insert invoices
    for (const invoice of invoiceData) {
      await db.insert(invoices).values(invoice);
    }
    
    console.log(`Added ${invoiceData.length} invoices`);
    
  } catch (error) {
    console.error("Error seeding student data:", error);
  }
}

// Run the seeding function
seedStudents().then(() => {
  console.log("Student seeding completed");
  process.exit(0);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});