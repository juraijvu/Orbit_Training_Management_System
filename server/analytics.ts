import { db } from "./db";
import { students, courses, invoices, registrationCourses, schedules, leads, 
  campaigns, followUps, certificates, trainers } from "@shared/schema";
import { and, desc, sql, eq, gte, lte, sum, between } from "drizzle-orm";
import { count as countFunction } from "drizzle-orm";
import { format, subDays, subMonths, parseISO, startOfMonth, endOfMonth } from "date-fns";

// Define the count function to avoid naming conflicts
const count = countFunction;

// Helper function to format amount with AED
const formatCurrency = (amount: number): string => {
  return `AED ${amount.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Get summary stats for the dashboard
export async function getDashboardStats() {
  // Get total counts
  const [studentCount] = await db.select({ count: count() }).from(students);
  const [courseCount] = await db.select({ count: count() }).from(courses);
  const [trainerCount] = await db.select({ count: count() }).from(trainers);
  const [leadCount] = await db.select({ count: count() }).from(leads);

  // Get revenue stats
  const [totalRevenue] = await db.select({ 
    sum: sum(invoices.amount)
  }).from(invoices);

  // Get this month's revenue
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);

  const [currentMonthRevenue] = await db.select({ 
    sum: sum(invoices.amount)
  }).from(invoices)
    .where(
      and(
        gte(invoices.paymentDate, startOfCurrentMonth),
        lte(invoices.paymentDate, endOfCurrentMonth)
      )
    );

  // Get registrations for the last 6 months
  const monthlyRegistrations = await getMonthlyRegistrations(6);
  
  // Get recent students
  const recentStudents = await db.select()
    .from(students)
    .orderBy(desc(students.registrationDate))
    .limit(5);

  // Get payment status distribution
  const paymentStatusDistribution = await db.select({
    status: students.paymentStatus,
    count: count()
  })
  .from(students)
  .where(sql`${students.paymentStatus} IS NOT NULL`)
  .groupBy(students.paymentStatus);

  // Get top courses by enrollment
  const topCourses = await db.select({
    courseId: registrationCourses.courseId,
    count: count()
  })
  .from(registrationCourses)
  .groupBy(registrationCourses.courseId)
  .orderBy(desc(count()))
  .limit(5);

  // Fetch course details for the top courses
  const courseDetails = await Promise.all(
    topCourses.map(async (course) => {
      const [courseInfo] = await db.select()
        .from(courses)
        .where(eq(courses.id, course.courseId));
      
      return {
        id: courseInfo.id,
        name: courseInfo.name,
        count: course.count
      };
    })
  );

  return {
    counts: {
      students: studentCount.count,
      courses: courseCount.count,
      trainers: trainerCount.count,
      leads: leadCount.count
    },
    revenue: {
      total: formatCurrency(Number(totalRevenue.sum || 0)),
      currentMonth: formatCurrency(Number(currentMonthRevenue.sum || 0))
    },
    monthlyRegistrations,
    recentStudents,
    paymentStatusDistribution,
    topCourses: courseDetails
  };
}

// Get monthly student registrations for a specified number of months
export async function getMonthlyRegistrations(months: number = 6) {
  const result = [];
  const today = new Date();
  
  for (let i = 0; i < months; i++) {
    const startDate = startOfMonth(subMonths(today, i));
    const endDate = endOfMonth(subMonths(today, i));
    
    const [monthCount] = await db.select({
      count: count()
    })
    .from(students)
    .where(
      and(
        gte(students.registrationDate, startDate),
        lte(students.registrationDate, endDate)
      )
    );
    
    result.unshift({
      month: format(startDate, 'MMM yyyy'),
      count: monthCount.count
    });
  }
  
  return result;
}

// Get student analytics
export async function getStudentAnalytics() {
  // Registration trends (last 12 months)
  const registrationTrends = await getMonthlyRegistrations(12);
  
  // Course enrollment distribution
  const courseDistribution = await db.select({
    courseId: registrationCourses.courseId,
    count: count()
  })
  .from(registrationCourses)
  .groupBy(registrationCourses.courseId)
  .orderBy(desc(count()));

  // Fetch course names
  const courseEnrollments = await Promise.all(
    courseDistribution.map(async (item) => {
      const [courseInfo] = await db.select({
        name: courses.name
      })
      .from(courses)
      .where(eq(courses.id, item.courseId));
      
      return {
        course: courseInfo.name,
        students: item.count
      };
    })
  );
  
  // Payment method distribution
  const paymentMethodDistribution = await db.select({
    paymentMode: students.paymentMode,
    count: count()
  })
  .from(students)
  .where(sql`${students.paymentMode} IS NOT NULL`)
  .groupBy(students.paymentMode);
  
  // Class type distribution
  const classTypeDistribution = await db.select({
    classType: students.classType,
    count: count()
  })
  .from(students)
  .where(sql`${students.classType} IS NOT NULL`)
  .groupBy(students.classType);

  // Nationality distribution
  const nationalityDistribution = await db.select({
    nationality: students.nationality,
    count: count()
  })
  .from(students)
  .where(sql`${students.nationality} IS NOT NULL`)
  .groupBy(students.nationality)
  .orderBy(desc(count()))
  .limit(10);

  // Emirates distribution
  const emiratesDistribution = await db.select({
    emirates: students.emirates,
    count: count()
  })
  .from(students)
  .where(sql`${students.emirates} IS NOT NULL`)
  .groupBy(students.emirates);
  
  return {
    registrationTrends,
    courseEnrollments,
    paymentMethodDistribution,
    classTypeDistribution,
    nationalityDistribution,
    emiratesDistribution
  };
}

// Get financial analytics
export async function getFinancialAnalytics() {
  // Monthly revenue for past 12 months
  const monthlyRevenue = await getMonthlyRevenue(12);
  
  // Payment method distribution for invoices
  const paymentMethodDistribution = await db.select({
    paymentMode: invoices.paymentMode,
    count: count(),
    total: sum(invoices.amount)
  })
  .from(invoices)
  .groupBy(invoices.paymentMode);

  // Revenue by course
  const revenueByCourse = await db.select({
    courseId: registrationCourses.courseId,
    total: sum(registrationCourses.price)
  })
  .from(registrationCourses)
  .groupBy(registrationCourses.courseId)
  .orderBy(desc(sum(registrationCourses.price)))
  .limit(10);

  // Fetch course names for revenue by course
  const courseRevenue = await Promise.all(
    revenueByCourse.map(async (item) => {
      const [courseInfo] = await db.select({
        name: courses.name
      })
      .from(courses)
      .where(eq(courses.id, item.courseId));
      
      return {
        course: courseInfo.name,
        revenue: formatCurrency(Number(item.total || 0))
      };
    })
  );

  // Outstanding invoices (unpaid)
  const unpaidInvoices = await db.select({
    count: count(),
    total: sum(invoices.amount)
  })
  .from(invoices)
  .where(eq(invoices.status, 'pending'));
  
  return {
    monthlyRevenue,
    paymentMethodDistribution,
    courseRevenue,
    unpaidInvoices: {
      count: unpaidInvoices[0].count,
      total: formatCurrency(Number(unpaidInvoices[0].total || 0))
    }
  };
}

// Get monthly revenue for a specified number of months
async function getMonthlyRevenue(months: number = 12) {
  const result = [];
  const today = new Date();
  
  for (let i = 0; i < months; i++) {
    const startDate = startOfMonth(subMonths(today, i));
    const endDate = endOfMonth(subMonths(today, i));
    
    const [total] = await db.select({
      total: sum(invoices.amount)
    })
    .from(invoices)
    .where(
      and(
        gte(invoices.paymentDate, startDate),
        lte(invoices.paymentDate, endDate)
      )
    );
    
    result.unshift({
      month: format(startDate, 'MMM yyyy'),
      revenue: Number(total.total || 0)
    });
  }
  
  return result;
}

// Get course analytics
export async function getCourseAnalytics() {
  // Enrollments by course
  const courseEnrollments = await db.select({
    courseId: registrationCourses.courseId,
    count: count()
  })
  .from(registrationCourses)
  .groupBy(registrationCourses.courseId)
  .orderBy(desc(count()));

  // Fetch course details for enrollments
  const courseStats = await Promise.all(
    courseEnrollments.map(async (item) => {
      const [courseInfo] = await db.select()
        .from(courses)
        .where(eq(courses.id, item.courseId));
      
      return {
        id: courseInfo.id,
        name: courseInfo.name,
        description: courseInfo.description,
        fee: formatCurrency(Number(courseInfo.fee)),
        enrollments: item.count
      };
    })
  );

  // Get schedule data for course popularity by time slots
  const scheduleData = await db.select({
    courseId: schedules.courseId,
    startTime: schedules.startTime
  })
  .from(schedules)
  .where(sql`${schedules.startTime} IS NOT NULL`);

  // Process schedule data to get popular time slots
  const timeSlots: Record<string, number> = {};
  scheduleData.forEach(schedule => {
    const hour = new Date(schedule.startTime).getHours();
    const timeSlot = `${hour}:00 - ${hour + 1}:00`;
    
    if (!timeSlots[timeSlot]) {
      timeSlots[timeSlot] = 0;
    }
    
    timeSlots[timeSlot]++;
  });

  const popularTimeSlots = Object.entries(timeSlots)
    .map(([timeSlot, slotCount]) => ({ timeSlot, count: slotCount }))
    .sort((a, b) => b.count - a.count);
  
  return {
    courseStats,
    popularTimeSlots
  };
}

// Get CRM analytics
export async function getCrmAnalytics() {
  // Lead conversion rates
  const [totalLeads] = await db.select({
    count: count()
  }).from(leads);

  const [convertedLeads] = await db.select({
    count: count()
  })
  .from(leads)
  .where(eq(leads.status, 'Converted'));
  
  const conversionRate = totalLeads.count > 0 
    ? ((convertedLeads.count / totalLeads.count) * 100).toFixed(2)
    : '0.00';

  // Lead sources distribution
  const leadSources = await db.select({
    source: leads.source,
    count: count()
  })
  .from(leads)
  .groupBy(leads.source);

  // Lead status distribution
  const leadStatus = await db.select({
    status: leads.status,
    count: count()
  })
  .from(leads)
  .groupBy(leads.status);

  // Follow-up efficiency
  const followUpData = await db.select({
    leadId: followUps.leadId,
    contactDate: followUps.contactDate,
    outcome: followUps.outcome
  })
  .from(followUps);

  // Calculate average follow-ups per conversion
  const leadFollowUps: Record<number, number> = {};
  followUpData.forEach(followUp => {
    if (!leadFollowUps[followUp.leadId]) {
      leadFollowUps[followUp.leadId] = 0;
    }
    leadFollowUps[followUp.leadId]++;
  });

  const totalFollowUps = Object.values(leadFollowUps).reduce((sum, followupCount) => sum + followupCount, 0);
  const avgFollowUpsPerLead = totalLeads.count > 0 
    ? (totalFollowUps / totalLeads.count).toFixed(2)
    : '0.00';
  
  return {
    leadStats: {
      total: totalLeads.count,
      converted: convertedLeads.count,
      conversionRate: `${conversionRate}%`
    },
    leadSources,
    leadStatus,
    followUpStats: {
      totalFollowUps,
      avgFollowUpsPerLead
    }
  };
}

// Get HRM analytics (based on existing frontend mock data)
export async function getHrmAnalytics() {
  // Since the actual HRM tables aren't in the shared schema yet,
  // we'll return a structured response based on the frontend mock data
  // This should be replaced with actual database queries when the tables are created
  
  return {
    employeeStats: {
      totalEmployees: 48,
      activeEmployees: 45,
      onLeave: 3,
      newHires: 5
    },
    departments: [
      { name: 'Administration', count: 8 },
      { name: 'Training', count: 15 },
      { name: 'Marketing', count: 7 },
      { name: 'Sales', count: 9 },
      { name: 'IT', count: 4 },
      { name: 'Finance', count: 5 }
    ],
    recentHires: [
      { id: 1, name: 'Aisha Khan', position: 'Training Specialist', department: 'Training', joinDate: '2025-04-01' },
      { id: 2, name: 'Mohammed Rahman', position: 'Digital Marketing Expert', department: 'Marketing', joinDate: '2025-03-15' },
      { id: 3, name: 'Sara Al Jaber', position: 'Administrative Assistant', department: 'Administration', joinDate: '2025-03-10' },
      { id: 4, name: 'Rahul Patel', position: 'Full Stack Developer', department: 'IT', joinDate: '2025-03-05' },
      { id: 5, name: 'Fatima Ali', position: 'Course Advisor', department: 'Sales', joinDate: '2025-03-01' }
    ],
    upcomingLeaves: [
      { id: 1, employeeName: 'Ahmed Al Mansouri', leaveType: 'Annual', startDate: '2025-04-25', endDate: '2025-05-05', status: 'Approved' },
      { id: 2, employeeName: 'Laila Mahmood', leaveType: 'Sick', startDate: '2025-04-22', endDate: '2025-04-24', status: 'Approved' },
      { id: 3, employeeName: 'Hassan Ali', leaveType: 'Annual', startDate: '2025-05-10', endDate: '2025-05-20', status: 'Pending' }
    ],
    attendanceStats: {
      present: 42,
      absent: 1,
      late: 2,
      onLeave: 3,
      present_percentage: "87.5%"
    }
  };
}