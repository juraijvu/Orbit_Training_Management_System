import { FC, useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertQuotationSchema, insertQuotationItemSchema } from '@shared/schema';
import { format, addDays } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/app-layout';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Printer, 
  Eye, 
  Loader2, 
  Check, 
  FilePlus, 
  Download,
  Mail,
  Plus,
  Trash2
} from 'lucide-react';
import { QuotationStatus } from '@shared/types';
import PrintTemplate from '@/components/print/print-template';
import { generateQuotationPdf } from '@/lib/pdf-templates';
import { useReactToPrint } from 'react-to-print';

interface QuotationItem {
  id: number;
  quotationId: number;
  courseId: number;
  duration: string;
  numberOfPersons: number;
  rate: number;
  total: number;
  createdAt: string;
}

interface Quotation {
  id: number;
  quotationNumber: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  validity: string;
  status: string;
  createdBy: number;
  createdAt: string;
  items?: QuotationItem[];
}

interface Course {
  id: number;
  name: string;
  description: string;
  duration: string;
  fee: number;
}

// Define the form values for a quotation item
interface QuotationItemFormValues {
  id?: number;
  courseId: number;
  duration: string;
  numberOfPersons: number;
  rate: number;
  total: number;
}

// Quotation item schema
const quotationItemSchema = z.object({
  id: z.number().optional(),
  courseId: z.number().min(1, "Course is required"),
  duration: z.string().min(1, "Duration is required"),
  numberOfPersons: z.number().min(1, "Number of persons must be at least 1"),
  rate: z.number().min(0, "Rate must be a positive number"),
  total: z.number().min(0, "Total must be a positive number"),
});

// Quotation form schema
const quotationFormSchema = insertQuotationSchema.extend({
  validity: z.string().min(1, "Validity date is required"),
  items: z.array(quotationItemSchema).min(1, "At least one course item is required"),
});

type QuotationFormValues = z.infer<typeof quotationFormSchema>;

const QuotationsPage: FC = () => {
  const [location, params] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(params?.search?.includes('new=true') || false);
  const [viewQuotation, setViewQuotation] = useState<Quotation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const quotationPrintRef = useRef<HTMLDivElement>(null);
  
  // Form for creating quotation
  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationFormSchema),
    defaultValues: {
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      totalAmount: 0,
      discount: 0,
      finalAmount: 0,
      validity: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      status: QuotationStatus.PENDING,
      createdBy: user?.id,
      items: [
        {
          courseId: 0,
          duration: '',
          numberOfPersons: 1,
          rate: 0,
          total: 0
        }
      ]
    },
  });
  
  // Field array for quotation items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });
  
  // Fetch quotations
  const { data: quotations, isLoading: quotationsLoading } = useQuery<Quotation[]>({
    queryKey: ['/api/quotations'],
  });
  
  // Fetch courses
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });
  
  // Create quotation mutation
  const createQuotationMutation = useMutation({
    mutationFn: async (data: QuotationFormValues) => {
      const res = await apiRequest('POST', '/api/quotations', data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotations'] });
      
      toast({
        title: 'Success',
        description: 'Quotation has been created successfully',
      });
      
      setIsDialogOpen(false);
      form.reset();
      
      // View the newly created quotation
      setViewQuotation(data);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update quotation status mutation
  const updateQuotationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest('PATCH', `/api/quotations/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotations'] });
      
      toast({
        title: 'Success',
        description: 'Quotation status has been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Watch for changes in form values
  const watchedItems = form.watch('items');
  const watchedDiscount = form.watch('discount');
  
  // Calculate totals for all items
  const calculateTotals = () => {
    const items = form.getValues('items') || [];
    let totalAmount = 0;
    
    items.forEach((item, index) => {
      if (item.courseId && item.numberOfPersons) {
        const course = courses?.find(c => c.id === Number(item.courseId));
        if (course) {
          const rate = course.fee;
          const total = rate * item.numberOfPersons;
          
          // Update rate and total in the form
          form.setValue(`items.${index}.rate`, rate);
          form.setValue(`items.${index}.total`, total);
          
          // Add to total amount
          totalAmount += total;
        }
      }
    });
    
    form.setValue('totalAmount', totalAmount);
    form.setValue('finalAmount', totalAmount - (Number(watchedDiscount) || 0));
  };
  
  // Update calculations when form values change
  useEffect(() => {
    if (courses) {
      calculateTotals();
    }
  }, [watchedItems, watchedDiscount, courses]);
  
  // Submit form
  const onSubmit = (values: QuotationFormValues) => {
    createQuotationMutation.mutate(values);
  };
  
  // Handle print quotation
  const handlePrintQuotation = useReactToPrint({
    content: () => quotationPrintRef.current,
    onAfterPrint: () => {
      toast({
        title: 'Success',
        description: 'Quotation has been printed successfully.',
      });
    },
  });
  
  // Get course name
  const getCourseName = (courseId: number) => {
    const course = courses?.find(c => c.id === courseId);
    return course?.name || 'Unknown Course';
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case QuotationStatus.PENDING:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case QuotationStatus.ACCEPTED:
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case QuotationStatus.REJECTED:
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Filter quotations based on search query
  const filteredQuotations = quotations?.filter(quotation => {
    if (!searchQuery) return true;
    
    const companyName = quotation.companyName.toLowerCase();
    const contactPerson = quotation.contactPerson.toLowerCase();
    const quotationNumber = quotation.quotationNumber.toLowerCase();
    const courseName = getCourseName(quotation.courseId).toLowerCase();
    
    const query = searchQuery.toLowerCase();
    
    return companyName.includes(query) || 
           contactPerson.includes(query) || 
           quotationNumber.includes(query) ||
           courseName.includes(query);
  });
  
  // Check if loading
  const isLoading = quotationsLoading || coursesLoading;
  const isPending = createQuotationMutation.isPending || updateQuotationMutation.isPending;

  return (
    <AppLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Quotations</h1>
          <p className="text-gray-600">Create and manage corporate training quotations</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <FilePlus className="mr-2 h-4 w-4" />
          New Quotation
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full md:w-96">
              <Input
                placeholder="Search quotations..."
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
              <span className="ml-2">Loading quotations...</span>
            </div>
          ) : filteredQuotations?.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Quotations Found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery 
                  ? "No quotations match your search criteria" 
                  : "You haven't created any quotations yet"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Create New Quotation
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quotation #</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations?.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell className="font-medium">{quotation.quotationNumber}</TableCell>
                      <TableCell>{quotation.companyName}</TableCell>
                      <TableCell>{getCourseName(quotation.courseId)}</TableCell>
                      <TableCell>{quotation.participants}</TableCell>
                      <TableCell>₹{quotation.finalAmount.toLocaleString()}</TableCell>
                      <TableCell>{format(new Date(quotation.validity), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setViewQuotation(quotation)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setViewQuotation(quotation);
                              setTimeout(() => handlePrintQuotation(), 100);
                            }}
                            title="Print"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title="Email"
                          >
                            <Mail className="h-4 w-4" />
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
      
      {/* Create Quotation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Quotation</DialogTitle>
            <DialogDescription>
              Create a quotation for corporate training
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(Number(value));
                          
                          // Update total amount based on course fee and participants
                          const course = courses?.find(c => c.id === Number(value));
                          if (course) {
                            const participants = form.getValues('participants') || 1;
                            const discount = form.getValues('discount') || 0;
                            const totalAmount = course.fee * participants;
                            
                            form.setValue('totalAmount', totalAmount);
                            form.setValue('finalAmount', totalAmount - discount);
                          }
                        }} 
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses?.filter(course => course.active).map((course) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              {course.name} - ₹{course.fee.toLocaleString()}/person
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
                  name="participants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Participants</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            field.onChange(value);
                            
                            // Update total amount
                            if (watchedCourseId) {
                              const course = courses?.find(c => c.id === Number(watchedCourseId));
                              if (course) {
                                const totalAmount = course.fee * value;
                                const discount = form.getValues('discount') || 0;
                                
                                form.setValue('totalAmount', totalAmount);
                                form.setValue('finalAmount', totalAmount - discount);
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            field.onChange(value);
                            
                            // Update final amount
                            const totalAmount = form.getValues('totalAmount') || 0;
                            form.setValue('finalAmount', totalAmount - value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="finalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final Amount (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid Until</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={QuotationStatus.PENDING}>Pending</SelectItem>
                          <SelectItem value={QuotationStatus.ACCEPTED}>Accepted</SelectItem>
                          <SelectItem value={QuotationStatus.REJECTED}>Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
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
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Create Quotation
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* View Quotation Dialog */}
      <Dialog open={!!viewQuotation} onOpenChange={() => setViewQuotation(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Quotation Details</DialogTitle>
            <DialogDescription>
              Quotation #{viewQuotation?.quotationNumber}
            </DialogDescription>
          </DialogHeader>
          
          {viewQuotation && (
            <div className="py-4">
              <div className="border rounded-lg p-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold">Orbit Institute</h2>
                  <p className="text-gray-600">123, Education Hub, Tech City, India - 123456</p>
                  <p className="text-gray-600">Phone: +91 1234567890 | Email: info@orbitinstitute.com</p>
                </div>
                
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold">QUOTATION</h3>
                  <p className="text-gray-600">Quotation No: {viewQuotation.quotationNumber}</p>
                  <p className="text-gray-600">Date: {format(new Date(viewQuotation.createdAt), 'MMMM dd, yyyy')}</p>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">To:</h3>
                  <p><strong>{viewQuotation.companyName}</strong></p>
                  <p>Attn: {viewQuotation.contactPerson}</p>
                  <p>Email: {viewQuotation.email}</p>
                  <p>Phone: {viewQuotation.phone}</p>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">Course Details:</h3>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Participants</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">{getCourseName(viewQuotation.courseId)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">{viewQuotation.participants}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">{viewQuotation.totalAmount.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 text-right font-semibold" colSpan={2}>Discount</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">{viewQuotation.discount.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 text-right font-semibold" colSpan={2}>Total Amount</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-semibold">{viewQuotation.finalAmount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">Terms & Conditions:</h3>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Validity: This quotation is valid until {format(new Date(viewQuotation.validity), 'MMMM dd, yyyy')}.</li>
                    <li>Payment: 50% advance payment to confirm the training.</li>
                    <li>Balance payment to be made before the completion of the training.</li>
                    <li>All taxes applicable will be charged extra.</li>
                    <li>Cancellation: Cancellation charges of 25% will be applicable if cancelled within 7 days of the training date.</li>
                  </ul>
                </div>
                
                <div className="mb-8">
                  <p>For any queries or clarifications, please feel free to contact us.</p>
                </div>
                
                <div className="mt-16">
                  <div className="text-right">
                    <p className="font-semibold">For Orbit Institute</p>
                    <div className="h-16"></div>
                    <p>Authorized Signatory</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <div className="space-x-2">
                  {viewQuotation.status === QuotationStatus.PENDING && (
                    <>
                      <Button 
                        variant="outline"
                        onClick={() => updateQuotationMutation.mutate({ 
                          id: viewQuotation.id, 
                          status: QuotationStatus.ACCEPTED 
                        })}
                        disabled={isPending}
                      >
                        Mark as Accepted
                      </Button>
                      <Button 
                        variant="outline"
                        className="text-red-600 border-red-300 hover:text-red-700 hover:bg-red-50"
                        onClick={() => updateQuotationMutation.mutate({ 
                          id: viewQuotation.id, 
                          status: QuotationStatus.REJECTED 
                        })}
                        disabled={isPending}
                      >
                        Mark as Rejected
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => setViewQuotation(null)}
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={() => handlePrintQuotation()}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Quotation
                  </Button>
                  <Button>
                    <Mail className="mr-2 h-4 w-4" />
                    Email Quotation
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Print template (Hidden) */}
      {viewQuotation && (
        <div className="hidden">
          <PrintTemplate ref={quotationPrintRef} orientation="portrait">
            <div dangerouslySetInnerHTML={{
              __html: generateQuotationPdf({
                quotationNumber: viewQuotation.quotationNumber,
                companyName: viewQuotation.companyName,
                contactPerson: viewQuotation.contactPerson,
                email: viewQuotation.email,
                phone: viewQuotation.phone,
                courseName: getCourseName(viewQuotation.courseId),
                participants: viewQuotation.participants,
                totalAmount: viewQuotation.totalAmount,
                discount: viewQuotation.discount,
                finalAmount: viewQuotation.finalAmount,
                validity: format(new Date(viewQuotation.validity), 'MMMM dd, yyyy'),
                date: format(new Date(viewQuotation.createdAt), 'MMMM dd, yyyy')
              })
            }} />
          </PrintTemplate>
        </div>
      )}
    </AppLayout>
  );
};

export default QuotationsPage;
