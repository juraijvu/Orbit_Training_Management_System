import { FC, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Loader2, Eye, Printer, File, ChevronLeft, ChevronRight } from 'lucide-react';
import { PaymentStatus } from '@shared/types';
import { format } from 'date-fns';
import PrintTemplate from '@/components/print/print-template';
import { generateRegistrationPdf, generateInvoicePdf } from '@/lib/pdf-templates';
import { useReactToPrint } from 'react-to-print';

interface Student {
  id: number;
  studentId: string;
  fullName: string;
  fatherName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  courseId: number;
  batch: string;
  registrationDate: string;
  courseFee: number;
  discount: number;
  totalFee: number;
  initialPayment: number;
  balanceDue: number;
  paymentMode: string;
  paymentStatus: string;
}

interface Course {
  id: number;
  name: string;
  description: string;
  duration: string;
  fee: number;
}

const PAGE_SIZE = 10;

const StudentList: FC = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewType, setViewType] = useState<'details' | 'invoice' | null>(null);
  
  const registrationPrintRef = useRef<HTMLDivElement>(null);
  const invoicePrintRef = useRef<HTMLDivElement>(null);
  
  // Fetch students
  const { data: students, isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });
  
  // Fetch courses for name mapping
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });
  
  // Get course name from ID
  const getCourseName = (courseId: number) => {
    const course = courses?.find(c => c.id === courseId);
    return course?.name || 'Unknown Course';
  };
  
  // Handle status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case PaymentStatus.PAID:
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case PaymentStatus.PARTIAL:
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      case PaymentStatus.PENDING:
        return <Badge className="bg-red-100 text-red-800">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Filter and paginate students
  const filteredStudents = students?.filter(student => {
    const matchesSearch = searchQuery === '' || 
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.includes(searchQuery);
    
    const matchesCourse = courseFilter === '' || student.courseId.toString() === courseFilter;
    
    return matchesSearch && matchesCourse;
  }) || [];
  
  const paginatedStudents = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);
  
  // View student details
  const viewStudent = (student: Student, type: 'details' | 'invoice') => {
    setSelectedStudent(student);
    setViewType(type);
  };
  
  // Handle print registration form
  const handlePrintRegistration = useReactToPrint({
    content: () => registrationPrintRef.current,
    onAfterPrint: () => {
      toast({
        title: 'Success',
        description: 'Registration form has been printed successfully.',
      });
    },
  });
  
  // Handle print invoice
  const handlePrintInvoice = useReactToPrint({
    content: () => invoicePrintRef.current,
    onAfterPrint: () => {
      toast({
        title: 'Success',
        description: 'Invoice has been printed successfully.',
      });
    },
  });
  
  const loading = studentsLoading || coursesLoading;
  
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2">Loading students...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Student List</h1>
        <p className="text-gray-600">View and manage all students registered at Orbit Institute</p>
      </div>
      
      <Card className="p-6">
        {/* Filters and search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-auto">
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full md:w-auto"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
          
          <Select
            value={courseFilter}
            onValueChange={setCourseFilter}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Courses</SelectItem>
              {courses?.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Students table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Fee Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                    No students found. Try changing your filters or add a new student.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>{getCourseName(student.courseId)}</TableCell>
                    <TableCell>{format(new Date(student.registrationDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{getStatusBadge(student.paymentStatus)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => viewStudent(student, 'details')}
                          title="View"
                        >
                          <Eye className="h-4 w-4 text-primary-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedStudent(student);
                            setTimeout(() => handlePrintRegistration(), 100);
                          }}
                          title="Print"
                        >
                          <Printer className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => viewStudent(student, 'invoice')}
                          title="Invoice"
                        >
                          <File className="h-4 w-4 text-green-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredStudents.length)} of {filteredStudents.length} results
            </div>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                const isActive = pageNumber === page;
                
                return (
                  <Button
                    key={i}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                  >
                    ...
                  </Button>
                  <Button
                    variant={page === totalPages ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {/* Student details dialog */}
      <Dialog open={viewType === 'details' && selectedStudent !== null} onOpenChange={() => setViewType(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Complete information about the student
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Personal Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Student ID:</span>
                    <p className="font-medium">{selectedStudent.studentId}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Full Name:</span>
                    <p className="font-medium">{selectedStudent.fullName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Father's Name:</span>
                    <p className="font-medium">{selectedStudent.fatherName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Gender:</span>
                    <p className="font-medium">{selectedStudent.gender}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Date of Birth:</span>
                    <p className="font-medium">{format(new Date(selectedStudent.dob), 'MMMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Contact:</span>
                    <p className="font-medium">{selectedStudent.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="font-medium">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Address:</span>
                    <p className="font-medium">{selectedStudent.address}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Course and Fee Details</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Course:</span>
                    <p className="font-medium">{getCourseName(selectedStudent.courseId)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Batch:</span>
                    <p className="font-medium">{selectedStudent.batch}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Registration Date:</span>
                    <p className="font-medium">{format(new Date(selectedStudent.registrationDate), 'MMMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Course Fee:</span>
                    <p className="font-medium">₹{selectedStudent.courseFee.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Discount:</span>
                    <p className="font-medium">₹{selectedStudent.discount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Total Fee:</span>
                    <p className="font-medium">₹{selectedStudent.totalFee.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Initial Payment:</span>
                    <p className="font-medium">₹{selectedStudent.initialPayment.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Balance Due:</span>
                    <p className="font-medium">₹{selectedStudent.balanceDue.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Payment Mode:</span>
                    <p className="font-medium">{selectedStudent.paymentMode}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Payment Status:</span>
                    <p>{getStatusBadge(selectedStudent.paymentStatus)}</p>
                  </div>
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2 flex justify-end space-x-2">
                <Button
                  onClick={() => {
                    setViewType(null);
                    setTimeout(() => handlePrintRegistration(), 100);
                  }}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Registration
                </Button>
                <Button
                  onClick={() => {
                    setViewType('invoice');
                  }}
                >
                  <File className="mr-2 h-4 w-4" />
                  View Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Invoice dialog */}
      <Dialog open={viewType === 'invoice' && selectedStudent !== null} onOpenChange={() => setViewType(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice</DialogTitle>
            <DialogDescription>
              Student invoice details
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="py-4">
              <div className="border p-6 rounded-md">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold">Orbit Institute</h2>
                  <p className="text-gray-600">123, Education Hub, Tech City, India - 123456</p>
                  <p className="text-gray-600">Phone: +91 1234567890 | Email: info@orbitinstitute.com</p>
                </div>
                
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold">INVOICE</h3>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between mb-6">
                  <div>
                    <p className="font-semibold">Invoice To:</p>
                    <p>{selectedStudent.fullName}</p>
                    <p>{selectedStudent.address}</p>
                    <p>Phone: {selectedStudent.phone}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <p><span className="font-semibold">Invoice No:</span> INV-{selectedStudent.studentId.replace('STU', '')}</p>
                    <p><span className="font-semibold">Student ID:</span> {selectedStudent.studentId}</p>
                    <p><span className="font-semibold">Date:</span> {format(new Date(selectedStudent.registrationDate), 'dd/MM/yyyy')}</p>
                    <p><span className="font-semibold">Payment Status:</span> {selectedStudent.paymentStatus}</p>
                  </div>
                </div>
                
                <table className="w-full border-collapse mb-6">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Course</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        {getCourseName(selectedStudent.courseId)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {courses?.find(c => c.id === selectedStudent.courseId)?.duration || '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {selectedStudent.courseFee.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold" colSpan={2}>Discount</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{selectedStudent.discount.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold" colSpan={2}>Total</td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold">{selectedStudent.totalFee.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold" colSpan={2}>Amount Paid</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{selectedStudent.initialPayment.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold" colSpan={2}>Balance Due</td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold">{selectedStudent.balanceDue.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="mb-6">
                  <p className="font-semibold mb-2">Payment Details:</p>
                  <p>Payment Mode: {selectedStudent.paymentMode}</p>
                  <p>Date: {format(new Date(selectedStudent.registrationDate), 'dd/MM/yyyy')}</p>
                </div>
                
                <div className="mb-6">
                  <p className="font-semibold mb-2">Terms & Conditions:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Fee once paid is not refundable under any circumstances.</li>
                    <li>Balance amount should be paid as per the agreed schedule.</li>
                    <li>Institute reserves the right to cancel admission in case of defaulted payments.</li>
                    <li>This is a computer-generated invoice and doesn't require a signature.</li>
                  </ul>
                </div>
                
                <div className="text-center mt-10">
                  <p className="font-semibold">Thank you for choosing Orbit Institute!</p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => {
                    setViewType(null);
                    setTimeout(() => handlePrintInvoice(), 100);
                  }}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Print templates (Hidden) */}
      {selectedStudent && (
        <>
          {/* Registration Form Print Template */}
          <div className="hidden">
            <PrintTemplate ref={registrationPrintRef} orientation="portrait">
              <div dangerouslySetInnerHTML={{
                __html: generateRegistrationPdf({
                  studentId: selectedStudent.studentId,
                  fullName: selectedStudent.fullName,
                  fatherName: selectedStudent.fatherName,
                  email: selectedStudent.email,
                  phone: selectedStudent.phone,
                  dob: format(new Date(selectedStudent.dob), 'dd/MM/yyyy'),
                  gender: selectedStudent.gender,
                  address: selectedStudent.address,
                  course: getCourseName(selectedStudent.courseId),
                  batch: selectedStudent.batch,
                  registrationDate: format(new Date(selectedStudent.registrationDate), 'dd/MM/yyyy'),
                  courseFee: selectedStudent.courseFee,
                  discount: selectedStudent.discount,
                  totalFee: selectedStudent.totalFee,
                  initialPayment: selectedStudent.initialPayment,
                  balanceDue: selectedStudent.balanceDue,
                  paymentMode: selectedStudent.paymentMode
                })
              }} />
            </PrintTemplate>
          </div>
          
          {/* Invoice Print Template */}
          <div className="hidden">
            <PrintTemplate ref={invoicePrintRef} orientation="landscape">
              <div dangerouslySetInnerHTML={{
                __html: generateInvoicePdf({
                  invoiceNumber: `INV-${selectedStudent.studentId.replace('STU', '')}`,
                  studentId: selectedStudent.studentId,
                  fullName: selectedStudent.fullName,
                  address: selectedStudent.address,
                  phone: selectedStudent.phone,
                  date: format(new Date(selectedStudent.registrationDate), 'dd/MM/yyyy'),
                  paymentStatus: selectedStudent.paymentStatus,
                  course: getCourseName(selectedStudent.courseId),
                  duration: courses?.find(c => c.id === selectedStudent.courseId)?.duration || '',
                  amount: selectedStudent.courseFee,
                  discount: selectedStudent.discount,
                  total: selectedStudent.totalFee,
                  amountPaid: selectedStudent.initialPayment,
                  balanceDue: selectedStudent.balanceDue,
                  paymentMode: selectedStudent.paymentMode
                })
              }} />
            </PrintTemplate>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default StudentList;
