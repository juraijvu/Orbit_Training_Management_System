import { FC, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertScheduleSchema } from '@shared/schema';
import { format, addMinutes, parse, isBefore, isAfter, areIntervalsOverlapping } from 'date-fns';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarPlus, 
  Clock, 
  User, 
  Users, 
  Loader2, 
  Calendar as CalendarIcon,
  Check,
  X,
  Trash2
} from 'lucide-react';
import { ScheduleStatus } from '@shared/types';

interface Schedule {
  id: number;
  title: string;
  courseId: number;
  trainerId: number;
  studentIds: string;
  startTime: string;
  endTime: string;
  status: string;
  createdBy: number;
  createdAt: string;
}

interface Course {
  id: number;
  name: string;
  duration: string;
}

interface Trainer {
  id: number;
  fullName: string;
  specialization: string;
  courses: string;
  availability: string;
}

interface Student {
  id: number;
  studentId: string;
  fullName: string;
  courseId: number;
}

// Schedule form schema
const scheduleFormSchema = insertScheduleSchema.extend({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  status: z.string().min(1, "Status is required"),
  selectedDate: z.date(),
  selectedStartTime: z.string(),
  selectedEndTime: z.string(),
  selectedStudents: z.array(z.string()).min(1, "Please select at least one student"),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

const SchedulePage: FC = () => {
  const [location, params] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isDialogOpen, setIsDialogOpen] = useState(params?.search?.includes('new=true') || false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  
  // Form for creating schedule
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      title: '',
      courseId: undefined,
      trainerId: undefined,
      studentIds: '',
      startTime: '',
      endTime: '',
      status: ScheduleStatus.CONFIRMED,
      createdBy: user?.id,
      selectedDate: new Date(),
      selectedStartTime: '09:00',
      selectedEndTime: '10:30',
      selectedStudents: [],
    },
  });
  
  // Update createdBy whenever user changes
  useEffect(() => {
    if (user) {
      form.setValue('createdBy', user.id);
    }
  }, [user, form]);
  
  // Fetch schedules
  const { data: schedules, isLoading: schedulesLoading } = useQuery<Schedule[]>({
    queryKey: ['/api/schedules'],
  });
  
  // Fetch courses
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });
  
  // Fetch trainers
  const { data: trainers, isLoading: trainersLoading } = useQuery<Trainer[]>({
    queryKey: ['/api/trainers'],
  });
  
  // Fetch students
  const { data: students, isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });
  
  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: async (data: ScheduleFormValues) => {
      // Convert the form values to the format expected by the API
      const selectedDate = data.selectedDate;
      const startTime = parse(data.selectedStartTime, 'HH:mm', new Date());
      const endTime = parse(data.selectedEndTime, 'HH:mm', new Date());
      
      // Set the date part of the time
      const combinedStartTime = new Date(selectedDate);
      combinedStartTime.setHours(startTime.getHours(), startTime.getMinutes());
      
      const combinedEndTime = new Date(selectedDate);
      combinedEndTime.setHours(endTime.getHours(), endTime.getMinutes());
      
      const schedule = {
        title: data.title,
        courseId: data.courseId,
        trainerId: data.trainerId,
        studentIds: data.selectedStudents.join(','),
        startTime: combinedStartTime.toISOString(),
        endTime: combinedEndTime.toISOString(),
        status: data.status,
        createdBy: data.createdBy,
      };
      
      const res = await apiRequest('POST', '/api/schedules', schedule);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/schedules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/activities'] });
      
      toast({
        title: 'Success',
        description: 'Schedule has been created successfully',
      });
      
      setIsDialogOpen(false);
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
  
  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest('PATCH', `/api/schedules/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/schedules'] });
      
      toast({
        title: 'Success',
        description: 'Schedule status has been updated successfully',
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
  
  // Delete schedule mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/schedules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/schedules'] });
      
      toast({
        title: 'Success',
        description: 'Schedule has been deleted successfully',
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedSchedule(null);
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
  const watchedCourseId = form.watch('courseId');
  const watchedTrainerId = form.watch('trainerId');
  const watchedSelectedDate = form.watch('selectedDate');
  const watchedStartTime = form.watch('selectedStartTime');
  const watchedEndTime = form.watch('selectedEndTime');
  
  // Filter trainers based on selected course
  const availableTrainers = trainers?.filter(trainer => {
    if (!watchedCourseId) return true;
    
    // Check if trainer teaches this course
    const trainerCourses = trainer.courses.split(',');
    return trainerCourses.includes(watchedCourseId.toString());
  });
  
  // Filter students based on selected course
  const courseStudents = students?.filter(student => {
    if (!watchedCourseId) return true;
    return student.courseId === Number(watchedCourseId);
  });
  
  // Check if selected time slot is available for the trainer
  const isTrainerAvailable = () => {
    if (!watchedTrainerId || !watchedSelectedDate || !watchedStartTime || !watchedEndTime) {
      return true;
    }
    
    const trainer = trainers?.find(t => t.id === Number(watchedTrainerId));
    if (!trainer) return false;
    
    try {
      // Parse trainer availability
      const availability = JSON.parse(trainer.availability);
      
      // Get day of week
      const dayOfWeek = format(watchedSelectedDate, 'EEEE');
      
      // Get trainer's available slots for that day
      const daySlots = availability[dayOfWeek] || [];
      
      // Check if any slot contains the selected time
      // This is a simplified check - in a real app you would need more sophisticated time overlap checking
      const selectedStartTime = parse(watchedStartTime, 'HH:mm', new Date());
      const selectedEndTime = parse(watchedEndTime, 'HH:mm', new Date());
      
      for (const slot of daySlots) {
        // Parse slot times like "9:00 AM - 12:00 PM"
        const [startStr, endStr] = slot.split(' - ');
        const slotStart = parse(startStr, 'h:mm a', new Date());
        const slotEnd = parse(endStr, 'h:mm a', new Date());
        
        // Check if selected time is within slot
        if (!isBefore(selectedStartTime, slotStart) && !isAfter(selectedEndTime, slotEnd)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error checking trainer availability:", error);
      return false;
    }
  };
  
  // Check for scheduling conflicts
  const hasSchedulingConflict = () => {
    if (!watchedTrainerId || !watchedSelectedDate || !watchedStartTime || !watchedEndTime) {
      return false;
    }
    
    // Create date objects for the selected time range
    const selectedDate = watchedSelectedDate;
    const startTime = parse(watchedStartTime, 'HH:mm', selectedDate);
    const endTime = parse(watchedEndTime, 'HH:mm', selectedDate);
    
    const selectedStart = new Date(selectedDate);
    selectedStart.setHours(startTime.getHours(), startTime.getMinutes());
    
    const selectedEnd = new Date(selectedDate);
    selectedEnd.setHours(endTime.getHours(), endTime.getMinutes());
    
    // Check existing schedules for the selected trainer
    return schedules?.some(schedule => {
      // Skip checking against the schedule being edited
      if (selectedSchedule && schedule.id === selectedSchedule.id) {
        return false;
      }
      
      // Only check schedules for the selected trainer
      if (schedule.trainerId !== Number(watchedTrainerId)) {
        return false;
      }
      
      // Only check confirmed or pending schedules
      if (schedule.status === ScheduleStatus.CANCELLED) {
        return false;
      }
      
      const scheduleStart = new Date(schedule.startTime);
      const scheduleEnd = new Date(schedule.endTime);
      
      // Check for overlap
      return areIntervalsOverlapping(
        { start: selectedStart, end: selectedEnd },
        { start: scheduleStart, end: scheduleEnd }
      );
    }) || false;
  };
  
  // Submit form
  const onSubmit = (values: ScheduleFormValues) => {
    if (!isTrainerAvailable()) {
      toast({
        title: 'Warning',
        description: 'The selected trainer is not available at this time slot.',
        variant: 'destructive',
      });
      return;
    }
    
    if (hasSchedulingConflict()) {
      toast({
        title: 'Warning',
        description: 'There is a scheduling conflict with another session.',
        variant: 'destructive',
      });
      return;
    }
    
    createScheduleMutation.mutate(values);
  };
  
  // Open create schedule dialog
  const openCreateDialog = () => {
    form.reset({
      title: '',
      courseId: undefined,
      trainerId: undefined,
      studentIds: '',
      startTime: '',
      endTime: '',
      status: ScheduleStatus.CONFIRMED,
      createdBy: user?.id,
      selectedDate: new Date(),
      selectedStartTime: '09:00',
      selectedEndTime: '10:30',
      selectedStudents: [],
    });
    setIsDialogOpen(true);
  };
  
  // Get schedule status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case ScheduleStatus.CONFIRMED:
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case ScheduleStatus.PENDING:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case ScheduleStatus.CANCELLED:
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Get trainer name
  const getTrainerName = (trainerId: number) => {
    const trainer = trainers?.find(t => t.id === trainerId);
    return trainer?.fullName || 'Unknown Trainer';
  };
  
  // Get course name
  const getCourseName = (courseId: number) => {
    const course = courses?.find(c => c.id === courseId);
    return course?.name || 'Unknown Course';
  };
  
  // Get student names
  const getStudentNames = (studentIds: string) => {
    if (!studentIds) return 'No students';
    
    const ids = studentIds.split(',');
    const studentNames = ids.map(id => {
      const student = students?.find(s => s.id.toString() === id);
      return student?.fullName || `Student #${id}`;
    });
    
    if (studentNames.length <= 2) {
      return studentNames.join(', ');
    } else {
      return `${studentNames[0]}, ${studentNames[1]} + ${studentNames.length - 2} more`;
    }
  };
  
  // Filter schedules based on tab
  const filteredSchedules = schedules?.filter(schedule => {
    const now = new Date();
    const scheduleStart = new Date(schedule.startTime);
    
    switch (activeTab) {
      case 'upcoming':
        return scheduleStart >= now && schedule.status !== ScheduleStatus.CANCELLED;
      case 'past':
        return scheduleStart < now;
      case 'cancelled':
        return schedule.status === ScheduleStatus.CANCELLED;
      default:
        return true;
    }
  }) || [];
  
  // Sort schedules by date
  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
  
  // Group schedules by date
  const schedulesByDate = sortedSchedules.reduce((acc, schedule) => {
    const dateStr = format(new Date(schedule.startTime), 'yyyy-MM-dd');
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);
  
  // Check if loading
  const isLoading = schedulesLoading || coursesLoading || trainersLoading || studentsLoading;
  const isPending = createScheduleMutation.isPending || updateScheduleMutation.isPending || deleteScheduleMutation.isPending;

  return (
    <AppLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Schedule Management</h1>
          <p className="text-gray-600">Create and manage class schedules</p>
        </div>
        <Button onClick={openCreateDialog}>
          <CalendarPlus className="mr-2 h-4 w-4" />
          Create Schedule
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar column */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="border rounded-md p-2"
            />
          </CardContent>
        </Card>
        
        {/* Schedules column */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Schedules</CardTitle>
              <div className="text-sm">
                {format(date, 'MMMM d, yyyy')}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                <span className="ml-2">Loading schedules...</span>
              </div>
            ) : Object.keys(schedulesByDate).length === 0 ? (
              <div className="text-center py-10">
                <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedules Found</h3>
                <p className="text-gray-500 mb-6">There are no {activeTab} schedules to display.</p>
                <Button onClick={openCreateDialog}>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Create Schedule
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(schedulesByDate).map(([dateStr, daySchedules]) => (
                  <div key={dateStr}>
                    <h3 className="text-md font-semibold text-gray-700 mb-2">
                      {format(new Date(dateStr), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <div className="space-y-3">
                      {daySchedules.map((schedule) => (
                        <Card key={schedule.id} className="overflow-hidden">
                          <div className="flex">
                            {/* Time column */}
                            <div className="bg-primary-50 px-4 py-3 w-32 flex-shrink-0 flex flex-col items-center justify-center">
                              <div className="text-sm font-semibold text-primary-900">
                                {format(new Date(schedule.startTime), 'h:mm a')}
                              </div>
                              <div className="text-xs text-primary-700">
                                to {format(new Date(schedule.endTime), 'h:mm a')}
                              </div>
                            </div>
                            
                            {/* Details column */}
                            <div className="flex-1 p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{schedule.title}</h4>
                                  <p className="text-sm text-gray-700">{getCourseName(schedule.courseId)}</p>
                                </div>
                                {getStatusBadge(schedule.status)}
                              </div>
                              
                              <div className="mt-2 space-y-1 text-sm">
                                <div className="flex items-center">
                                  <User className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
                                  <span>{getTrainerName(schedule.trainerId)}</span>
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
                                  <span className="truncate">{getStudentNames(schedule.studentIds)}</span>
                                </div>
                              </div>
                              
                              {schedule.status !== ScheduleStatus.CANCELLED && (
                                <div className="mt-3 flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateScheduleMutation.mutate({ 
                                      id: schedule.id, 
                                      status: ScheduleStatus.CANCELLED 
                                    })}
                                    disabled={isPending}
                                  >
                                    Cancel
                                  </Button>
                                  {schedule.status === ScheduleStatus.PENDING && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => updateScheduleMutation.mutate({ 
                                        id: schedule.id, 
                                        status: ScheduleStatus.CONFIRMED 
                                      })}
                                      disabled={isPending}
                                    >
                                      Confirm
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => {
                                      setSelectedSchedule(schedule);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                    disabled={isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Create Schedule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Schedule</DialogTitle>
            <DialogDescription>
              Schedule a new class or session
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Web Development Class - Batch 4" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          {courses?.filter(course => course.active).map((course) => (
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
                  name="trainerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trainer</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))} 
                        value={field.value?.toString()}
                        disabled={!watchedCourseId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a trainer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableTrainers?.map((trainer) => (
                            <SelectItem key={trainer.id} value={trainer.id.toString()}>
                              {trainer.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {watchedTrainerId && !isTrainerAvailable() && (
                <div className="rounded-md bg-yellow-50 p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <X className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Availability Warning</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          The selected trainer is not available for this time slot. Please choose a different time or trainer.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {watchedTrainerId && watchedSelectedDate && watchedStartTime && watchedEndTime && hasSchedulingConflict() && (
                <div className="rounded-md bg-red-50 p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <X className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Scheduling Conflict</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>
                          There is a scheduling conflict with another session. Please choose a different time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <FormField
                control={form.control}
                name="selectedDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="selectedStartTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="selectedEndTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="selectedStudents"
                render={() => (
                  <FormItem>
                    <FormLabel>Students</FormLabel>
                    <FormDescription>
                      Select the students who will attend this session
                    </FormDescription>
                    <div className="max-h-48 overflow-auto border rounded-md p-4">
                      {!watchedCourseId ? (
                        <div className="text-center text-gray-500 py-4">
                          Please select a course first
                        </div>
                      ) : courseStudents?.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">
                          No students found for this course
                        </div>
                      ) : (
                        courseStudents?.map((student) => (
                          <div key={student.id} className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              id={`student-${student.id}`}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                              checked={form.getValues('selectedStudents')?.includes(student.id.toString())}
                              onChange={(e) => {
                                const currentStudents = form.getValues('selectedStudents') || [];
                                const studentId = student.id.toString();
                                
                                if (e.target.checked) {
                                  form.setValue('selectedStudents', [...currentStudents, studentId]);
                                } else {
                                  form.setValue('selectedStudents', 
                                    currentStudents.filter(id => id !== studentId)
                                  );
                                }
                                
                                // Also update the studentIds string
                                form.setValue('studentIds', form.getValues('selectedStudents')?.join(',') || '');
                              }}
                            />
                            <label 
                              htmlFor={`student-${student.id}`}
                              className="ml-2 text-sm text-gray-700"
                            >
                              {student.fullName} ({student.studentId})
                            </label>
                          </div>
                        ))
                      )}
                    </div>
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
                        <SelectItem value={ScheduleStatus.CONFIRMED}>Confirmed</SelectItem>
                        <SelectItem value={ScheduleStatus.PENDING}>Pending</SelectItem>
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
                      Create Schedule
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the schedule. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteScheduleMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (selectedSchedule) {
                  deleteScheduleMutation.mutate(selectedSchedule.id);
                }
              }}
              disabled={deleteScheduleMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteScheduleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Schedule'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default SchedulePage;
