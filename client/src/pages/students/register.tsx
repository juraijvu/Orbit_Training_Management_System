import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Trash2, Printer } from "lucide-react";

// Form validation schema
const registerFormSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phoneNo: z.string().min(6, "Phone number is required"),
  alternativeNo: z.string().optional(),
  dateOfBirth: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date"
  }),
  passportNo: z.string().optional(),
  uidNo: z.string().optional(),
  emiratesIdNo: z.string().optional(),
  nationality: z.string().min(2, "Nationality is required"),
  education: z.string().optional(),
  country: z.string().optional(),
  companyOrUniversityName: z.string().optional(),
  classType: z.string({
    required_error: "Please select a class type"
  }),
  courses: z.array(
    z.object({
      courseId: z.number({
        required_error: "Please select a course"
      }),
      price: z.number().min(0, "Price must be a positive number"),
      discount: z.number().min(0, "Discount must be positive").max(20, "Maximum discount is 20%")
    })
  ).min(1, "At least one course must be selected"),
  signatureData: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterStudent() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalVat, setTotalVat] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  
  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
    throwOnError: false
  });
  
  // Form setup
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNo: "",
      alternativeNo: "",
      dateOfBirth: "",
      passportNo: "",
      uidNo: "",
      emiratesIdNo: "",
      nationality: "",
      education: "",
      country: "",
      companyOrUniversityName: "",
      classType: "",
      courses: [
        {
          courseId: 0,
          price: 0,
          discount: 0
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "courses"
  });
  
  // Create registration mutation
  const createRegistrationMutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      const res = await apiRequest("POST", "/api/registrations", {
        studentData: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNo: data.phoneNo,
          alternativeNo: data.alternativeNo || null,
          dateOfBirth: data.dateOfBirth,
          passportNo: data.passportNo || null,
          uidNo: data.uidNo || null,
          emiratesIdNo: data.emiratesIdNo || null,
          nationality: data.nationality,
          education: data.education || null,
          country: data.country || null,
          companyOrUniversityName: data.companyOrUniversityName || null,
          classType: data.classType,
        },
        courses: data.courses
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registration successful",
        description: `Student registered with ID: ${data.student.registrationNumber}`,
      });
      
      // Navigate to the print view
      navigate(`/students/print/${data.student.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred while registering the student",
        variant: "destructive",
      });
    }
  });
  
  // Calculate totals when courses or class type changes
  useEffect(() => {
    const selectedClassType = form.watch("classType");
    const selectedCourses = form.watch("courses");
    
    let price = 0;
    let discount = 0;
    
    selectedCourses.forEach((courseEntry, index) => {
      if (courseEntry.courseId) {
        const course = courses.find((c: any) => c.id === courseEntry.courseId);
        
        if (course) {
          let coursePrice = 0;
          
          // Set price based on class type
          switch (selectedClassType) {
            case "online":
              coursePrice = parseFloat(course.onlineRate) || parseFloat(course.fee) || 0;
              break;
            case "offline":
              coursePrice = parseFloat(course.offlineRate) || parseFloat(course.fee) || 0;
              break;
            case "private":
              coursePrice = parseFloat(course.privateRate) || parseFloat(course.fee) || 0;
              break;
            case "batch":
              coursePrice = parseFloat(course.batchRate) || parseFloat(course.fee) || 0;
              break;
            default:
              coursePrice = parseFloat(course.fee) || 0;
          }
          
          // Make sure price is a valid number
          if (isNaN(coursePrice)) {
            coursePrice = 0;
          }
          
          // Log for debugging
          console.log('Course price calculation:', {
            courseId: courseEntry.courseId,
            courseName: course.name,
            classType: selectedClassType,
            baseFee: course.fee,
            onlineRate: course.onlineRate,
            offlineRate: course.offlineRate,
            privateRate: course.privateRate,
            batchRate: course.batchRate,
            calculatedPrice: coursePrice
          });
          
          // Update price in form data
          form.setValue(`courses.${index}.price`, coursePrice);
          
          price += coursePrice;
          discount += (coursePrice * (courseEntry.discount / 100));
        }
      }
    });
    
    const discountedPrice = price - discount;
    const vat = discountedPrice * 0.05; // 5% VAT
    
    setTotalPrice(price);
    setTotalDiscount(discount);
    setTotalVat(vat);
    setGrandTotal(discountedPrice + vat);
  }, [form.watch("courses"), form.watch("classType"), courses, form]);
  
  // Submit handler
  const onSubmit = (data: RegisterFormValues) => {
    createRegistrationMutation.mutate(data);
  };
  
  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Student Registration</CardTitle>
          <CardDescription>
            Register a new student and generate a registration form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name*</FormLabel>
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
                        <FormLabel>Email*</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phoneNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="alternativeNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alternative Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth*</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="passportNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passport No</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="uidNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UID No</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="emiratesIdNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emirates ID No</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="companyOrUniversityName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company/University</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="classType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Type*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Class Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="batch">Batch</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Course Selection</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ courseId: 0, price: 0, discount: 0 })}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Course
                  </Button>
                </div>
                
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 border rounded-lg">
                    <FormField
                      control={form.control}
                      name={`courses.${index}.courseId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course*</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a course" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {courses.map((course: any) => (
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
                      name={`courses.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (AED)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value || 0}
                              readOnly
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-end gap-2">
                      <FormField
                        control={form.control}
                        name={`courses.${index}.discount`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Discount (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="20"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => remove(index)}
                          className="mb-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Invoicing Details</h3>
                
                <div className="flex flex-col space-y-2 max-w-md ml-auto">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Course Price:</span>
                    <span>{totalPrice.toFixed(2)} AED</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Total Discount:</span>
                    <span>{totalDiscount.toFixed(2)} AED</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Total VAT (5%):</span>
                    <span>{totalVat.toFixed(2)} AED</span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold">Grand Total:</span>
                    <span className="font-bold">{grandTotal.toFixed(2)} AED</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/students")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createRegistrationMutation.isPending}
                >
                  {createRegistrationMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      Submit & Print
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}