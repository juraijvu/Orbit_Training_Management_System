import { FC, useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { 
  FilePlus, 
  Loader2, 
  Building, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Users,
  DollarSign,
  Percent,
  Calendar,
  Upload,
  Image,
  X,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertProposalSchema } from '@shared/schema';
import { z } from 'zod';
import { format } from 'date-fns';

// Define proposal form type
// Custom Zod schema to handle numeric-to-string conversions
// Simplified form schema to avoid validation issues
const proposalFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone is required"),
  courseIds: z.string().optional(),
  totalAmount: z.string().default("0"),
  discount: z.string().default("0"),
  finalAmount: z.string().default("0"),
  coverPage: z.string().optional(),
  content: z.string().optional(),
  status: z.string().default("draft"),
  date: z.string().default(format(new Date(), 'yyyy-MM-dd')),
  
  // Optional fields
  logo: z.any().optional(),
  applyWhiteFilter: z.boolean().default(true),
  presenterName: z.string().optional(),
  presenterTitle: z.string().optional(),
  presenterEmail: z.string().optional(),
  presenterPhone: z.string().optional(),
  courseName: z.string().optional(),
  courseFormat: z.string().optional(),
  trainingDuration: z.string().optional(),
  trainingLocation: z.string().optional(),
  trainerId: z.union([z.number(), z.string().transform(val => val ? parseInt(val) : undefined)]).optional(),
  companyProfile: z.string().optional(),
  companyProfileFile: z.instanceof(File).optional(),
  coverBackgroundColor: z.string().default("#000000"),
  coverTextColor: z.string().default("#ffffff"),
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

// Define the white logo filter CSS
const whiteLogoFilter = "brightness(0) invert(1)";

// Proposal component
const ProposalsPage: FC = () => {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isNewProposalOpen, setIsNewProposalOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [showWhiteFilter, setShowWhiteFilter] = useState<boolean>(true);
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const companyProfileFileRef = useRef<HTMLInputElement>(null);
  
  // Fetch proposals
  const { data: proposals, isLoading } = useQuery({
    queryKey: ['/api/proposals'],
  });
  
  // Fetch courses
  const { data: courses, isLoading: isCoursesLoading } = useQuery({
    queryKey: ['/api/courses'],
  });
  
  // Fetch trainers
  const { data: trainers, isLoading: isTrainersLoading } = useQuery({
    queryKey: ['/api/trainers'],
  });
  
  // New proposal form
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      courseIds: '',
      totalAmount: '0',
      discount: '0',
      finalAmount: '0',
      coverPage: 'Professional Training Proposal',
      content: JSON.stringify([
        { title: 'Introduction', text: 'This proposal outlines the training services offered by Orbit Institute...' },
        { title: 'Training Overview', text: 'Our training program is designed to...' },
        { title: 'Methodology', text: 'We employ interactive and hands-on training methods...' },
        { title: 'Delivery Timeline', text: 'The training will be conducted over...' },
        { title: 'Investment', text: 'The investment for this training program is...' },
      ]),
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'draft',
      applyWhiteFilter: true,
      presenterName: user?.username || '',
      presenterTitle: 'Training Consultant',
      presenterEmail: '',
      presenterPhone: '',
      courseName: '',
      courseFormat: 'In-Person',
      trainingDuration: '5 Days',
      trainingLocation: 'Dubai, UAE',
      trainerId: undefined,
      coverBackgroundColor: '#000000',
      coverTextColor: '#ffffff',
    },
  });
  
  // Create proposal mutation (keeping for button state management)
  const createProposalMutation = useMutation({
    mutationFn: async (data: ProposalFormValues) => {
      const res = await apiRequest('POST', '/api/proposals', data);
      return await res.json();
    },
    onSuccess: () => {
      // This won't be called since we're handling success in onSubmit
    },
    onError: (error) => {
      // This won't be called since we're handling errors in onSubmit
    },
  });
  
  // Handle company profile file upload
  const handleCompanyProfileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file for company profile',
          variant: 'destructive',
        });
        return;
      }
      
      // Store the actual file object
      form.setValue('companyProfileFile', file);
      form.setValue('companyProfile', file.name);
      
      toast({
        title: 'File uploaded',
        description: 'Company profile PDF has been uploaded successfully',
      });
    }
  };
  
  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
      form.setValue('logoUrl', url);
    }
  };

  // Handle form submission
  const onSubmit = async (values: ProposalFormValues) => {
    try {
      console.log("Form submission started");
      console.log("Original form values:", values);
      console.log("Form errors:", form.formState.errors);
      console.log("Form is valid:", form.formState.isValid);
      
      // Check if form is valid
      if (!form.formState.isValid) {
        console.error("Form validation failed:", form.formState.errors);
        
        // Create specific error messages for each invalid field
        const errorFields = Object.entries(form.formState.errors).map(([field, error]) => {
          const fieldNames: Record<string, string> = {
            companyName: "Company Name",
            contactPerson: "Contact Person", 
            email: "Email",
            phone: "Phone",
            courseIds: "Course Selection",
            totalAmount: "Total Amount",
            trainerId: "Trainer Selection"
          };
          return fieldNames[field] || field;
        });
        
        toast({
          title: 'Validation Error',
          description: `Please check: ${errorFields.join(', ')}`,
          variant: 'destructive',
        });
        return;
      }
      
      // Format data before submission
      const formattedValues = {
        companyName: values.companyName || "",
        contactPerson: values.contactPerson || "",
        email: values.email || "",
        phone: values.phone || "",
        courseIds: values.courseIds || "",
        trainerId: values.trainerId || null,
        totalAmount: String(values.totalAmount || 0),
        discount: String(values.discount || 0),
        finalAmount: String(values.finalAmount || 0),
        content: values.content || "{}",
        status: values.status || "draft",
        date: values.date || format(new Date(), 'yyyy-MM-dd'),
        coverPage: values.coverPage || ""
      };
      
      console.log("Submitting proposal with formatted data:", formattedValues);
      
      // Submit the proposal directly using API request
      const res = await apiRequest('POST', '/api/proposals', formattedValues);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create proposal');
      }
      const newProposal = await res.json();
      console.log("Proposal created successfully:", newProposal);
      
      // Invalidate queries and close dialog
      queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });
      setIsNewProposalOpen(false);
      form.reset();
      setLogoUrl("");
      
      toast({
        title: 'Success',
        description: 'Proposal created successfully.',
      });
      
      // If we have a company profile file, upload it separately
      if (values.companyProfileFile && values.companyProfileFile instanceof File) {
        console.log("Uploading company profile file");
        const formData = new FormData();
        formData.append('companyProfileFile', values.companyProfileFile);
        
        try {
          // Upload the file
          const uploadRes = await apiRequest(
            'POST', 
            `/api/proposals/${newProposal.id}/upload-company-profile`, 
            formData
          );
          
          if (!uploadRes.ok) {
            console.warn('Failed to upload company profile file, but proposal was created successfully');
          } else {
            toast({
              title: 'Company Profile Uploaded',
              description: 'The company profile PDF has been uploaded successfully.',
            });
          }
        } catch (uploadError) {
          console.warn('Company profile upload failed:', uploadError);
          // Don't fail the entire operation for file upload issues
        }
      }
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create proposal',
        variant: 'destructive',
      });
    }
  };
  
  // Handle new proposal button click
  const handleNewProposal = () => {
    setIsNewProposalOpen(true);
  };
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading proposals...</span>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Proposals</h1>
          <p className="text-gray-600">Create and manage training proposals for corporate clients</p>
        </div>
        <Button onClick={handleNewProposal}>
          <FilePlus className="mr-2 h-4 w-4" />
          New Proposal
        </Button>
      </div>
      
      {proposals?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setLocation(`/proposals/${proposal.id}`)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{proposal.companyName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500 mb-4">
                  <p><User className="inline h-4 w-4 mr-1" /> {proposal.contactPerson}</p>
                  <p><Calendar className="inline h-4 w-4 mr-1" /> {new Date(proposal.date).toLocaleDateString()}</p>
                  <p><DollarSign className="inline h-4 w-4 mr-1" /> AED {proposal.finalAmount.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    proposal.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    proposal.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                  </span>
                  <Button variant="outline" size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/proposals/${proposal.id}`);
                          }}>
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <FilePlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Proposals Yet</h3>
              <p className="text-gray-500 mb-6">
                You haven't created any proposals yet. Create your first proposal for a corporate client.
              </p>
              <Button onClick={handleNewProposal}>
                <FilePlus className="mr-2 h-4 w-4" />
                Create New Proposal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* New Proposal Dialog */}
      <Dialog open={isNewProposalOpen} onOpenChange={setIsNewProposalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Proposal</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-4">Client Information</h3>
                </div>
                
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
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-4">Proposal Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount (AED)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            value={typeof field.value === 'string' ? parseFloat(field.value) || 0 : field.value}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              field.onChange(String(value)); // Store as string
                              
                              // Calculate final amount
                              const discount = parseFloat(form.getValues('discount') || '0');
                              const finalAmount = value - (value * discount / 100);
                              form.setValue('finalAmount', String(finalAmount)); // Store as string
                            }}
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
                        <FormLabel>Discount (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            value={typeof field.value === 'string' ? parseFloat(field.value) || 0 : field.value}
                            onChange={(e) => {
                              let value = parseFloat(e.target.value) || 0;
                              
                              // Limit discount to 20%
                              if (value > 20) {
                                value = 20;
                                toast({
                                  title: "Discount limited",
                                  description: "Maximum discount allowed is 20%",
                                  variant: "destructive"
                                });
                              }
                              
                              field.onChange(String(value)); // Store as string
                              
                              // Calculate final amount
                              const totalAmount = parseFloat(form.getValues('totalAmount') || '0');
                              const finalAmount = totalAmount - (totalAmount * value / 100);
                              form.setValue('finalAmount', String(finalAmount)); // Store as string
                            }}
                            max={20}
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
                        <FormLabel>Final Amount (AED)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            value={typeof field.value === 'string' ? parseFloat(field.value) || 0 : field.value} 
                            readOnly 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="coverPage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Page Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                

                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Presenter Information */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-4">Presenter Information</h3>
                  <p className="text-sm text-gray-500 mb-4">Enter details of the person presenting this proposal</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="presenterName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Presenter Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="presenterTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title / Position</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="presenterEmail"
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
                      name="presenterPhone"
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
                </div>
                
                {/* Course Details */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-4">Course Details</h3>
                  <p className="text-sm text-gray-500 mb-4">Select courses to include in the proposal</p>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="course-select">Available Courses</Label>
                      {selectedCourses?.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {selectedCourses.length} course(s) selected
                        </span>
                      )}
                    </div>
                    
                    {isCoursesLoading ? (
                      <div className="flex items-center space-x-2 h-10 p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading courses...</span>
                      </div>
                    ) : (
                      <>
                        <Select
                          onValueChange={(value) => {
                            const courseId = parseInt(value);
                            const course = courses?.find(c => c.id === courseId);
                            
                            if (course && !selectedCourses.some(sc => sc.id === courseId)) {
                              // Add course to selection
                              const newCourse = {
                                id: course.id,
                                name: course.name,
                                duration: course.duration,
                                fee: parseFloat(course.fee.toString()),
                                modules: course.content ? (() => {
                                  try {
                                    return JSON.parse(course.content || '[]');
                                  } catch (e) {
                                    // If content is not valid JSON, treat it as a string
                                    console.warn('Course content is not valid JSON', e);
                                    return [{ name: 'Course Content', subItems: [course.content] }];
                                  }
                                })() : []
                              };
                              
                              setSelectedCourses([...selectedCourses, newCourse]);
                              
                              // Update total amount
                              const currentTotal = parseFloat(form.getValues('totalAmount') || '0');
                              const newTotal = currentTotal + newCourse.fee;
                              form.setValue('totalAmount', String(newTotal));
                              
                              // Calculate final amount with discount
                              const discount = parseFloat(form.getValues('discount') || '0');
                              const finalAmount = newTotal - (newTotal * discount / 100);
                              form.setValue('finalAmount', String(finalAmount));
                              
                              // Update courses field in the form
                              const currentCourseIds = form.getValues('courseIds') || '';
                              const courseIds = currentCourseIds ? 
                                currentCourseIds + ',' + courseId : 
                                courseId.toString();
                              form.setValue('courseIds', courseIds);
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a course to add" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courses?.filter(course => course.active).map((course) => (
                              <SelectItem 
                                key={course.id} 
                                value={course.id.toString()}
                                disabled={selectedCourses.some(sc => sc.id === course.id)}
                              >
                                {course.name} - {course.duration} (AED {parseFloat(course.fee.toString()).toLocaleString()})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {selectedCourses.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <Label>Selected Courses</Label>
                            {selectedCourses.map((course, index) => (
                              <div 
                                key={course.id}
                                className="border rounded-md p-3 bg-gray-50 relative"
                              >
                                <div className="flex justify-between">
                                  <div>
                                    <h4 className="font-medium">{course.name}</h4>
                                    <p className="text-sm text-gray-500">{course.duration}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">AED {course.fee.toLocaleString()}</p>
                                    <Button 
                                      type="button"
                                      variant="ghost" 
                                      size="icon"
                                      className="h-6 w-6 absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                      onClick={() => {
                                        // Remove course from selection
                                        const newSelectedCourses = selectedCourses.filter((_, i) => i !== index);
                                        setSelectedCourses(newSelectedCourses);
                                        
                                        // Update total amount
                                        const currentTotal = parseFloat(form.getValues('totalAmount') || '0');
                                        const newTotal = currentTotal - course.fee;
                                        form.setValue('totalAmount', String(newTotal));
                                        
                                        // Calculate final amount with discount
                                        const discount = parseFloat(form.getValues('discount') || '0');
                                        const finalAmount = newTotal - (newTotal * discount / 100);
                                        form.setValue('finalAmount', String(finalAmount));
                                        
                                        // Update courses field in the form
                                        const newCourseIds = newSelectedCourses.map(c => c.id).join(',');
                                        form.setValue('courseIds', newCourseIds);
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                {course.modules && course.modules.length > 0 && (
                                  <div className="mt-2 pt-2 border-t">
                                    <Collapsible>
                                      <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm" className="flex items-center p-0 h-6">
                                          <ChevronRight className="h-4 w-4 mr-1" />
                                          <span className="text-xs">View Modules</span>
                                        </Button>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent>
                                        <ul className="mt-2 list-disc pl-5 space-y-1">
                                          {course.modules.map((module, i) => (
                                            <li key={i} className="text-sm">
                                              <span className="font-medium">{module.name}</span>
                                              {module.subItems && module.subItems.length > 0 && (
                                                <ul className="pl-4 mt-1 list-circle">
                                                  {module.subItems.map((subItem, j) => (
                                                    <li key={j} className="text-xs">{subItem}</li>
                                                  ))}
                                                </ul>
                                              )}
                                            </li>
                                          ))}
                                        </ul>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="courseFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Format</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="In-Person, Online, Hybrid" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="trainingLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Training Location</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="trainerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Trainer</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value); // Store as string
                              }}
                              value={field.value?.toString() || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a trainer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isTrainersLoading ? (
                                  <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    <span className="text-sm">Loading trainers...</span>
                                  </div>
                                ) : (
                                  trainers?.map((trainer) => (
                                    <SelectItem 
                                      key={trainer.id} 
                                      value={trainer.id.toString()}
                                    >
                                      {trainer.fullName} - {trainer.specialization}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Company Logo Upload and Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Company Logo</h4>
                      <p className="text-xs text-gray-500">Upload the client's company logo</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Logo
                      </Button>
                      
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={logoInputRef}
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            const file = files[0];
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target && event.target.result) {
                                setLogoUrl(event.target.result as string);
                                form.setValue('logo', file);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      
                      <FormField
                        control={form.control}
                        name="applyWhiteFilter"
                        render={({ field }) => (
                          <div className="flex items-center">
                            <label className="text-sm font-medium mr-2">Apply White Filter</label>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => {
                                field.onChange(e.target.checked);
                                setShowWhiteFilter(e.target.checked);
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    {logoUrl ? (
                      <div className="flex flex-col">
                        <p className="text-sm font-medium mb-2">Logo Preview:</p>
                        <div 
                          className="border rounded p-4 flex items-center justify-center"
                          style={{ backgroundColor: form.getValues('coverBackgroundColor') || '#000000' }}
                        >
                          <img 
                            src={logoUrl} 
                            alt="Company Logo" 
                            className="max-h-24 max-w-full object-contain"
                            style={{ filter: showWhiteFilter ? whiteLogoFilter : 'none' }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Background color matches your cover page design
                        </p>
                      </div>
                    ) : (
                      <div 
                        className="border rounded p-4 flex items-center justify-center h-32"
                        style={{ backgroundColor: form.getValues('coverBackgroundColor') || '#000000' }}
                      >
                        <div className="text-center" style={{ color: form.getValues('coverTextColor') || '#ffffff' }}>
                          <Image className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-xs">No logo uploaded</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Company Profile (Last Page) */}
                <div className="grid grid-cols-1 gap-6 mt-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-4">Company Profile (Last Page)</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      This content will appear as the last page of the proposal. Enter your company profile information.
                    </p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="companyProfile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Profile (PDF)</FormLabel>
                        <FormControl>
                          <div className="flex flex-col space-y-2">
                            <input
                              type="file"
                              accept=".pdf"
                              ref={companyProfileFileRef}
                              className="hidden"
                              onChange={handleCompanyProfileUpload}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full flex items-center justify-center"
                              onClick={() => companyProfileFileRef.current?.click()}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Company Profile PDF
                            </Button>
                            {form.getValues('companyProfileFile') && (
                              <div className="flex items-center justify-between p-2 border rounded-md mt-2">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2 text-primary" />
                                  <span className="text-sm">{form.getValues('companyProfileFile')?.name || 'Company Profile PDF'}</span>
                                </div>
                                <div className="flex items-center">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500"
                                    onClick={() => {
                                      form.setValue('companyProfile', '');
                                      form.setValue('companyProfileFile', undefined);
                                      if (companyProfileFileRef.current) {
                                        companyProfileFileRef.current.value = '';
                                      }
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload a PDF file for your company profile. This will appear as the last page of your proposal.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewProposalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Proposal'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ProposalsPage;