import { FC, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Calendar, Check, Clock, Info, Users } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { apiRequest } from '@/lib/queryClient';

// Form validation schema
const attendanceSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  employeeId: z.string({
    required_error: "Employee is required",
  }),
  status: z.enum(['present', 'absent', 'late', 'half-day'], {
    required_error: "Status is required",
  }),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  notes: z.string().optional(),
});

type AttendanceFormValues = z.infer<typeof attendanceSchema>;

// Mock employee data
interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
}

const RecordAttendance: FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('individual');

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

  // Default form values
  const defaultValues: Partial<AttendanceFormValues> = {
    date: new Date(),
    status: 'present',
  };

  // Form setup
  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues,
  });

  // Get selected status
  const status = form.watch('status');

  // Create attendance mutation
  const createAttendanceMutation = useMutation({
    mutationFn: async (values: AttendanceFormValues) => {
      // Mock API call - replace with real API call
      console.log('Submitting attendance', values);
      return await apiRequest('POST', '/api/hrm/attendance', values);
    },
    onSuccess: () => {
      toast({
        title: "Attendance recorded",
        description: "The attendance record has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hrm/attendance'] });
      navigate('/hrm/attendance');
    },
    onError: (error: any) => {
      toast({
        title: "Failed to record attendance",
        description: error.message || "An error occurred while saving the attendance record.",
        variant: "destructive",
      });
    }
  });

  // Form submission handler
  const onSubmit = (values: AttendanceFormValues) => {
    createAttendanceMutation.mutate(values);
  };

  // Time options for select elements
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        const time = `${h}:${m}`;
        
        // Format for display (12-hour format)
        const hour12 = hour % 12 || 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const label = `${hour12}:${m} ${ampm}`;
        
        options.push({ value: time, label });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button asChild variant="outline" size="sm" className="mr-4">
          <Link href="/hrm/attendance">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Attendance
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Record Attendance</h1>
          <p className="text-muted-foreground">
            Mark attendance for employees
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Entry</TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Record Individual Attendance</CardTitle>
              <CardDescription>
                Mark attendance for a single employee
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
                            Select the date for this attendance record
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select employee" />
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
                            Select the employee to mark attendance for
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Attendance Status</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="present" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                      <Check className="h-4 w-4 text-green-600" />
                                    </div>
                                    Present
                                  </div>
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="late" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                                      <Clock className="h-4 w-4 text-amber-600" />
                                    </div>
                                    Late
                                  </div>
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="half-day" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                                      <Calendar className="h-4 w-4 text-gray-600" />
                                    </div>
                                    Half Day
                                  </div>
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="absent" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
                                      <Info className="h-4 w-4 text-red-600" />
                                    </div>
                                    Absent
                                  </div>
                                </FormLabel>
                              </FormItem>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(status === 'present' || status === 'late' || status === 'half-day') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="checkIn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Check In Time</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select check-in time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
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
                        name="checkOut"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Check Out Time</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select check-out time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional notes about this attendance record"
                            {...field}
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Optional: Add details about late arrival, early departure, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/hrm/attendance')}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createAttendanceMutation.isPending}
                    >
                      {createAttendanceMutation.isPending ? "Saving..." : "Save Attendance"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Bulk Attendance Entry</CardTitle>
              <CardDescription>
                Mark attendance for multiple employees at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="bulkDate">Date</Label>
                  <DatePicker 
                    date={new Date()} 
                    setDate={() => {}} 
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border mb-6">
                <div className="py-3 px-4 border-b bg-muted/50">
                  <div className="grid grid-cols-12 gap-2 font-medium text-sm text-muted-foreground">
                    <div className="col-span-4">Employee</div>
                    <div className="col-span-2">Department</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Check In</div>
                    <div className="col-span-2">Check Out</div>
                  </div>
                </div>
                <div className="divide-y">
                  {isLoadingEmployees ? (
                    <div className="py-8 text-center text-muted-foreground">
                      Loading employees...
                    </div>
                  ) : (
                    employees?.map(employee => (
                      <div key={employee.id} className="py-3 px-4">
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-4">
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-muted-foreground">{employee.position}</div>
                          </div>
                          <div className="col-span-2 text-sm">
                            {employee.department}
                          </div>
                          <div className="col-span-2">
                            <Select defaultValue="present">
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="late">Late</SelectItem>
                                <SelectItem value="half-day">Half Day</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Input 
                              type="time" 
                              className="h-8" 
                              defaultValue="09:00" 
                            />
                          </div>
                          <div className="col-span-2">
                            <Input 
                              type="time" 
                              className="h-8" 
                              defaultValue="17:00" 
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => navigate('/hrm/attendance')}>
                  Cancel
                </Button>
                <Button>
                  Save Bulk Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecordAttendance;