import { FC, useState, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertTrainerSchema } from '@shared/schema';
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
import { 
  Pencil, 
  Trash2, 
  UserPlus, 
  Plus, 
  Loader2, 
  Check, 
  X,
  Calendar,
  CheckCircle,
  FileText,
  Upload,
  Download,
  ExternalLink
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface Trainer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  courses: string;
  availability: string;
  profilePdf?: string;
  createdAt: string;
}

interface Course {
  id: number;
  name: string;
  duration: string;
  fee: number;
  active: boolean;
}

// Define days of the week
const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

// Define time slots
const TIME_SLOTS = [
  '9:00 AM - 12:00 PM',
  '12:00 PM - 3:00 PM',
  '3:00 PM - 6:00 PM',
  '6:00 PM - 9:00 PM'
];

// Trainer form schema
const trainerFormSchema = insertTrainerSchema.extend({
  courses: z.string().min(1, "Please select at least one course"),
  availability: z.string().min(1, "Please select availability"),
  selectedCourses: z.array(z.string()).optional(),
  availabilityMatrix: z.record(z.string(), z.array(z.string())).optional(),
  profilePdf: z.string().optional(),
  profilePdfFile: z.instanceof(File).optional(),
});

type TrainerFormValues = z.infer<typeof trainerFormSchema>;

const TrainersPage: FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState<Trainer | null>(null);
  
  // Form for creating/editing trainer
  const form = useForm<TrainerFormValues>({
    resolver: zodResolver(trainerFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      specialization: '',
      courses: '',
      availability: '{}',
      selectedCourses: [],
      availabilityMatrix: {},
      profilePdf: '',
    },
  });
  
  // File input reference
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file',
          variant: 'destructive',
        });
        return;
      }
      
      // Setup for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Here we'd typically upload the file to a server endpoint 
      // For this demo, we're creating a temporary URL and storing the file
      form.setValue('profilePdfFile', file);
      const tempUrl = URL.createObjectURL(file);
      form.setValue('profilePdf', tempUrl);
    }
  }, [form, toast]);
  
  // Fetch trainers
  const { data: trainers, isLoading: trainersLoading } = useQuery<Trainer[]>({
    queryKey: ['/api/trainers'],
  });
  
  // Fetch courses
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });
  
  // Create trainer mutation
  const createTrainerMutation = useMutation({
    mutationFn: async (data: TrainerFormValues) => {
      // Convert the selected courses to a comma-separated string
      const coursesString = data.selectedCourses?.join(',') || '';
      
      // Convert the availability matrix to a JSON string
      const availabilityString = JSON.stringify(data.availabilityMatrix || {});
      
      // Handle file upload if needed
      let profilePdfUrl = data.profilePdf;
      
      if (data.profilePdfFile) {
        // In a real implementation, we would upload the file to a server here
        // For now, we'll just use the URL.createObjectURL result
        console.log('Would upload file:', data.profilePdfFile.name);
        // profilePdfUrl would be the URL returned from the server after upload
      }
      
      const trainerData = {
        ...data,
        courses: coursesString,
        availability: availabilityString,
        profilePdf: profilePdfUrl
      };
      
      // Remove the additional fields that are not part of the schema
      delete (trainerData as any).selectedCourses;
      delete (trainerData as any).availabilityMatrix;
      delete (trainerData as any).profilePdfFile;
      
      const res = await apiRequest('POST', '/api/trainers', trainerData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trainers'] });
      
      toast({
        title: 'Success',
        description: 'Trainer has been added successfully',
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
  
  // Update trainer mutation
  const updateTrainerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: TrainerFormValues }) => {
      // Convert the selected courses to a comma-separated string
      const coursesString = data.selectedCourses?.join(',') || '';
      
      // Convert the availability matrix to a JSON string
      const availabilityString = JSON.stringify(data.availabilityMatrix || {});
      
      const trainerData = {
        ...data,
        courses: coursesString,
        availability: availabilityString,
      };
      
      // Remove the additional fields that are not part of the schema
      delete (trainerData as any).selectedCourses;
      delete (trainerData as any).availabilityMatrix;
      
      const res = await apiRequest('PATCH', `/api/trainers/${id}`, trainerData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trainers'] });
      
      toast({
        title: 'Success',
        description: 'Trainer has been updated successfully',
      });
      
      setIsDialogOpen(false);
      setEditingTrainer(null);
      setIsEditMode(false);
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
  
  // Delete trainer mutation
  const deleteTrainerMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/trainers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trainers'] });
      
      toast({
        title: 'Success',
        description: 'Trainer has been deleted successfully',
      });
      
      setDeleteAlertOpen(false);
      setTrainerToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Add new trainer
  const openNewTrainerDialog = () => {
    form.reset({
      fullName: '',
      email: '',
      phone: '',
      specialization: '',
      courses: '',
      availability: '{}',
      selectedCourses: [],
      availabilityMatrix: {},
    });
    setIsEditMode(false);
    setEditingTrainer(null);
    setIsDialogOpen(true);
  };
  
  // Edit trainer
  const openEditTrainerDialog = (trainer: Trainer) => {
    try {
      // Parse the comma-separated course IDs
      const selectedCourses = trainer.courses ? trainer.courses.split(',') : [];
      
      // Parse the availability JSON
      const availabilityMatrix = JSON.parse(trainer.availability);
      
      form.reset({
        fullName: trainer.fullName,
        email: trainer.email,
        phone: trainer.phone,
        specialization: trainer.specialization,
        courses: trainer.courses,
        availability: trainer.availability,
        selectedCourses,
        availabilityMatrix,
        profilePdf: trainer.profilePdf || '',
      });
      
      setIsEditMode(true);
      setEditingTrainer(trainer);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error parsing trainer data:", error);
      toast({
        title: 'Error',
        description: 'Could not load trainer data',
        variant: 'destructive',
      });
    }
  };
  
  // Confirm delete trainer
  const confirmDeleteTrainer = (trainer: Trainer) => {
    setTrainerToDelete(trainer);
    setDeleteAlertOpen(true);
  };
  
  // Submit form
  const onSubmit = (values: TrainerFormValues) => {
    if (isEditMode && editingTrainer) {
      updateTrainerMutation.mutate({ id: editingTrainer.id, data: values });
    } else {
      createTrainerMutation.mutate(values);
    }
  };
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  
  // Get course name by ID
  const getCourseName = (courseId: string) => {
    const course = courses?.find(c => c.id.toString() === courseId);
    return course?.name || 'Unknown Course';
  };
  
  // Format availability for display
  const formatAvailability = (availabilityJson: string) => {
    try {
      const availability = JSON.parse(availabilityJson);
      const days = Object.keys(availability);
      
      if (days.length === 0) {
        return 'No availability set';
      }
      
      return days.map(day => {
        const slots = availability[day];
        if (slots.length === 0) return null;
        
        return `${day}: ${slots.join(', ')}`;
      }).filter(Boolean).join('; ');
    } catch (error) {
      return 'Invalid availability data';
    }
  };
  
  // Toggle availability in matrix
  const toggleAvailability = (day: string, timeSlot: string) => {
    const currentAvailability = form.getValues('availabilityMatrix') || {};
    const daySlots = currentAvailability[day] || [];
    
    const updatedSlots = daySlots.includes(timeSlot)
      ? daySlots.filter(slot => slot !== timeSlot)
      : [...daySlots, timeSlot];
    
    form.setValue('availabilityMatrix', {
      ...currentAvailability,
      [day]: updatedSlots,
    });
  };
  
  // Check if a time slot is selected
  const isTimeSlotSelected = (day: string, timeSlot: string) => {
    const availabilityMatrix = form.getValues('availabilityMatrix') || {};
    return availabilityMatrix[day]?.includes(timeSlot) || false;
  };
  
  const isPending = createTrainerMutation.isPending || 
                     updateTrainerMutation.isPending || 
                     deleteTrainerMutation.isPending;
  
  const isLoading = trainersLoading || coursesLoading;
  
  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <X className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to manage trainers.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Trainer Management</h1>
          <p className="text-gray-600">Add, edit and manage trainers at Orbit Institute</p>
        </div>
        <Button onClick={openNewTrainerDialog}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Trainer
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2">Loading trainers...</span>
        </div>
      ) : trainers?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center">
          <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Trainers Found</h3>
          <p className="text-gray-500 mb-6">You haven't added any trainers yet. Add your first trainer to get started.</p>
          <Button onClick={openNewTrainerDialog}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Trainer
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers?.map((trainer) => (
            <Card key={trainer.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">{trainer.fullName}</CardTitle>
                <CardDescription>{trainer.specialization}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-sm font-medium text-gray-500 w-20">Email:</span>
                    <span className="text-sm">{trainer.email}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-sm font-medium text-gray-500 w-20">Phone:</span>
                    <span className="text-sm">{trainer.phone}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-sm font-medium text-gray-500 w-20">Courses:</span>
                    <div className="flex flex-wrap gap-1">
                      {trainer.courses.split(',').map((courseId, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {getCourseName(courseId)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">Availability:</span>
                    <p className="text-xs text-gray-600">{formatAvailability(trainer.availability)}</p>
                  </div>
                  
                  {trainer.profilePdf && (
                    <div className="mt-3 pt-3 border-t">
                      <a 
                        href={trainer.profilePdf} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:text-primary-dark text-sm"
                      >
                        <FileText className="h-4 w-4 mr-1.5" />
                        View Profile PDF
                        <ExternalLink className="h-3 w-3 ml-1.5" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between space-x-2 border-t pt-4">
                {trainer.profilePdf ? (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="flex items-center text-gray-600"
                    onClick={() => window.open(trainer.profilePdf, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download CV
                  </Button>
                ) : (
                  <div></div>
                )}
                
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="flex items-center"
                    onClick={() => openEditTrainerDialog(trainer)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => confirmDeleteTrainer(trainer)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add/Edit Trainer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Trainer' : 'Add New Trainer'}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Update the trainer details below' 
                : 'Fill in the details to add a new trainer'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
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
              
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Web Development, Data Science" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="selectedCourses"
                render={() => (
                  <FormItem>
                    <FormLabel>Courses</FormLabel>
                    <FormDescription>
                      Select the courses that this trainer can teach
                    </FormDescription>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {courses?.filter(course => course.active).map((course) => (
                        <div key={course.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`course-${course.id}`}
                            checked={form.getValues('selectedCourses')?.includes(course.id.toString())}
                            onCheckedChange={(checked) => {
                              const currentCourses = form.getValues('selectedCourses') || [];
                              const courseId = course.id.toString();
                              
                              if (checked) {
                                form.setValue('selectedCourses', [...currentCourses, courseId]);
                              } else {
                                form.setValue('selectedCourses', 
                                  currentCourses.filter(id => id !== courseId)
                                );
                              }
                              
                              // Also update the courses string
                              form.setValue('courses', form.getValues('selectedCourses')?.join(',') || '');
                            }}
                          />
                          <label 
                            htmlFor={`course-${course.id}`}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            {course.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="availabilityMatrix"
                render={() => (
                  <FormItem>
                    <FormLabel>Availability</FormLabel>
                    <FormDescription>
                      Select the days and time slots when the trainer is available
                    </FormDescription>
                    <div className="border rounded-md p-4 mt-2">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th className="text-left font-medium py-2">Day</th>
                            {TIME_SLOTS.map((slot) => (
                              <th key={slot} className="text-center font-medium py-2">{slot}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {DAYS_OF_WEEK.map((day) => (
                            <tr key={day} className="border-t">
                              <td className="py-3 font-medium">{day}</td>
                              {TIME_SLOTS.map((slot) => (
                                <td key={slot} className="text-center py-3">
                                  <Checkbox 
                                    checked={isTimeSlotSelected(day, slot)}
                                    onCheckedChange={() => toggleAvailability(day, slot)}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <FormMessage />
                    
                    {/* Hidden field to store the availability JSON string */}
                    <input 
                      type="hidden" 
                      {...form.register('availability')} 
                      value={JSON.stringify(form.getValues('availabilityMatrix') || {})} 
                    />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="profilePdf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trainer Profile (PDF)</FormLabel>
                    <FormDescription>
                      Upload the trainer's CV or detailed profile in PDF format
                    </FormDescription>
                    <div className="mt-2 space-y-4">
                      {field.value ? (
                        <div className="flex items-center justify-between border rounded-md p-3 bg-gray-50">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-500 mr-2" />
                            <span className="text-sm truncate max-w-[200px]">
                              {field.value.split('/').pop()}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              className="h-8"
                              onClick={() => window.open(field.value, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              className="h-8 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
                              onClick={() => form.setValue('profilePdf', '')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 cursor-pointer"
                             onClick={() => fileInputRef.current?.click()}>
                          <div className="space-y-1 text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                            <div className="text-sm text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer font-medium text-primary hover:text-primary-dark"
                              >
                                <span>Upload a PDF file</span>
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PDF up to 10MB
                            </p>
                          </div>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
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
                      {isEditMode ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {isEditMode ? 'Update Trainer' : 'Add Trainer'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the trainer "{trainerToDelete?.fullName}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTrainerMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (trainerToDelete) {
                  deleteTrainerMutation.mutate(trainerToDelete.id);
                }
              }}
              disabled={deleteTrainerMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteTrainerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Trainer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default TrainersPage;
