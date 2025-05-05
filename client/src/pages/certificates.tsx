import { FC, useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertCertificateSchema } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import AppLayout from '@/components/layout/app-layout';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Award, 
  Printer, 
  Eye, 
  Loader2, 
  Check, 
  Download,
  X 
} from 'lucide-react';
import PrintTemplate from '@/components/print/print-template';
import { generateCertificatePdf } from '@/lib/pdf-templates';
import { useReactToPrint } from 'react-to-print';

interface Certificate {
  id: number;
  certificateNumber: string;
  studentId: number;
  courseId: number;
  issueDate: string;
  issuedBy: number;
  createdAt: string;
}

interface Student {
  id: number;
  studentId: string;
  fullName: string;
  courseId: number;
}

interface Course {
  id: number;
  name: string;
}

// Certificate form schema
const certificateFormSchema = insertCertificateSchema.extend({
  issueDate: z.string().min(1, "Issue date is required"),
});

type CertificateFormValues = z.infer<typeof certificateFormSchema>;

const CertificatesPage: FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const certificatePrintRef = useRef<HTMLDivElement>(null);
  
  // Form for creating certificate
  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateFormSchema),
    defaultValues: {
      studentId: undefined,
      courseId: undefined,
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      issuedBy: user?.id,
    },
  });
  
  // Fetch certificates
  const { data: certificates, isLoading: certificatesLoading } = useQuery<Certificate[]>({
    queryKey: ['/api/certificates'],
  });
  
  // Fetch students
  const { data: students, isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });
  
  // Fetch courses
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });
  
  // Create certificate mutation
  const createCertificateMutation = useMutation({
    mutationFn: async (data: CertificateFormValues) => {
      console.log("Attempting to create certificate with data:", data);
      
      // Make sure we have the required fields
      if (!data.studentId) {
        throw new Error('Student selection is required');
      }
      
      if (!data.courseId) {
        throw new Error('Course selection is required');
      }
      
      if (!data.issueDate) {
        throw new Error('Issue date is required');
      }
      
      if (!user?.id) {
        throw new Error('User information is missing');
      }
      
      // Ensure issuedBy is set
      const formData = {
        ...data,
        issuedBy: user.id,
      };
      
      console.log("Submitting certificate data:", formData);
      
      // Use direct fetch for more control and debugging
      try {
        // Try a different approach for formatting the data
        // We know the server is still seeing the date as a string
        // Let's try to modify the backend route instead
        
        // For now, let's keep trying different formats
        const issueDate = new Date(formData.issueDate);
        
        const formattedData = {
          studentId: formData.studentId,
          courseId: formData.courseId,
          issuedBy: formData.issuedBy,
          // The server should generate or override this, but we need to provide it
          certificateNumber: 'TEMP-' + Date.now(),
          // Try sending in ISO format
          issueDate: issueDate.toISOString()
        };
        
        console.log("Formatted data for API:", formattedData);
        
        // Create the request manually for better debugging
        const response = await fetch('/api/certificates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
          credentials: 'include',
        });
        
        console.log("Certificate API response status:", response.status);
        
        // Log selected important headers
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        console.log("Certificate API response headers:", headers);
        
        // Debug response
        const responseText = await response.text();
        console.log("Raw API response:", responseText);
        
        let responseData;
        try {
          // Try to parse the response as JSON
          responseData = JSON.parse(responseText);
        } catch (e) {
          console.error("Failed to parse response as JSON:", e);
          throw new Error(`Server returned invalid JSON: ${responseText}`);
        }
        
        // Check for specific status codes
        if (response.status === 401) {
          console.error("Authentication error - User not logged in");
          throw new Error('You need to be logged in to create certificates');
        } else if (response.status === 403) {
          console.error("Authorization error - User lacks superadmin privileges");
          throw new Error('Only superadmins can create certificates');
        } else if (!response.ok) {
          // For other errors
          const errorMessage = responseData?.message || 'Failed to create certificate';
          console.error("Certificate creation failed:", responseData);
          throw new Error(errorMessage);
        }
        
        console.log("Certificate created successfully:", responseData);
        return responseData;
      } catch (err) {
        console.error("Error during certificate creation:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log("Certificate mutation succeeded:", data);
      queryClient.invalidateQueries({ queryKey: ['/api/certificates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/activities'] });
      
      toast({
        title: 'Success',
        description: 'Certificate has been generated successfully',
      });
      
      setIsDialogOpen(false);
      form.reset();
      
      // View the newly created certificate
      setSelectedCertificate(data);
    },
    onError: (error) => {
      console.error("Certificate mutation error:", error);
      toast({
        title: 'Error',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Submit form
  const onSubmit = (values: CertificateFormValues, event?: React.BaseSyntheticEvent) => {
    // Add debug for the event
    console.log("Form submit event:", event);
    console.log("Certificate form submitted with values:", values);
    console.log("Form state:", form.formState);
    
    // Prevent default form behavior if event exists
    if (event) {
      event.preventDefault();
      console.log("Prevented default form submission");
    }
    
    // We need to make sure we have all the required values
    if (!values.studentId) {
      console.error("Missing studentId");
      toast({
        title: 'Missing Information',
        description: 'Please select a student',
        variant: 'destructive',
      });
      return;
    }
    
    if (!values.courseId) {
      console.error("Missing courseId");
      toast({
        title: 'Missing Information',
        description: 'Please select a course',
        variant: 'destructive',
      });
      return;
    }
    
    if (!values.issueDate) {
      console.error("Missing issueDate");
      toast({
        title: 'Missing Information',
        description: 'Please select an issue date',
        variant: 'destructive',
      });
      return;
    }
    
    // Log values that will be submitted
    console.log("Submitting certificate form with:", { 
      studentId: values.studentId, 
      courseId: values.courseId,
      issueDate: values.issueDate,
      issuedBy: user?.id
    });
    
    // Try to create the certificate
    try {
      console.log("Calling mutation with data");
      const data = {
        ...values,
        // Make sure issuedBy is set properly
        issuedBy: user?.id as number
      };
      console.log("Final data for API:", data);
      
      // Call the mutation
      createCertificateMutation.mutate(data);
    } catch (error) {
      console.error("Error during mutation:", error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };
  
  // Open create certificate dialog
  const openCreateDialog = () => {
    form.reset({
      studentId: undefined,
      courseId: undefined,
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      issuedBy: user?.id,
    });
    setIsDialogOpen(true);
  };
  
  // Handle student selection
  const handleStudentChange = (studentId: number) => {
    form.setValue('studentId', studentId);
    
    // Auto-select the student's course
    const student = students?.find(s => s.id === studentId);
    if (student) {
      form.setValue('courseId', student.courseId);
    }
  };
  
  // Handle print certificate
  const handlePrintCertificate = useReactToPrint({
    documentTitle: 'Certificate',
    onAfterPrint: () => {
      toast({
        title: 'Success',
        description: 'Certificate has been printed successfully.',
      });
    },
    // @ts-ignore - React-to-print typing issue
    content: () => certificatePrintRef.current,
  });
  
  // Get student name
  const getStudentName = (studentId: number) => {
    const student = students?.find(s => s.id === studentId);
    return student?.fullName || 'Unknown Student';
  };
  
  // Get student ID
  const getStudentIdentifier = (studentId: number) => {
    const student = students?.find(s => s.id === studentId);
    return student?.studentId || `#${studentId}`;
  };
  
  // Get course name
  const getCourseName = (courseId: number) => {
    const course = courses?.find(c => c.id === courseId);
    return course?.name || 'Unknown Course';
  };
  
  // Check user authentication status and permissions
  const isSuperAdmin = user?.role === 'superadmin';
  
  // Log authentication status for debugging
  console.log("Auth status:", { 
    isAuthenticated: !!user,
    userDetails: user ? { id: user.id, role: user.role, username: user.username } : 'Not authenticated',
    isSuperAdmin
  });
  
  // Filter certificates based on search query
  const filteredCertificates = certificates?.filter(certificate => {
    if (!searchQuery) return true;
    
    const studentName = getStudentName(certificate.studentId).toLowerCase();
    const studentId = getStudentIdentifier(certificate.studentId).toLowerCase();
    const courseName = getCourseName(certificate.courseId).toLowerCase();
    const certNumber = certificate.certificateNumber.toLowerCase();
    
    const query = searchQuery.toLowerCase();
    
    return studentName.includes(query) || 
           studentId.includes(query) || 
           courseName.includes(query) || 
           certNumber.includes(query);
  });
  
  // Check if loading
  const isLoading = certificatesLoading || studentsLoading || coursesLoading;
  const isPending = createCertificateMutation.isPending;
  
  // Check if user is loaded or not
  if (user === null) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <X className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to access the certificate management system.</p>
          <Button onClick={() => window.location.href = "/auth"}>
            Log In
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  // Check if user has correct permissions
  if (!isSuperAdmin) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <X className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">Only super administrators can generate certificates.</p>
          <p className="text-gray-500 mt-2">Your current role: {user.role}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Certificate Management</h1>
          <p className="text-gray-600">Generate and manage certificates for students</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Award className="mr-2 h-4 w-4" />
          Generate Certificate
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full md:w-96">
              <Input
                placeholder="Search certificates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
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
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              <span className="ml-2">Loading certificates...</span>
            </div>
          ) : filteredCertificates?.length === 0 ? (
            <div className="text-center py-10">
              <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery 
                  ? "No certificates match your search criteria" 
                  : "No certificates have been generated yet"}
              </p>
              {!searchQuery && (
                <Button onClick={openCreateDialog}>
                  <Award className="mr-2 h-4 w-4" />
                  Generate Certificate
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate Number</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates?.map((certificate) => (
                    <TableRow key={certificate.id}>
                      <TableCell className="font-medium">{certificate.certificateNumber}</TableCell>
                      <TableCell>{getStudentName(certificate.studentId)}</TableCell>
                      <TableCell>{getStudentIdentifier(certificate.studentId)}</TableCell>
                      <TableCell>{getCourseName(certificate.courseId)}</TableCell>
                      <TableCell>{format(new Date(certificate.issueDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedCertificate(certificate)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedCertificate(certificate);
                              setTimeout(() => handlePrintCertificate(), 100);
                            }}
                            title="Print"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create Certificate Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Certificate</DialogTitle>
            <DialogDescription>
              Create a certificate for a student
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form 
              method="post" 
              action="#" 
              onSubmit={form.handleSubmit(onSubmit)} 
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <Select 
                      onValueChange={(value) => handleStudentChange(Number(value))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students?.map((student) => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.fullName} ({student.studentId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses?.map((course) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    form.reset();
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button" // Changed to button type
                  disabled={isPending}
                  onClick={() => {
                    console.log("Submit button clicked");
                    const values = form.getValues();
                    console.log("Form values on click:", values);
                    
                    // Manual validation
                    const formIsValid = form.trigger();
                    console.log("Form validation result:", formIsValid);
                    
                    // Process submission
                    onSubmit(values);
                  }}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Generate Certificate
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* View Certificate Dialog */}
      <Dialog open={!!selectedCertificate} onOpenChange={() => setSelectedCertificate(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
            <DialogDescription>
              Certificate #{selectedCertificate?.certificateNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCertificate && (
            <div className="py-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-6 aspect-video flex flex-col items-center justify-center text-center">
                  <h2 className="text-2xl font-bold text-primary-900 mb-2">Certificate of Completion</h2>
                  <p className="text-gray-500 mb-6">This is to certify that</p>
                  <p className="text-3xl font-bold text-primary-700 mb-2">{getStudentName(selectedCertificate.studentId)}</p>
                  <div className="w-48 h-px bg-gray-300 my-4"></div>
                  <p className="text-gray-500 mb-4">has successfully completed the course</p>
                  <p className="text-xl font-bold text-primary-700 mb-6">{getCourseName(selectedCertificate.courseId)}</p>
                  <p className="text-gray-500 mb-2">on</p>
                  <p className="text-lg font-semibold text-primary-900 mb-8">
                    {format(new Date(selectedCertificate.issueDate), 'MMMM dd, yyyy')}
                  </p>
                  <div className="flex justify-between w-full mt-8">
                    <div className="text-left">
                      <p className="text-sm text-gray-500">Certificate No:</p>
                      <p className="text-sm font-medium">{selectedCertificate.certificateNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Director's Signature</p>
                      <div className="w-24 h-px bg-black mt-6 ml-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setSelectedCertificate(null)}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => handlePrintCertificate()}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Certificate
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Print template (Hidden) */}
      {selectedCertificate && (
        <div className="hidden">
          <PrintTemplate ref={certificatePrintRef} orientation="landscape">
            <div dangerouslySetInnerHTML={{
              __html: generateCertificatePdf({
                certificateNumber: selectedCertificate.certificateNumber,
                studentName: getStudentName(selectedCertificate.studentId),
                courseName: getCourseName(selectedCertificate.courseId),
                issueDate: format(new Date(selectedCertificate.issueDate), 'MMMM dd, yyyy')
              })
            }} />
          </PrintTemplate>
        </div>
      )}
    </AppLayout>
  );
};

export default CertificatesPage;
