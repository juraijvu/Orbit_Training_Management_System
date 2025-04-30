import { FC, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertCourseSchema } from '@shared/schema';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  FileText, 
  Plus, 
  Loader2, 
  Check, 
  X, 
  Eye, 
  Download 
} from 'lucide-react';

interface Course {
  id: number;
  name: string;
  description: string;
  duration: string;
  fee: number;
  content?: string;
  active: boolean;
  createdAt: string;
}

// Course form schema
const courseFormSchema = insertCourseSchema.extend({
  fee: z.preprocess(
    (value) => (value === '' ? '0' : String(value)),
    z.string().min(1, "Fee is required")
  ),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

const CourseManagement: FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isViewContentOpen, setIsViewContentOpen] = useState(false);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  
  // Form for creating/editing course
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: '',
      description: '',
      duration: '',
      fee: '0',
      content: '',
      active: true,
    },
  });
  
  // Fetch courses
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });
  
  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseFormValues) => {
      const res = await apiRequest('POST', '/api/courses', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: 'Success',
        description: 'Course has been created successfully',
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
  
  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<CourseFormValues> }) => {
      const res = await apiRequest('PATCH', `/api/courses/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: 'Success',
        description: 'Course has been updated successfully',
      });
      
      setIsDialogOpen(false);
      setEditingCourse(null);
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
  
  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: 'Success',
        description: 'Course has been deleted successfully',
      });
      
      setDeleteAlertOpen(false);
      setCourseToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Add new course
  const openNewCourseDialog = () => {
    form.reset({
      name: '',
      description: '',
      duration: '',
      fee: '0',
      content: '',
      active: true,
    });
    setIsEditMode(false);
    setEditingCourse(null);
    setIsDialogOpen(true);
  };
  
  // Edit course
  const openEditCourseDialog = (course: Course) => {
    form.reset({
      name: course.name,
      description: course.description,
      duration: course.duration,
      fee: course.fee,
      content: course.content || '',
      active: course.active,
    });
    setIsEditMode(true);
    setEditingCourse(course);
    setIsDialogOpen(true);
  };
  
  // View course content
  const viewCourseContent = (course: Course) => {
    setViewingCourse(course);
    setIsViewContentOpen(true);
  };
  
  // Confirm delete course
  const confirmDeleteCourse = (course: Course) => {
    setCourseToDelete(course);
    setDeleteAlertOpen(true);
  };
  
  // Submit form
  const onSubmit = (values: CourseFormValues) => {
    if (isEditMode && editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse.id, data: values });
    } else {
      createCourseMutation.mutate(values);
    }
  };
  
  const isPending = createCourseMutation.isPending || updateCourseMutation.isPending || deleteCourseMutation.isPending;
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  
  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <X className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to manage courses.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Course Management</h1>
          <p className="text-gray-600">Add, edit and manage courses at Orbit Institute</p>
        </div>
        <Button onClick={openNewCourseDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Course
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2">Loading courses...</span>
        </div>
      ) : courses?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
          <p className="text-gray-500 mb-6">You haven't added any courses yet. Add your first course to get started.</p>
          <Button onClick={openNewCourseDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course) => (
            <Card key={course.id} className={!course.active ? 'opacity-70' : ''}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{course.name}</CardTitle>
                  <Badge variant={course.active ? 'default' : 'secondary'}>
                    {course.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription>{course.duration}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Fee:</span>
                    <span className="text-primary-700">₹{course.fee.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => viewCourseContent(course)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Content
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openEditCourseDialog(course)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => confirmDeleteCourse(course)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add/Edit Course Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Course' : 'Add New Course'}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Update the course details below' 
                : 'Fill in the details to create a new course'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-y-auto pr-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Name</FormLabel>
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
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 3 Months" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Fee (₹)</FormLabel>
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
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => {
                  const [modules, setModules] = useState<{id: string; name: string; subItems: string[]}[]>(() => {
                    try {
                      return field.value ? JSON.parse(field.value) : [];
                    } catch (e) {
                      return [];
                    }
                  });
                  const [newModuleName, setNewModuleName] = useState("");
                  const [newSubItem, setNewSubItem] = useState("");
                  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
                  
                  const addModule = () => {
                    if (newModuleName.trim()) {
                      const newModule = {
                        id: Date.now().toString(),
                        name: newModuleName,
                        subItems: []
                      };
                      const updatedModules = [...modules, newModule];
                      setModules(updatedModules);
                      field.onChange(JSON.stringify(updatedModules));
                      setNewModuleName("");
                      setEditingModuleId(newModule.id);
                    }
                  };
                  
                  const addSubItem = (moduleId: string) => {
                    if (newSubItem.trim()) {
                      const updatedModules = modules.map(module => {
                        if (module.id === moduleId) {
                          return {
                            ...module,
                            subItems: [...module.subItems, newSubItem]
                          };
                        }
                        return module;
                      });
                      setModules(updatedModules);
                      field.onChange(JSON.stringify(updatedModules));
                      setNewSubItem("");
                    }
                  };
                  
                  const removeModule = (moduleId: string) => {
                    const updatedModules = modules.filter(module => module.id !== moduleId);
                    setModules(updatedModules);
                    field.onChange(JSON.stringify(updatedModules));
                    if (editingModuleId === moduleId) {
                      setEditingModuleId(null);
                    }
                  };
                  
                  const removeSubItem = (moduleId: string, index: number) => {
                    const updatedModules = modules.map(module => {
                      if (module.id === moduleId) {
                        const updatedSubItems = [...module.subItems];
                        updatedSubItems.splice(index, 1);
                        return {
                          ...module,
                          subItems: updatedSubItems
                        };
                      }
                      return module;
                    });
                    setModules(updatedModules);
                    field.onChange(JSON.stringify(updatedModules));
                  };
                  
                  return (
                    <FormItem>
                      <FormLabel>Course Modules</FormLabel>
                      <FormControl>
                        <div className="space-y-4 border rounded-md p-4">
                          <div className="space-y-2">
                            <Label htmlFor="module-name">Add New Module</Label>
                            <div className="flex space-x-2">
                              <Input
                                id="module-name"
                                placeholder="Enter module name"
                                value={newModuleName}
                                onChange={(e) => setNewModuleName(e.target.value)}
                              />
                              <Button 
                                type="button" 
                                onClick={addModule}
                                className="shrink-0"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-4 mt-4 max-h-[250px] overflow-y-auto pr-1">
                            {modules.length === 0 ? (
                              <div className="text-center p-4 border border-dashed rounded-md text-gray-500">
                                No modules added yet. Add your first module above.
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {modules.map((module) => (
                                  <div key={module.id} className="border rounded-md p-3">
                                    <div className="flex justify-between items-center mb-2">
                                      <h4 className="font-medium">{module.name}</h4>
                                      <div className="flex space-x-1">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setEditingModuleId(editingModuleId === module.id ? null : module.id)}
                                        >
                                          {editingModuleId === module.id ? (
                                            <X className="h-4 w-4" />
                                          ) : (
                                            <Pencil className="h-4 w-4" />
                                          )}
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                          onClick={() => removeModule(module.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    {editingModuleId === module.id && (
                                      <div className="space-y-2 mt-2 mb-3">
                                        <div className="flex space-x-2">
                                          <Input
                                            placeholder="Add sub-item"
                                            value={newSubItem}
                                            onChange={(e) => setNewSubItem(e.target.value)}
                                            className="flex-1"
                                          />
                                          <Button 
                                            type="button" 
                                            onClick={() => addSubItem(module.id)}
                                            size="sm"
                                          >
                                            Add
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {module.subItems.length > 0 && (
                                      <div className="pl-4 border-l space-y-1 mt-2">
                                        {module.subItems.map((item, index) => (
                                          <div key={index} className="flex justify-between text-sm py-1">
                                            <span>• {item}</span>
                                            {editingModuleId === module.id && (
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 text-red-500"
                                                onClick={() => removeSubItem(module.id, index)}
                                              >
                                                <X className="h-3 w-3" />
                                              </Button>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Create modules and sub-items for your course. These will be used in proposals.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Make this course available for enrollment
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
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
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {isEditMode ? 'Update Course' : 'Create Course'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* View Course Content Dialog */}
      <Dialog open={isViewContentOpen} onOpenChange={setIsViewContentOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{viewingCourse?.name} - Course Content</DialogTitle>
            <DialogDescription>
              Detailed curriculum and modules
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 flex-1 overflow-y-auto">
            {viewingCourse?.content ? (
              <div className="space-y-6">
                {(() => {
                  try {
                    const modules = JSON.parse(viewingCourse.content);
                    return modules.length > 0 ? (
                      modules.map((module: any, i: number) => (
                        <div key={i} className="border rounded-lg p-4">
                          <h3 className="text-lg font-medium mb-2">{module.name}</h3>
                          {module.subItems && module.subItems.length > 0 ? (
                            <ul className="pl-5 space-y-1">
                              {module.subItems.map((item: string, j: number) => (
                                <li key={j} className="text-gray-700 list-disc">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 italic">No sub-items</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-5">No modules defined</p>
                    );
                  } catch (e) {
                    // Fallback for courses with old content format
                    return viewingCourse.content.split('\n').map((line, i) => (
                      <div key={i} className="border-b pb-2">
                        <p className="text-gray-800 whitespace-pre-wrap">{line}</p>
                      </div>
                    ));
                  }
                })()}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-10">No course content available</p>
            )}
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsViewContentOpen(false)}
            >
              Close
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the course "{courseToDelete?.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCourseMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (courseToDelete) {
                  deleteCourseMutation.mutate(courseToDelete.id);
                }
              }}
              disabled={deleteCourseMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteCourseMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Course'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default CourseManagement;
