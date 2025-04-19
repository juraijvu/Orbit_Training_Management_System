import { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Calendar, DollarSign, FileUp, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Form validation schema
const expenseSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  category: z.string({
    required_error: "Category is required",
  }),
  description: z.string({
    required_error: "Description is required",
  }).min(5, {
    message: "Description must be at least 5 characters.",
  }),
  amount: z.coerce.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number",
  }).positive({
    message: "Amount must be a positive number",
  }),
  paymentMethod: z.string({
    required_error: "Payment method is required",
  }),
  submittedById: z.string({
    required_error: "Submitted by is required",
  }),
  receiptFile: z.any().optional(),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

// Mock employee data
interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
}

const AddExpensePage: FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Default form values
  const defaultValues: Partial<ExpenseFormValues> = {
    date: new Date(),
  };

  // Form setup
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues,
  });

  // Mock fetch employees
  const { data: employees, isLoading: isLoadingEmployees } = useQuery<Employee[]>({
    queryKey: ['/api/hrm/employees'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        { id: 101, name: 'Ahmed Al Mansouri', department: 'Administration', position: 'HR Manager' },
        { id: 102, name: 'Sara Al Jaber', department: 'Administration', position: 'Administrative Assistant' },
        { id: 103, name: 'Mohammed Rahman', department: 'Marketing', position: 'Digital Marketing Expert' },
        { id: 104, name: 'Jamal Hassan', department: 'Training', position: 'Training Specialist' },
        { id: 105, name: 'Fatima Ali', department: 'Sales', position: 'Course Advisor' },
        { id: 106, name: 'Rahul Patel', department: 'IT', position: 'Full Stack Developer' },
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (values: ExpenseFormValues) => {
      // Mock API call - replace with real API call
      console.log('Submitting expense', values);
      return await apiRequest('POST', '/api/crm/expenses', values);
    },
    onSuccess: () => {
      toast({
        title: "Expense recorded",
        description: "The expense record has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/expenses/summary'] });
      navigate('/crm/expenses');
    },
    onError: (error: any) => {
      toast({
        title: "Failed to record expense",
        description: error.message || "An error occurred while saving the expense record.",
        variant: "destructive",
      });
    }
  });

  // Form submission handler
  const onSubmit = (values: ExpenseFormValues) => {
    createExpenseMutation.mutate(values);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button asChild variant="outline" size="sm" className="mr-4">
          <Link href="/crm/expenses">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Expenses
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add New Expense</h1>
          <p className="text-muted-foreground">
            Record a new company expense
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>
            Enter the details of the expense
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={(date) => field.onChange(date)}
                      />
                      <FormDescription>
                        Date when the expense occurred
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                          <SelectItem value="Rent">Rent</SelectItem>
                          <SelectItem value="Utilities">Utilities</SelectItem>
                          <SelectItem value="Travel">Travel</SelectItem>
                          <SelectItem value="Training">Training</SelectItem>
                          <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the most appropriate category for this expense
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Brief description of the expense" />
                    </FormControl>
                    <FormDescription>
                      Provide a clear description of what this expense was for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (AED)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-8"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter the total amount in AED
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="Corporate Card">Corporate Card</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Direct Debit">Direct Debit</SelectItem>
                          <SelectItem value="Cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How was this expense paid for?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="submittedById"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submitted By</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select person" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingEmployees ? (
                          <SelectItem value="loading" disabled>
                            Loading employees...
                          </SelectItem>
                        ) : (
                          employees?.map((employee) => (
                            <SelectItem 
                              key={employee.id} 
                              value={employee.id.toString()}
                            >
                              {employee.name} ({employee.department})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Who is submitting this expense?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receiptFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receipt Upload</FormLabel>
                    <FormControl>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="receipt" className="sr-only">Receipt Upload</Label>
                        <div className="border rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                          <Input
                            id="receipt"
                            type="file"
                            className="hidden"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              field.onChange(file);
                            }}
                          />
                          <Label htmlFor="receipt" className="cursor-pointer flex flex-col items-center justify-center">
                            <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="font-medium text-sm">Click to upload receipt</span>
                            <span className="text-xs text-muted-foreground mt-1">
                              Support for JPG, PNG or PDF
                            </span>
                          </Label>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload a digital copy of the receipt (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes about this expense"
                        {...field}
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Add any relevant details about this expense
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-between mt-6 bg-muted/50 p-4 rounded-md border">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Submit for Approval</p>
                    <p className="text-muted-foreground">
                      This expense will need to be approved by a manager before being finalized.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 sm:self-end">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/crm/expenses')}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createExpenseMutation.isPending}
                  >
                    {createExpenseMutation.isPending ? "Saving..." : "Submit Expense"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddExpensePage;