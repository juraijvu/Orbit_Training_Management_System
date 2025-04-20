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

// Define the shape of a quotation item
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
  active: boolean;
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
  
  // Initialize form with default values
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
    }
  });
  
  // Set up field array for quotation items
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
  
  // Watch form values for reactivity
  const watchedItems = form.watch('items');
  const watchedDiscount = form.watch('discount');
  
  // Create quotation mutation
  const createQuotationMutation = useMutation({
    mutationFn: async (values: QuotationFormValues) => {
      const res = await apiRequest('POST', '/api/quotations', values);
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
  
  // Calculate totals for all items and overall quotation
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
    
    // Update totals
    form.setValue('totalAmount', totalAmount);
    const discount = form.getValues('discount') || 0;
    form.setValue('finalAmount', totalAmount - discount);
  };
  
  // Recalculate when items or discount changes
  useEffect(() => {
    if (courses?.length) {
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
  
  // Handle download PDF
  const handleDownloadPdf = async () => {
    if (viewQuotation) {
      try {
        const pdfBlob = await generateQuotationPdf(viewQuotation);
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Quotation-${viewQuotation.quotationNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to generate PDF',
          variant: 'destructive',
        });
      }
    }
  };
  
  // Filter quotations based on search query
  const filteredQuotations = quotations?.filter(quotation => {
    if (!searchQuery) return true;
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      quotation.quotationNumber.toLowerCase().includes(lowerCaseQuery) ||
      quotation.companyName.toLowerCase().includes(lowerCaseQuery) ||
      quotation.contactPerson.toLowerCase().includes(lowerCaseQuery) ||
      quotation.status.toLowerCase().includes(lowerCaseQuery)
    );
  });
  
  // Loading state
  const isPending = createQuotationMutation.isPending;
  
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quotations</h1>
          <Button onClick={() => setIsDialogOpen(true)}>
            <FilePlus className="h-4 w-4 mr-2" />
            Create Quotation
          </Button>
        </div>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="mb-4">
              <Input
                placeholder="Search quotations..."
                className="max-w-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {quotationsLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quotation #</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount (₹)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations?.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell>{quotation.quotationNumber}</TableCell>
                      <TableCell>{quotation.companyName}</TableCell>
                      <TableCell>{quotation.contactPerson}</TableCell>
                      <TableCell>{format(new Date(quotation.createdAt), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>₹{quotation.finalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge 
                          className={quotation.status === QuotationStatus.ACCEPTED ? 'bg-green-100 text-green-800' :
                                    quotation.status === QuotationStatus.REJECTED ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'}
                        >
                          {quotation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
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
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Course Items</h3>
                  
                  {fields.map((field, index) => (
                    <div 
                      key={field.id} 
                      className="p-3 sm:p-4 bg-gray-50 rounded-md border border-gray-200 overflow-hidden"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs sm:text-sm font-medium">Item #{index + 1}</h4>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.courseId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(Number(value));
                                  calculateTotals();
                                }}
                                value={field.value === 0 ? "" : field.value.toString()}
                                disabled={isPending}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select course" />
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
                          name={`items.${index}.duration`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="e.g., 3 days, 2 weeks"
                                  disabled={isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`items.${index}.numberOfPersons`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Number of Persons</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  {...field}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    field.onChange(val || 1);
                                    calculateTotals();
                                  }}
                                  disabled={isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.rate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rate per Person (₹)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  disabled={true}
                                  className="bg-gray-100"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`items.${index}.total`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total (₹)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  disabled={true}
                                  className="bg-gray-100"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({
                      courseId: 0,
                      duration: '',
                      numberOfPersons: 1,
                      rate: 0,
                      total: 0
                    })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Course
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                            className="bg-gray-100"
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
                              calculateTotals();
                            }}
                            disabled={isPending}
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
                            className="bg-gray-100"
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
                    <p className="text-gray-600">123, Education Hub, Tech City, UAE</p>
                    <p className="text-gray-600">Phone: +971 1234567890 | Email: info@orbitinstitute.ae</p>
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
                          <th className="border border-gray-300 px-4 py-2 text-center">Duration</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Participants</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">Rate (₹)</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewQuotation.items?.map((item, index) => {
                          const course = courses?.find(c => c.id === item.courseId);
                          return (
                            <tr key={index}>
                              <td className="border border-gray-300 px-4 py-2">{course?.name || 'Unknown Course'}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{item.duration}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{item.numberOfPersons}</td>
                              <td className="border border-gray-300 px-4 py-2 text-right">₹{item.rate.toLocaleString()}</td>
                              <td className="border border-gray-300 px-4 py-2 text-right">₹{item.total.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                        <tr>
                          <td colSpan={4} className="border border-gray-300 px-4 py-2 text-right font-semibold">Total:</td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-semibold">₹{viewQuotation.totalAmount.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="border border-gray-300 px-4 py-2 text-right font-semibold">Discount:</td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-semibold">₹{viewQuotation.discount.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="border border-gray-300 px-4 py-2 text-right font-semibold">Final Amount:</td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-semibold">₹{viewQuotation.finalAmount.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2">Terms & Conditions:</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>This quotation is valid until {format(new Date(viewQuotation.validity), 'MMMM dd, yyyy')}</li>
                      <li>Payment terms: 50% advance, 50% upon completion</li>
                      <li>Training can be conducted at our premises or at client location</li>
                      <li>Training materials will be provided by Orbit Institute</li>
                      <li>Certificates will be issued to all participants upon successful completion</li>
                    </ol>
                  </div>
                  
                  <div className="text-center">
                    <p className="mb-6">If you have any questions, please contact us.</p>
                    <div className="mt-12">
                      <p className="font-semibold">Authorized Signature</p>
                      <div className="h-px w-48 bg-gray-400 mx-auto mt-12 mb-1"></div>
                      <p>For Orbit Institute</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrintQuotation}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadPdf}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  
                  {viewQuotation.status === QuotationStatus.PENDING && (
                    <>
                      <Button 
                        onClick={() => updateQuotationMutation.mutate({ 
                          id: viewQuotation.id, 
                          status: QuotationStatus.ACCEPTED 
                        })}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Accept
                      </Button>
                      <Button 
                        onClick={() => updateQuotationMutation.mutate({ 
                          id: viewQuotation.id, 
                          status: QuotationStatus.REJECTED 
                        })}
                        variant="destructive"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Print template (hidden) */}
        <div className="hidden">
          <div ref={quotationPrintRef}>
            <PrintTemplate>
              {viewQuotation && (
                <div className="p-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold">Orbit Institute</h2>
                    <p className="text-gray-600">123, Education Hub, Tech City, UAE</p>
                    <p className="text-gray-600">Phone: +971 1234567890 | Email: info@orbitinstitute.ae</p>
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
                          <th className="border border-gray-300 px-4 py-2 text-center">Duration</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Participants</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">Rate (₹)</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewQuotation.items?.map((item, index) => {
                          const course = courses?.find(c => c.id === item.courseId);
                          return (
                            <tr key={index}>
                              <td className="border border-gray-300 px-4 py-2">{course?.name || 'Unknown Course'}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{item.duration}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{item.numberOfPersons}</td>
                              <td className="border border-gray-300 px-4 py-2 text-right">₹{item.rate.toLocaleString()}</td>
                              <td className="border border-gray-300 px-4 py-2 text-right">₹{item.total.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                        <tr>
                          <td colSpan={4} className="border border-gray-300 px-4 py-2 text-right font-semibold">Total:</td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-semibold">₹{viewQuotation.totalAmount.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="border border-gray-300 px-4 py-2 text-right font-semibold">Discount:</td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-semibold">₹{viewQuotation.discount.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="border border-gray-300 px-4 py-2 text-right font-semibold">Final Amount:</td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-semibold">₹{viewQuotation.finalAmount.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2">Terms & Conditions:</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>This quotation is valid until {format(new Date(viewQuotation.validity), 'MMMM dd, yyyy')}</li>
                      <li>Payment terms: 50% advance, 50% upon completion</li>
                      <li>Training can be conducted at our premises or at client location</li>
                      <li>Training materials will be provided by Orbit Institute</li>
                      <li>Certificates will be issued to all participants upon successful completion</li>
                    </ol>
                  </div>
                  
                  <div className="text-center">
                    <p className="mb-6">If you have any questions, please contact us.</p>
                    <div className="mt-12">
                      <p className="font-semibold">Authorized Signature</p>
                      <div className="h-px w-48 bg-gray-400 mx-auto mt-12 mb-1"></div>
                      <p>For Orbit Institute</p>
                    </div>
                  </div>
                </div>
              )}
            </PrintTemplate>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default QuotationsPage;