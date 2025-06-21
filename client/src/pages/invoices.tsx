import { FC, useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertInvoiceSchema } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
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
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Printer, Plus, Loader2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import PrintTemplate from '@/components/print/print-template';
import { generateInvoicePdf } from '@/lib/pdf-templates';
import { useReactToPrint } from 'react-to-print';
import { PaymentMode } from '@shared/types';

interface Student {
  id: number;
  studentId: string;
  fullName: string;
  address: string;
  phone: string;
  courseId: number;
  courseFee: number;
  totalFee: number;
  balanceDue: number;
  paymentStatus: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  studentId: number;
  amount: number;
  paymentMode: string;
  transactionId?: string;
  paymentDate: string;
  status: string;
  createdAt: string;
}

interface Course {
  id: number;
  name: string;
  duration: string;
}

// Create the form validation schema
const invoiceFormSchema = z.object({
  studentId: z.string(), // Store as string in form, convert to number on submit
  amount: z.string(),
  paymentMode: z.string(),
  transactionId: z.string().optional(),
  paymentDate: z.string().refine(val => {
    try {
      const date = new Date(val);
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  }, {
    message: "Please enter a valid date",
  }),
  status: z.string(),
});

// We don't include invoiceNumber as the server generates it
type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

// Form schema for editing invoices with string amount
const editInvoiceFormSchema = z.object({
  amount: z.string().optional(),
  paymentMode: z.string().optional(),
  transactionId: z.string().optional(),
  paymentDate: z.string().optional(),
  status: z.string().optional(),
});

type EditInvoiceFormValues = z.infer<typeof editInvoiceFormSchema>;

const InvoicesPage: FC = () => {
  const [location, params] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all-invoices');
  const [selectedInvoice, setSelectedInvoice] = useState<(Invoice & { student?: Student, course?: Course }) | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const invoicePrintRef = useRef<HTMLDivElement>(null);
  
  // Fetch invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
  });
  
  // Fetch students
  const { data: students, isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });
  
  // Fetch courses
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });
  
  // Form for creating new invoice
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      studentId: '',
      amount: '0',
      paymentMode: 'cash',
      transactionId: '',
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'pending',
    },
  });
  
  // Watching student ID to update amount field
  const watchedStudentId = form.watch('studentId');
  
  // Update amount when student is selected
  useEffect(() => {
    if (watchedStudentId) {
      const student = students?.find(s => s.id === Number(watchedStudentId));
      if (student) {
        form.setValue('amount', student.balanceDue.toString());
      }
    }
  }, [watchedStudentId, students]);
  
  // Create invoice mutation
  const invoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormValues & { invoiceNumber?: string }) => {
      // Create a properly typed payload for the server
      // Type that matches what the server expects
      interface ServerInvoicePayload {
        invoiceNumber: string; // Server requires this field, but will generate its own
        studentId: number;
        amount: string; // Server expects a string for numeric values
        paymentMode: string;
        transactionId: string | null;
        paymentDate: string; // Send as ISO string - server will validate/convert to Date
        status: string;
      }
      
      // Parse the date and create a new Date object
      const dateObj = new Date(data.paymentDate);
      // Convert to ISO format string
      const isoDateString = dateObj.toISOString();
      
      const payload: ServerInvoicePayload = {
        invoiceNumber: data.invoiceNumber || `INV-${new Date().getTime()}`, // This will be overwritten by server
        studentId: Number(data.studentId),
        amount: String(data.amount), // Ensure amount is a string
        paymentMode: data.paymentMode,
        transactionId: data.transactionId || null,
        paymentDate: isoDateString, // Send as ISO string format
        status: data.status
      };
      
      console.log("Mutation sending payload to server:", payload);
      const res = await apiRequest('POST', '/api/invoices', payload);
      const result = await res.json();
      console.log("Server response:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/activities'] });
      
      toast({
        title: 'Success',
        description: 'Invoice has been created successfully',
      });
      
      setIsNewModalOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Edit invoice form
  const editForm = useForm<EditInvoiceFormValues>({
    resolver: zodResolver(editInvoiceFormSchema),
    defaultValues: {
      status: '',
      paymentMode: '',
      amount: "0", // Use string for form input
      transactionId: '',
      paymentDate: '',
    }
  });
  
  // Update form values when an invoice is selected for editing
  useEffect(() => {
    if (selectedInvoice && isEditModalOpen) {
      editForm.setValue('status', selectedInvoice.status);
      editForm.setValue('amount', selectedInvoice.amount.toString());
      editForm.setValue('paymentMode', selectedInvoice.paymentMode as PaymentMode);
      editForm.setValue('transactionId', selectedInvoice.transactionId || '');
      editForm.setValue('paymentDate', format(new Date(selectedInvoice.paymentDate), 'yyyy-MM-dd'));
    }
  }, [selectedInvoice, isEditModalOpen, editForm]);
  
  // Update invoice mutation
  const updateInvoiceMutation = useMutation({
    mutationFn: async (data: { id: number, updates: EditInvoiceFormValues }) => {
      // Create a properly typed payload for the server
      const serverUpdates: Partial<Invoice> = {};
      
      if (data.updates.amount) {
        serverUpdates.amount = Number(data.updates.amount);
      }
      if (data.updates.paymentMode) {
        serverUpdates.paymentMode = data.updates.paymentMode;
      }
      if (data.updates.transactionId !== undefined) {
        serverUpdates.transactionId = data.updates.transactionId;
      }
      if (data.updates.paymentDate) {
        serverUpdates.paymentDate = data.updates.paymentDate;
      }
      if (data.updates.status) {
        serverUpdates.status = data.updates.status;
      }
      
      const res = await apiRequest('PATCH', `/api/invoices/${data.id}`, serverUpdates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      
      toast({
        title: 'Success',
        description: 'Invoice has been updated successfully',
      });
      
      setIsEditModalOpen(false);
      setSelectedInvoice(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Submit form
  const onSubmit = (values: InvoiceFormValues) => {
    console.log("Form submitted with values:", values);
    
    try {
      // Generate a simple invoice number based on date and student ID
      // This is required by the server validation, though it will be overwritten
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const studentIdNumber = Number(values.studentId);
      const invoiceNumber = `INV-${today.getFullYear()}${month}${day}-${studentIdNumber}`;
      
      // Make sure the values are in the format the server expects
      const formattedValues = {
        ...values,
        amount: String(values.amount), // Ensure amount is a string
        invoiceNumber
      };
      
      console.log("Manual form submission");
      console.log("Submitting payload:", formattedValues);
      
      // Use the values with invoiceNumber
      invoiceMutation.mutate(formattedValues as any);
    } catch (error) {
      console.error("Error preparing form submission:", error);
      toast({
        title: 'Error',
        description: 'Failed to process form data. Please check your inputs.',
        variant: 'destructive',
      });
    }
  };
  
  // View invoice details
  const viewInvoice = (invoice: Invoice) => {
    const student = students?.find(s => s.id === invoice.studentId);
    const course = student ? courses?.find(c => c.id === student.courseId) : undefined;
    
    setSelectedInvoice({
      ...invoice,
      student,
      course,
    });
  };
  
  // Handle print invoice
  const handlePrintInvoice = useReactToPrint({
    documentTitle: 'Invoice',
    onAfterPrint: () => {
      toast({
        title: 'Success',
        description: 'Invoice has been printed successfully.',
      });
    },
    // TypeScript workaround for content property
    // @ts-ignore
    content: () => invoicePrintRef.current,
  });
  
  // Loading state
  const isLoading = invoicesLoading || studentsLoading || coursesLoading;
  
  // Get students with pending balances
  const studentsWithBalances = students?.filter(s => s.balanceDue > 0) || [];
  
  // Prepare invoices with student data
  const invoicesWithDetails = invoices?.map(invoice => {
    const student = students?.find(s => s.id === invoice.studentId);
    const course = student ? courses?.find(c => c.id === student.courseId) : undefined;
    
    return {
      ...invoice,
      student,
      course,
    };
  }) || [];

  return (
    <AppLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Invoices</h1>
          <p className="text-gray-600">Manage student invoices and payments</p>
        </div>
        <Button onClick={() => setIsNewModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all-invoices" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all-invoices">All Invoices</TabsTrigger>
              <TabsTrigger value="pending-payments">Pending Payments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all-invoices">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                  <span className="ml-2">Loading invoices...</span>
                </div>
              ) : invoicesWithDetails.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No invoices found. Create your first invoice!</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsNewModalOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice Number</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoicesWithDetails.map(invoice => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{invoice.student ? `${invoice.student.firstName} ${invoice.student.lastName}` : `ID: ${invoice.studentId}`}</TableCell>
                          <TableCell>₹{invoice.amount.toLocaleString()}</TableCell>
                          <TableCell>{invoice.paymentMode}</TableCell>
                          <TableCell>{format(new Date(invoice.paymentDate), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <Badge className={invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => viewInvoice(invoice)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  viewInvoice(invoice);
                                  setTimeout(() => handlePrintInvoice(), 100);
                                }}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  viewInvoice(invoice);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending-payments">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                  <span className="ml-2">Loading pending payments...</span>
                </div>
              ) : studentsWithBalances.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No pending payments found!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Total Fee</TableHead>
                        <TableHead>Balance Due</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentsWithBalances.map(student => {
                        const course = courses?.find(c => c.id === student.courseId);
                        
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.studentId}</TableCell>
                            <TableCell>{student.fullName}</TableCell>
                            <TableCell>{course?.name || `ID: ${student.courseId}`}</TableCell>
                            <TableCell>₹{student.totalFee ? student.totalFee.toLocaleString() : '0'}</TableCell>
                            <TableCell>₹{student.balanceDue ? student.balanceDue.toLocaleString() : '0'}</TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800">
                                {student.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm"
                                onClick={() => {
                                  form.setValue('studentId', student.id);
                                  form.setValue('amount', student.balanceDue.toString());
                                  setIsNewModalOpen(true);
                                }}
                              >
                                Create Invoice
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Create new invoice dialog */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice for student payment
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        const student = students?.find(s => s.id === Number(value));
                        if (student && student.balanceDue) {
                          form.setValue('amount', student.balanceDue.toString());
                        }
                      }} 
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students?.map(student => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {`${student.firstName} ${student.lastName}`} ({student.studentId})
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="paymentMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Mode</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction ID (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
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
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button" 
                  disabled={invoiceMutation.isPending}
                  onClick={() => {
                    console.log("Manual form submission");
                    const formData = form.getValues();
                    
                    // Generate a simple invoice number based on date and student ID
                    const today = new Date();
                    const month = String(today.getMonth() + 1).padStart(2, '0');
                    const day = String(today.getDate()).padStart(2, '0');
                    const studentIdNumber = Number(formData.studentId);
                    const invoiceNumber = `INV-${today.getFullYear()}${month}${day}-${studentIdNumber}`;
                    
                    const payload = {
                      invoiceNumber: invoiceNumber,
                      studentId: Number(formData.studentId),
                      amount: formData.amount ? Number(formData.amount) : 0,
                      paymentMode: formData.paymentMode,
                      transactionId: formData.transactionId || '',
                      paymentDate: formData.paymentDate,
                      status: formData.status
                    };
                    
                    console.log("Submitting payload:", payload);
                    invoiceMutation.mutate(payload as any);
                  }}
                >
                  {invoiceMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Invoice'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit invoice dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>
              Update invoice details and payment status
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <Form {...editForm}>
              <form 
                onSubmit={editForm.handleSubmit((values: EditInvoiceFormValues) => {
                  updateInvoiceMutation.mutate({
                    id: selectedInvoice.id,
                    updates: values
                  });
                })} 
                className="space-y-4"
              >
                <FormField
                  control={editForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (AED)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="paymentMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Mode</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={PaymentMode.CASH}>Cash</SelectItem>
                          <SelectItem value={PaymentMode.UPI}>UPI</SelectItem>
                          <SelectItem value={PaymentMode.BANK_TRANSFER}>Bank Transfer</SelectItem>
                          <SelectItem value={PaymentMode.CHEQUE}>Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="transactionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction ID (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="partially_paid">Partially Paid</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateInvoiceMutation.isPending}
                  >
                    {updateInvoiceMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Invoice'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Invoice details dialog */}
      <Dialog open={!!selectedInvoice && !isEditModalOpen} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              View and print invoice
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && selectedInvoice.student && (
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
                    <p>{selectedInvoice.student.fullName}</p>
                    <p>{selectedInvoice.student.address}</p>
                    <p>Phone: {selectedInvoice.student.phone}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <p><span className="font-semibold">Invoice No:</span> {selectedInvoice.invoiceNumber}</p>
                    <p><span className="font-semibold">Student ID:</span> {selectedInvoice.student.studentId}</p>
                    <p><span className="font-semibold">Date:</span> {format(new Date(selectedInvoice.paymentDate), 'dd/MM/yyyy')}</p>
                    <p><span className="font-semibold">Status:</span> {selectedInvoice.status}</p>
                  </div>
                </div>
                
                <table className="w-full border-collapse mb-6">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        Payment for {selectedInvoice.course?.name || 'Course'} - {selectedInvoice.student.studentId}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {selectedInvoice.amount.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold">Total</td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        {selectedInvoice.amount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="mb-6">
                  <p className="font-semibold mb-2">Payment Details:</p>
                  <p>Payment Mode: {selectedInvoice.paymentMode}</p>
                  {selectedInvoice.transactionId && (
                    <p>Transaction ID: {selectedInvoice.transactionId}</p>
                  )}
                  <p>Date: {format(new Date(selectedInvoice.paymentDate), 'dd/MM/yyyy')}</p>
                </div>
                
                <div className="text-center mt-10">
                  <p className="font-semibold">Thank you for choosing Orbit Institute!</p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => handlePrintInvoice()}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Print template (Hidden) */}
      {selectedInvoice && selectedInvoice.student && (
        <div className="hidden">
          <PrintTemplate ref={invoicePrintRef} orientation="landscape">
            <div dangerouslySetInnerHTML={{
              __html: generateInvoicePdf({
                invoiceNumber: selectedInvoice.invoiceNumber,
                studentId: selectedInvoice.student.studentId,
                fullName: selectedInvoice.student.fullName,
                address: selectedInvoice.student.address,
                phone: selectedInvoice.student.phone,
                date: format(new Date(selectedInvoice.paymentDate), 'dd/MM/yyyy'),
                paymentStatus: selectedInvoice.status,
                course: selectedInvoice.course?.name || 'Course',
                duration: selectedInvoice.course?.duration || '',
                amount: selectedInvoice.student.courseFee,
                discount: selectedInvoice.student.totalFee - selectedInvoice.student.courseFee,
                total: selectedInvoice.student.totalFee,
                amountPaid: selectedInvoice.amount,
                balanceDue: selectedInvoice.student.balanceDue,
                paymentMode: selectedInvoice.paymentMode,
                transactionId: selectedInvoice.transactionId
              })
            }} />
          </PrintTemplate>
        </div>
      )}
    </AppLayout>
  );
};

export default InvoicesPage;
