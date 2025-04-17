import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

// Define report types
export type ReportType = 
  | 'student-performance' 
  | 'trainer-performance' 
  | 'course-performance' 
  | 'financial-summary' 
  | 'lead-conversion' 
  | 'campaign-performance';

// Define table data structure
export interface TableData {
  headers: string[];
  rows: string[][];
}

// Define chart data structure
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
  }[];
}

// Define report metadata
export interface ReportMetadata {
  title: string;
  subtitle?: string;
  preparedBy: string;
  preparedFor?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  createdAt: Date;
  notes?: string;
  logo?: string;
}

// Define report data
export interface ReportData {
  metadata: ReportMetadata;
  summaryStats?: Record<string, string | number>;
  tables?: Record<string, TableData>;
  charts?: Record<string, ChartData>;
  rawData?: any;
}

/**
 * Generate a PDF report
 */
export const generatePDFReport = (reportType: ReportType, data: ReportData): jsPDF => {
  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set default font
  doc.setFont('helvetica');
  
  // Add metadata to document
  doc.setProperties({
    title: data.metadata.title,
    subject: data.metadata.subtitle || '',
    author: data.metadata.preparedBy,
    creator: 'Orbit Institute System'
  });
  
  // Add header with logo (if provided)
  addHeader(doc, data.metadata);
  
  // Add title and subtitle
  addTitle(doc, data.metadata);
  
  // Add summary statistics if available
  if (data.summaryStats) {
    addSummaryStats(doc, data.summaryStats);
  }
  
  // Add tables if available
  if (data.tables) {
    Object.entries(data.tables).forEach(([label, tableData], index) => {
      // Add section title
      const yPos = doc.lastAutoTable?.finalY || 70 + (index * 10);
      doc.text(label, 14, yPos + 10);
      
      // Add table
      (doc as any).autoTable({
        head: [tableData.headers],
        body: tableData.rows,
        startY: yPos + 15,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        margin: { top: 15 }
      });
    });
  }
  
  // Add footer with page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(100);
    
    // Page number
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Generated date
    const generatedText = `Generated on: ${format(new Date(), 'MMM d, yyyy h:mm a')}`;
    doc.text(generatedText, pageWidth - 15, pageHeight - 10, { align: 'right' });
    
    // Copyright
    doc.text('© Orbit Institute', 15, pageHeight - 10, { align: 'left' });
  }
  
  return doc;
};

/**
 * Add header to the report
 */
const addHeader = (doc: jsPDF, metadata: ReportMetadata) => {
  // Add logo if available
  if (metadata.logo) {
    try {
      doc.addImage(metadata.logo, 'PNG', 14, 10, 40, 15);
    } catch (error) {
      console.error('Failed to add logo to PDF', error);
    }
  }
  
  // Add report type on the right
  doc.setFontSize(10);
  doc.setTextColor(100);
  const dateText = `Report Date: ${format(metadata.createdAt, 'MMM d, yyyy')}`;
  doc.text(dateText, doc.internal.pageSize.width - 14, 15, { align: 'right' });
  
  // Add date range if available
  if (metadata.dateRange) {
    const rangeText = `Period: ${format(metadata.dateRange.from, 'MMM d, yyyy')} - ${format(metadata.dateRange.to, 'MMM d, yyyy')}`;
    doc.text(rangeText, doc.internal.pageSize.width - 14, 20, { align: 'right' });
  }
  
  // Add horizontal line
  doc.setDrawColor(200);
  doc.line(14, 25, doc.internal.pageSize.width - 14, 25);
};

/**
 * Add title to the report
 */
const addTitle = (doc: jsPDF, metadata: ReportMetadata) => {
  // Set title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(metadata.title, 14, 35);
  
  // Set subtitle if available
  if (metadata.subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(metadata.subtitle, 14, 42);
  }
  
  // Add prepared by
  doc.setFontSize(10);
  const preparedText = `Prepared by: ${metadata.preparedBy}`;
  doc.text(preparedText, 14, 48);
  
  // Add prepared for if available
  if (metadata.preparedFor) {
    const forText = `Prepared for: ${metadata.preparedFor}`;
    doc.text(forText, 14, 53);
  }
  
  // Add notes if available
  if (metadata.notes) {
    doc.setFontSize(9);
    doc.setTextColor(80);
    const notes = `Note: ${metadata.notes}`;
    doc.text(notes, 14, 60, { maxWidth: doc.internal.pageSize.width - 28 });
  }
};

/**
 * Add summary statistics to the report
 */
const addSummaryStats = (doc: jsPDF, stats: Record<string, string | number>) => {
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 70;
  
  // Add section title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Summary Statistics', 14, yPos);
  yPos += 8;
  
  // Prepare stats in columns (2 columns)
  const entries = Object.entries(stats);
  const midPoint = Math.ceil(entries.length / 2);
  
  // Set font for stats
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // First column
  for (let i = 0; i < midPoint; i++) {
    const [key, value] = entries[i];
    doc.setFont('helvetica', 'bold');
    doc.text(`${key}:`, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${value}`, 50, yPos);
    yPos += 6;
  }
  
  // Reset Y position for second column
  yPos = 78;
  
  // Second column
  for (let i = midPoint; i < entries.length; i++) {
    const [key, value] = entries[i];
    doc.setFont('helvetica', 'bold');
    doc.text(`${key}:`, pageWidth / 2 + 5, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${value}`, pageWidth / 2 + 40, yPos);
    yPos += 6;
  }
  
  // Add a small gap
  return Math.max(yPos, 90);
};

/**
 * Generate a report for student performance
 */
export const generateStudentPerformanceReport = async (studentId: number, dateRange: { from: Date; to: Date }) => {
  // Fetch student data
  const studentResponse = await fetch(`/api/students/${studentId}`);
  const student = await studentResponse.json();
  
  // Fetch attendance data
  const attendanceResponse = await fetch(`/api/students/${studentId}/attendance?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
  const attendance = await attendanceResponse.json();
  
  // Fetch assessment data
  const assessmentResponse = await fetch(`/api/students/${studentId}/assessments?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
  const assessments = await assessmentResponse.json();
  
  // Prepare report data
  const reportData: ReportData = {
    metadata: {
      title: 'Student Performance Report',
      subtitle: `Performance analysis for ${student.fullName}`,
      preparedBy: 'Orbit Institute',
      preparedFor: student.fullName,
      dateRange,
      createdAt: new Date(),
      notes: 'This report provides a comprehensive analysis of the student\'s performance during the specified period.'
    },
    summaryStats: {
      'Student ID': student.studentId,
      'Course': student.courseName,
      'Attendance Rate': `${attendance.attendanceRate}%`,
      'Average Score': `${assessments.averageScore}%`,
      'Start Date': format(new Date(student.registrationDate), 'MMM d, yyyy'),
      'Batch': student.batch
    },
    tables: {
      'Attendance Summary': {
        headers: ['Date', 'Status', 'Duration', 'Notes'],
        rows: attendance.records.map((record: any) => [
          format(new Date(record.date), 'MMM d, yyyy'),
          record.status,
          record.duration,
          record.notes || ''
        ])
      },
      'Assessment Results': {
        headers: ['Assessment', 'Date', 'Score', 'Grade', 'Feedback'],
        rows: assessments.records.map((record: any) => [
          record.name,
          format(new Date(record.date), 'MMM d, yyyy'),
          `${record.score}%`,
          record.grade,
          record.feedback || ''
        ])
      }
    }
  };
  
  // Generate PDF
  const doc = generatePDFReport('student-performance', reportData);
  
  // Save the PDF
  doc.save(`Student_Performance_${student.studentId}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};

/**
 * Generate a report for trainer performance
 */
export const generateTrainerPerformanceReport = async (trainerId: number, dateRange: { from: Date; to: Date }) => {
  // Fetch trainer data
  const trainerResponse = await fetch(`/api/trainers/${trainerId}`);
  const trainer = await trainerResponse.json();
  
  // Fetch student feedback
  const feedbackResponse = await fetch(`/api/trainers/${trainerId}/feedback?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
  const feedback = await feedbackResponse.json();
  
  // Fetch session data
  const sessionsResponse = await fetch(`/api/trainers/${trainerId}/sessions?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
  const sessions = await sessionsResponse.json();
  
  // Prepare report data
  const reportData: ReportData = {
    metadata: {
      title: 'Trainer Performance Report',
      subtitle: `Performance analysis for ${trainer.fullName}`,
      preparedBy: 'Orbit Institute',
      preparedFor: trainer.fullName,
      dateRange,
      createdAt: new Date(),
      notes: 'This report provides a comprehensive analysis of the trainer\'s performance during the specified period.'
    },
    summaryStats: {
      'Trainer ID': trainerId,
      'Specialization': trainer.specialization,
      'Total Sessions': sessions.totalSessions,
      'Average Rating': `${feedback.averageRating}/5`,
      'Courses Taught': trainer.courses.length,
      'Total Students': sessions.totalStudents
    },
    tables: {
      'Session Summary': {
        headers: ['Date', 'Course', 'Topic', 'Duration', 'Students'],
        rows: sessions.records.map((record: any) => [
          format(new Date(record.date), 'MMM d, yyyy'),
          record.courseName,
          record.topic,
          `${record.durationHours} hours`,
          record.studentCount
        ])
      },
      'Student Feedback': {
        headers: ['Date', 'Course', 'Rating', 'Comment'],
        rows: feedback.records.map((record: any) => [
          format(new Date(record.date), 'MMM d, yyyy'),
          record.courseName,
          `${record.rating}/5`,
          record.comment || ''
        ])
      }
    }
  };
  
  // Generate PDF
  const doc = generatePDFReport('trainer-performance', reportData);
  
  // Save the PDF
  doc.save(`Trainer_Performance_${trainerId}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};

/**
 * Generate a report for course performance
 */
export const generateCoursePerformanceReport = async (courseId: number, dateRange: { from: Date; to: Date }) => {
  // Fetch course data
  const courseResponse = await fetch(`/api/courses/${courseId}`);
  const course = await courseResponse.json();
  
  // Fetch enrollment data
  const enrollmentResponse = await fetch(`/api/courses/${courseId}/enrollments?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
  const enrollments = await enrollmentResponse.json();
  
  // Fetch completion data
  const completionResponse = await fetch(`/api/courses/${courseId}/completions?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
  const completions = await completionResponse.json();
  
  // Prepare report data
  const reportData: ReportData = {
    metadata: {
      title: 'Course Performance Report',
      subtitle: `Performance analysis for ${course.name}`,
      preparedBy: 'Orbit Institute',
      dateRange,
      createdAt: new Date(),
      notes: 'This report provides a comprehensive analysis of the course performance during the specified period.'
    },
    summaryStats: {
      'Course ID': courseId,
      'Duration': course.duration,
      'New Enrollments': enrollments.totalEnrollments,
      'Completions': completions.totalCompletions,
      'Completion Rate': `${completions.completionRate}%`,
      'Average Score': `${completions.averageScore}%`
    },
    tables: {
      'Enrollment Summary': {
        headers: ['Date', 'Student ID', 'Student Name', 'Batch', 'Fee'],
        rows: enrollments.records.map((record: any) => [
          format(new Date(record.date), 'MMM d, yyyy'),
          record.studentId,
          record.studentName,
          record.batch,
          `AED ${record.fee}`
        ])
      },
      'Completion Summary': {
        headers: ['Date', 'Student ID', 'Student Name', 'Score', 'Certificate'],
        rows: completions.records.map((record: any) => [
          format(new Date(record.date), 'MMM d, yyyy'),
          record.studentId,
          record.studentName,
          `${record.score}%`,
          record.certificateNumber
        ])
      }
    }
  };
  
  // Generate PDF
  const doc = generatePDFReport('course-performance', reportData);
  
  // Save the PDF
  doc.save(`Course_Performance_${courseId}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};

/**
 * Generate a financial summary report
 */
export const generateFinancialSummaryReport = async (dateRange: { from: Date; to: Date }) => {
  // Fetch revenue data
  const revenueResponse = await fetch(`/api/reports/revenue?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
  const revenue = await revenueResponse.json();
  
  // Fetch expenses data
  const expensesResponse = await fetch(`/api/reports/expenses?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
  const expenses = await expensesResponse.json();
  
  // Fetch payments data
  const paymentsResponse = await fetch(`/api/reports/payments?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
  const payments = await paymentsResponse.json();
  
  // Prepare report data
  const reportData: ReportData = {
    metadata: {
      title: 'Financial Summary Report',
      subtitle: 'Financial performance analysis',
      preparedBy: 'Orbit Institute',
      dateRange,
      createdAt: new Date(),
      notes: 'This report provides a comprehensive analysis of the financial performance during the specified period.'
    },
    summaryStats: {
      'Total Revenue': `AED ${revenue.totalRevenue}`,
      'Total Expenses': `AED ${expenses.totalExpenses}`,
      'Net Profit': `AED ${revenue.totalRevenue - expenses.totalExpenses}`,
      'Profit Margin': `${((revenue.totalRevenue - expenses.totalExpenses) / revenue.totalRevenue * 100).toFixed(2)}%`,
      'Pending Payments': `AED ${payments.pendingPayments}`,
      'Revenue Growth': `${revenue.growthRate}%`
    },
    tables: {
      'Revenue by Course': {
        headers: ['Course', 'Students', 'Revenue', '% of Total'],
        rows: revenue.byCourse.map((record: any) => [
          record.name,
          record.studentCount,
          `AED ${record.revenue}`,
          `${(record.revenue / revenue.totalRevenue * 100).toFixed(2)}%`
        ])
      },
      'Revenue by Payment Mode': {
        headers: ['Payment Mode', 'Transactions', 'Amount', '% of Total'],
        rows: payments.byMode.map((record: any) => [
          record.mode,
          record.count,
          `AED ${record.amount}`,
          `${(record.amount / payments.totalPayments * 100).toFixed(2)}%`
        ])
      },
      'Recent Transactions': {
        headers: ['Date', 'Invoice #', 'Student', 'Amount', 'Status'],
        rows: payments.recentTransactions.map((record: any) => [
          format(new Date(record.date), 'MMM d, yyyy'),
          record.invoiceNumber,
          record.studentName,
          `AED ${record.amount}`,
          record.status
        ])
      }
    }
  };
  
  // Generate PDF
  const doc = generatePDFReport('financial-summary', reportData);
  
  // Save the PDF
  doc.save(`Financial_Summary_${format(dateRange.from, 'yyyyMMdd')}_${format(dateRange.to, 'yyyyMMdd')}.pdf`);
};

/**
 * Generate a lead conversion report
 */
export const generateLeadConversionReport = async (dateRange: { from: Date; to: Date }) => {
  // Fetch leads data
  const leadsResponse = await fetch(`/api/crm/reports/leads?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
  const leads = await leadsResponse.json();
  
  // Fetch conversion data
  const conversionResponse = await fetch(`/api/crm/reports/conversions?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
  const conversions = await conversionResponse.json();
  
  // Prepare report data
  const reportData: ReportData = {
    metadata: {
      title: 'Lead Conversion Report',
      subtitle: 'Lead generation and conversion analysis',
      preparedBy: 'Orbit Institute',
      dateRange,
      createdAt: new Date(),
      notes: 'This report provides a comprehensive analysis of lead conversion performance during the specified period.'
    },
    summaryStats: {
      'Total Leads': leads.totalLeads,
      'Converted Leads': conversions.convertedLeads,
      'Conversion Rate': `${conversions.conversionRate}%`,
      'Avg. Conversion Time': `${conversions.avgDaysToConvert} days`,
      'Highest Conv. Source': conversions.topSource,
      'Highest Conv. Course': conversions.topCourse
    },
    tables: {
      'Lead Sources': {
        headers: ['Source', 'Leads', 'Conversions', 'Conversion Rate', 'Avg. Time'],
        rows: leads.bySources.map((record: any) => [
          record.source,
          record.count,
          record.conversions,
          `${(record.conversions / record.count * 100).toFixed(2)}%`,
          `${record.avgDaysToConvert} days`
        ])
      },
      'Lead Status Summary': {
        headers: ['Status', 'Count', '% of Total'],
        rows: leads.byStatus.map((record: any) => [
          record.status,
          record.count,
          `${(record.count / leads.totalLeads * 100).toFixed(2)}%`
        ])
      },
      'Top Converting Courses': {
        headers: ['Course', 'Leads', 'Conversions', 'Conversion Rate'],
        rows: conversions.byCourse.map((record: any) => [
          record.course,
          record.leads,
          record.conversions,
          `${(record.conversions / record.leads * 100).toFixed(2)}%`
        ])
      }
    }
  };
  
  // Generate PDF
  const doc = generatePDFReport('lead-conversion', reportData);
  
  // Save the PDF
  doc.save(`Lead_Conversion_${format(dateRange.from, 'yyyyMMdd')}_${format(dateRange.to, 'yyyyMMdd')}.pdf`);
};

/**
 * Generate a campaign performance report
 */
export const generateCampaignPerformanceReport = async (campaignId: number, dateRange: { from: Date; to: Date }) => {
  // Fetch campaign data
  const campaignResponse = await fetch(`/api/crm/campaigns/${campaignId}`);
  const campaign = await campaignResponse.json();
  
  // Fetch campaign stats
  const statsResponse = await fetch(`/api/crm/campaigns/${campaignId}/stats?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
  const stats = await statsResponse.json();
  
  // Fetch leads from campaign
  const leadsResponse = await fetch(`/api/crm/campaigns/${campaignId}/leads?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
  const leads = await leadsResponse.json();
  
  // Prepare report data
  const reportData: ReportData = {
    metadata: {
      title: 'Campaign Performance Report',
      subtitle: `Performance analysis for ${campaign.name}`,
      preparedBy: 'Orbit Institute',
      dateRange,
      createdAt: new Date(),
      notes: 'This report provides a comprehensive analysis of the campaign performance during the specified period.'
    },
    summaryStats: {
      'Campaign ID': campaignId,
      'Platform': campaign.platform,
      'Total Budget': `AED ${campaign.budget || 0}`,
      'Start Date': format(new Date(campaign.startDate), 'MMM d, yyyy'),
      'End Date': campaign.endDate ? format(new Date(campaign.endDate), 'MMM d, yyyy') : 'Ongoing',
      'Total Leads': stats.totalLeads,
      'Impressions': stats.impressions,
      'Clicks': stats.clicks,
      'Click-through Rate': `${stats.ctr}%`,
      'Conversion Rate': `${stats.conversionRate}%`,
      'Cost per Lead': `AED ${stats.costPerLead}`
    },
    tables: {
      'Performance Metrics': {
        headers: ['Metric', 'Value'],
        rows: [
          ['Impressions', stats.impressions.toString()],
          ['Clicks', stats.clicks.toString()],
          ['Click-through Rate', `${stats.ctr}%`],
          ['Leads Generated', stats.totalLeads.toString()],
          ['Conversion Rate', `${stats.conversionRate}%`],
          ['Cost per Click', `AED ${stats.costPerClick}`],
          ['Cost per Lead', `AED ${stats.costPerLead}`],
          ['Total Cost', `AED ${stats.totalCost}`]
        ]
      },
      'Leads Generated': {
        headers: ['Date', 'Name', 'Contact', 'Status', 'Course Interest'],
        rows: leads.records.map((record: any) => [
          format(new Date(record.createdAt), 'MMM d, yyyy'),
          record.fullName,
          record.phone,
          record.status,
          record.interestedCourse
        ])
      }
    }
  };
  
  // Generate PDF
  const doc = generatePDFReport('campaign-performance', reportData);
  
  // Save the PDF
  doc.save(`Campaign_Performance_${campaignId}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};

/**
 * Generate a mock report for demonstration purposes
 */
export const generateMockReport = (reportType: ReportType): jsPDF => {
  let reportData: ReportData;
  
  // Current date for report generation
  const now = new Date();
  
  // Date range for report (last 30 days)
  const from = new Date(now);
  from.setDate(from.getDate() - 30);
  
  switch (reportType) {
    case 'lead-conversion':
      reportData = {
        metadata: {
          title: 'Lead Conversion Report',
          subtitle: 'Lead generation and conversion analysis',
          preparedBy: 'Orbit Institute',
          dateRange: { from, to: now },
          createdAt: now,
          notes: 'This is a mock report for demonstration purposes.'
        },
        summaryStats: {
          'Total Leads': 145,
          'Converted Leads': 42,
          'Conversion Rate': '28.97%',
          'Avg. Conversion Time': '8.5 days',
          'Highest Conv. Source': 'Website',
          'Highest Conv. Course': 'AutoCAD'
        },
        tables: {
          'Lead Sources': {
            headers: ['Source', 'Leads', 'Conversions', 'Conversion Rate', 'Avg. Time'],
            rows: [
              ['Website', '68', '22', '32.35%', '7.2 days'],
              ['Social Media', '42', '12', '28.57%', '9.5 days'],
              ['Referral', '25', '8', '32.00%', '6.8 days'],
              ['Other', '10', '0', '0.00%', '-']
            ]
          },
          'Lead Status Summary': {
            headers: ['Status', 'Count', '% of Total'],
            rows: [
              ['New', '38', '26.21%'],
              ['Contacted', '25', '17.24%'],
              ['Interested Highly', '32', '22.07%'],
              ['Converted', '42', '28.97%'],
              ['Not Interested', '8', '5.52%']
            ]
          },
          'Top Converting Courses': {
            headers: ['Course', 'Leads', 'Conversions', 'Conversion Rate'],
            rows: [
              ['AutoCAD', '45', '18', '40.00%'],
              ['Web Development', '32', '10', '31.25%'],
              ['Digital Marketing', '28', '8', '28.57%'],
              ['Data Analysis', '15', '4', '26.67%'],
              ['Project Management', '12', '2', '16.67%']
            ]
          }
        }
      };
      break;
      
    case 'campaign-performance':
      reportData = {
        metadata: {
          title: 'Campaign Performance Report',
          subtitle: 'Marketing Campaign: Summer Promotion',
          preparedBy: 'Orbit Institute',
          dateRange: { from, to: now },
          createdAt: now,
          notes: 'This is a mock report for demonstration purposes.'
        },
        summaryStats: {
          'Campaign ID': 'CAMP-2023-001',
          'Platform': 'Meta Ads',
          'Total Budget': 'AED 5,000',
          'Start Date': format(from, 'MMM d, yyyy'),
          'End Date': format(now, 'MMM d, yyyy'),
          'Total Leads': '78',
          'Impressions': '25,450',
          'Clicks': '1,230',
          'Click-through Rate': '4.83%',
          'Conversion Rate': '6.34%',
          'Cost per Lead': 'AED 64.10'
        },
        tables: {
          'Performance Metrics': {
            headers: ['Metric', 'Value'],
            rows: [
              ['Impressions', '25,450'],
              ['Clicks', '1,230'],
              ['Click-through Rate', '4.83%'],
              ['Leads Generated', '78'],
              ['Conversion Rate', '6.34%'],
              ['Cost per Click', 'AED 4.07'],
              ['Cost per Lead', 'AED 64.10'],
              ['Total Cost', 'AED 5,000']
            ]
          },
          'Leads Generated': {
            headers: ['Date', 'Name', 'Contact', 'Status', 'Course Interest'],
            rows: [
              [format(new Date(2023, 6, 15), 'MMM d, yyyy'), 'Ahmed Ali', '+971 5x xxx xxxx', 'Converted', 'AutoCAD'],
              [format(new Date(2023, 6, 16), 'MMM d, yyyy'), 'Sara Khan', '+971 5x xxx xxxx', 'Interested Highly', 'Web Development'],
              [format(new Date(2023, 6, 18), 'MMM d, yyyy'), 'Mohammed Al Mansoor', '+971 5x xxx xxxx', 'Converted', 'Digital Marketing'],
              [format(new Date(2023, 6, 20), 'MMM d, yyyy'), 'Fatima Hussain', '+971 5x xxx xxxx', 'New', 'Data Analysis'],
              [format(new Date(2023, 6, 22), 'MMM d, yyyy'), 'Omar Abdullah', '+971 5x xxx xxxx', 'Contacted', 'Project Management']
            ]
          }
        }
      };
      break;
      
    case 'financial-summary':
      reportData = {
        metadata: {
          title: 'Financial Summary Report',
          subtitle: 'Financial performance analysis',
          preparedBy: 'Orbit Institute',
          dateRange: { from, to: now },
          createdAt: now,
          notes: 'This is a mock report for demonstration purposes.'
        },
        summaryStats: {
          'Total Revenue': 'AED 250,000',
          'Total Expenses': 'AED 175,000',
          'Net Profit': 'AED 75,000',
          'Profit Margin': '30.00%',
          'Pending Payments': 'AED 45,000',
          'Revenue Growth': '15.25%'
        },
        tables: {
          'Revenue by Course': {
            headers: ['Course', 'Students', 'Revenue', '% of Total'],
            rows: [
              ['AutoCAD', '32', 'AED 96,000', '38.40%'],
              ['Web Development', '25', 'AED 75,000', '30.00%'],
              ['Digital Marketing', '18', 'AED 45,000', '18.00%'],
              ['Data Analysis', '12', 'AED 24,000', '9.60%'],
              ['Project Management', '5', 'AED 10,000', '4.00%']
            ]
          },
          'Revenue by Payment Mode': {
            headers: ['Payment Mode', 'Transactions', 'Amount', '% of Total'],
            rows: [
              ['Cash', '45', 'AED 112,500', '45.00%'],
              ['Card', '35', 'AED 87,500', '35.00%'],
              ['Tabby', '10', 'AED 25,000', '10.00%'],
              ['Tamara', '10', 'AED 25,000', '10.00%']
            ]
          },
          'Recent Transactions': {
            headers: ['Date', 'Invoice #', 'Student', 'Amount', 'Status'],
            rows: [
              [format(new Date(2023, 6, 25), 'MMM d, yyyy'), 'INV-2023-075', 'Ahmed Ali', 'AED 3,000', 'Paid'],
              [format(new Date(2023, 6, 24), 'MMM d, yyyy'), 'INV-2023-074', 'Sara Khan', 'AED 3,000', 'Pending'],
              [format(new Date(2023, 6, 23), 'MMM d, yyyy'), 'INV-2023-073', 'Mohammed Al Mansoor', 'AED 3,000', 'Paid'],
              [format(new Date(2023, 6, 22), 'MMM d, yyyy'), 'INV-2023-072', 'Fatima Hussain', 'AED 2,000', 'Paid'],
              [format(new Date(2023, 6, 21), 'MMM d, yyyy'), 'INV-2023-071', 'Omar Abdullah', 'AED 2,000', 'Pending']
            ]
          }
        }
      };
      break;
      
    case 'course-performance':
    default:
      reportData = {
        metadata: {
          title: 'Course Performance Report',
          subtitle: 'Performance analysis for AutoCAD Course',
          preparedBy: 'Orbit Institute',
          dateRange: { from, to: now },
          createdAt: now,
          notes: 'This is a mock report for demonstration purposes.'
        },
        summaryStats: {
          'Course ID': 'CRS-001',
          'Duration': '3 months',
          'New Enrollments': '32',
          'Completions': '28',
          'Completion Rate': '87.50%',
          'Average Score': '85.20%'
        },
        tables: {
          'Enrollment Summary': {
            headers: ['Date', 'Student ID', 'Student Name', 'Batch', 'Fee'],
            rows: [
              [format(new Date(2023, 5, 15), 'MMM d, yyyy'), 'STU-2023-032', 'Ahmed Ali', 'Batch 5', 'AED 3,000'],
              [format(new Date(2023, 5, 16), 'MMM d, yyyy'), 'STU-2023-033', 'Sara Khan', 'Batch 5', 'AED 3,000'],
              [format(new Date(2023, 5, 18), 'MMM d, yyyy'), 'STU-2023-034', 'Mohammed Al Mansoor', 'Batch 5', 'AED 3,000'],
              [format(new Date(2023, 5, 20), 'MMM d, yyyy'), 'STU-2023-035', 'Fatima Hussain', 'Batch 5', 'AED 3,000'],
              [format(new Date(2023, 5, 22), 'MMM d, yyyy'), 'STU-2023-036', 'Omar Abdullah', 'Batch 5', 'AED 3,000']
            ]
          },
          'Completion Summary': {
            headers: ['Date', 'Student ID', 'Student Name', 'Score', 'Certificate'],
            rows: [
              [format(new Date(2023, 6, 25), 'MMM d, yyyy'), 'STU-2023-001', 'Rashid Mahmood', '92%', 'CERT-2023-001'],
              [format(new Date(2023, 6, 25), 'MMM d, yyyy'), 'STU-2023-002', 'Aisha Ahmed', '88%', 'CERT-2023-002'],
              [format(new Date(2023, 6, 25), 'MMM d, yyyy'), 'STU-2023-003', 'Khalid Al Falasi', '85%', 'CERT-2023-003'],
              [format(new Date(2023, 6, 25), 'MMM d, yyyy'), 'STU-2023-004', 'Maryam Hassan', '90%', 'CERT-2023-004'],
              [format(new Date(2023, 6, 25), 'MMM d, yyyy'), 'STU-2023-005', 'Saeed Al Zaabi', '82%', 'CERT-2023-005']
            ]
          }
        }
      };
  }
  
  // Generate PDF
  return generatePDFReport(reportType, reportData);
};

/**
 * Generate and download a mock report for demonstration
 */
export const downloadMockReport = (reportType: ReportType) => {
  const doc = generateMockReport(reportType);
  doc.save(`${reportType}_report_${format(new Date(), 'yyyyMMdd')}.pdf`);
};

/**
 * Export report as PDF
 */
export const exportAsPDF = (doc: jsPDF, filename: string) => {
  doc.save(filename);
};

/**
 * Export report data as Excel
 */
export const exportAsExcel = (reportData: ReportData, filename: string) => {
  // Placeholder for Excel export functionality
  // This would typically use a library like exceljs
  console.log('Excel export is not implemented yet');
};

/**
 * Export report data as CSV
 */
export const exportAsCSV = (reportData: ReportData, filename: string) => {
  // Create CSV content
  let csvContent = '';
  
  // Add headers and data for each table
  if (reportData.tables) {
    Object.entries(reportData.tables).forEach(([tableName, tableData]) => {
      // Add table name
      csvContent += `${tableName}\n`;
      
      // Add headers
      csvContent += tableData.headers.join(',') + '\n';
      
      // Add rows
      tableData.rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
      });
      
      // Add empty line between tables
      csvContent += '\n';
    });
  }
  
  // Create a blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  
  // Use FileSaver to save the file
  saveAs(blob, filename);
};

// Helper function to convert date strings into a standardized format
export const formatDateString = (dateStr: string): string => {
  try {
    return format(new Date(dateStr), 'yyyy-MM-dd');
  } catch (e) {
    return dateStr;
  }
};

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return `AED ${amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`;
};