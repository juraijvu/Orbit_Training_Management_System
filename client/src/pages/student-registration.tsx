import { FC, useState } from 'react';
import { useNavigate } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { insertStudentSchema } from '@shared/schema';
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { BatchType, Gender, PaymentMode } from '@shared/types';

// Extend the schema for the form validation
const studentRegistrationSchema = insertStudentSchema.omit({
  studentId: true,
  registrationDate: true,
  createdAt: true,
}).extend({
  dob: z.string().refine(val => {
    try {
      const date = new Date(val);
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  }, {
    message: "Please enter a valid date",
  }),
});

type StudentRegistrationFormValues = z.infer<typeof studentRegistrationSchema>;

interface Course {
  id: number;
  name: string;
  description: string;
  duration: string;
  fee: number;
  content?: string;
  active: boolean;
}

const StudentRegistration: FC = () => {
  const [, navigate] = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch courses for the dropdown
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });
  
  const form = useForm<StudentRegistrationFormValues>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {
      fullName: '',
      fatherName: '',
      email: '',
      phone: '',
      dob: format(new Date(), 'yyyy-MM-dd'),
      gender: Gender.MALE,
      address: '',
      courseId: undefined,
      batch: BatchType.MORNING,
      courseFee: 0,
      discount: 0,
      totalFee: 0,
      initialPayment: 0,
      balanceDue: 0,
      paymentMode: PaymentMode.CASH,
      paymentStatus: 'pending',
    },
  });
  
  // Watch fields to update calculations in real-time
  const courseId = form.watch('courseId');
  const courseFee = form.watch('courseFee');
  const discount = form.watch('discount');
  const initialPayment = form.watch('initialPayment');
  
  // Update course fee when course is selected
  const selectedCourse = courses?.find(c => c.id === Number(courseId));
  
  // Calculate total fee and balance due
  const totalFee = courseFee - (discount || 0);
  const balanceDue = totalFee - (initialPayment || 0);
  
  // Update form values when courseFee, discount or initialPayment changes
  useState(() => {
    if (selectedCourse) {
      form.setValue('courseFee', selectedCourse.fee);
      form.setValue('totalFee', selectedCourse.fee);
    }
  });
  
  useState(() => {
    form.setValue('totalFee', totalFee);
    form.setValue('balanceDue', balanceDue);
    
    // Set payment status based on balance
    if (balanceDue <= 0) {
      form.setValue('paymentStatus', 'paid');
    } else if (initialPayment > 0) {
      form.setValue('paymentStatus', 'partial');
    } else {
      form.setValue('paymentStatus', 'pending');
    }
  });
  
  // Handle form submission
  const studentMutation = useMutation({
    mutationFn: async (data: StudentRegistrationFormValues) => {
      const res = await apiRequest('POST', '/api/students', data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/activities'] });
      
      toast({
        title: 'Success',
        description: `Student ${data.fullName} has been registered successfully.`,
      });
      
      // Navigate to student list
      navigate('/student-list');
    },
    onError: (error) => {
      toast({
        title: 'Failed to register student',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (values: StudentRegistrationFormValues) => {
    studentMutation.mutate(values);
  };
  
  if (coursesLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2">Loading courses...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Student Registration</h1>
        <p className="text-gray-600">Register a new student for courses at Orbit Institute</p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-4">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fatherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Name</FormLabel>
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
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={Gender.MALE}>Male</SelectItem>
                            <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                            <SelectItem value={Gender.OTHER}>Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Course Information */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-4">Course Information</h3>
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
                            const course = courses?.find(c => c.id === Number(value));
                            if (course) {
                              form.setValue('courseFee', course.fee);
                              form.setValue('totalFee', course.fee);
                              form.setValue('balanceDue', course.fee);
                            }
                          }} 
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Course" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courses?.map((course) => (
                              <SelectItem key={course.id} value={course.id.toString()}>
                                {course.name} - {course.duration}
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
                    name="batch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Batch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={BatchType.MORNING}>Morning (9AM - 12PM)</SelectItem>
                            <SelectItem value={BatchType.AFTERNOON}>Afternoon (2PM - 5PM)</SelectItem>
                            <SelectItem value={BatchType.EVENING}>Evening (6PM - 9PM)</SelectItem>
                            <SelectItem value={BatchType.WEEKEND}>Weekend</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="courseFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Fee (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} readOnly />
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
                            {...field} 
                            onChange={(e) => {
                              const value = e.target.valueAsNumber || 0;
                              field.onChange(value);
                              
                              // Update total fee and balance due
                              const newTotal = courseFee - value;
                              form.setValue('totalFee', newTotal);
                              form.setValue('balanceDue', newTotal - (initialPayment || 0));
                              
                              // Update payment status
                              if (newTotal <= initialPayment) {
                                form.setValue('paymentStatus', 'paid');
                              } else if (initialPayment > 0) {
                                form.setValue('paymentStatus', 'partial');
                              } else {
                                form.setValue('paymentStatus', 'pending');
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="totalFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Fee (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} readOnly />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Payment Mode" />
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
                    control={form.control}
                    name="initialPayment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Payment (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => {
                              const value = e.target.valueAsNumber || 0;
                              field.onChange(value);
                              
                              // Update balance due
                              const newBalance = totalFee - value;
                              form.setValue('balanceDue', newBalance);
                              
                              // Update payment status
                              if (newBalance <= 0) {
                                form.setValue('paymentStatus', 'paid');
                              } else if (value > 0) {
                                form.setValue('paymentStatus', 'partial');
                              } else {
                                form.setValue('paymentStatus', 'pending');
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="balanceDue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Balance Due (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={studentMutation.isPending}
                >
                  {studentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Register Student'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default StudentRegistration;
