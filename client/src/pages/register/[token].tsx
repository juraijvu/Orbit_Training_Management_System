import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SignaturePad } from "@/components/ui/signature-pad";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, AlertTriangle, CheckCircle } from "lucide-react";

// Define the registration schema
const publicRegistrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNo: z.string().min(7, "Phone number must be at least 7 digits"),
  alternativeNo: z.string().optional(),
  dateOfBirth: z.string(),
  nationality: z.string().min(2, "Nationality is required"),
  education: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  companyOrUniversityName: z.string().optional(),
  passportNo: z.string().optional(),
  emiratesIdNo: z.string().optional(),
  emirates: z.string().optional(),
  classType: z.enum(["online", "offline", "private", "batch"]),
  paymentMethod: z.enum(["cash", "card", "tabby", "tamara"]),
  signatureData: z.string().min(1, "Signature is required"),
  signatureDate: z.date(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
});

// Create type for form values
type PublicRegistrationFormValues = z.infer<typeof publicRegistrationSchema>;

export default function PublicRegistration() {
  const [match, params] = useRoute('/register/:token');
  const token = params?.token;
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [finalPrice, setFinalPrice] = useState<number>(0);

  // Form setup
  const form = useForm<PublicRegistrationFormValues>({
    resolver: zodResolver(publicRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNo: "",
      alternativeNo: "",
      dateOfBirth: "",
      nationality: "",
      education: "",
      address: "",
      country: "",
      companyOrUniversityName: "",
      passportNo: "",
      emiratesIdNo: "",
      emirates: "",
      classType: "offline",
      paymentMethod: "cash",
      signatureData: "",
      signatureDate: new Date(),
      termsAccepted: false
    }
  });

  // Fetch registration details using the token
  const { data: registrationData, isLoading, error: fetchError } = useQuery({
    queryKey: [`/api/register/${token}`],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/register/${token}`);
        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.expired) {
            setExpired(true);
            throw new Error("Registration link has expired");
          }
          throw new Error(errorData.message || "Invalid registration link");
        }
        return await response.json();
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    retry: false,
    enabled: !!token,
  });

  // Registration submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: PublicRegistrationFormValues) => {
      const response = await apiRequest("POST", `/api/register/${token}/submit`, data);
      return response.json();
    },
    onSuccess: (data) => {
      // If payment URL is provided, redirect to it
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        // Otherwise, redirect to success page
        window.location.href = "/register/success";
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set course and discount information when data is loaded
  useEffect(() => {
    if (registrationData) {
      setLoading(false);
      setDiscount(registrationData.discountPercentage);
      setCourse(registrationData.course);

      if (registrationData.course) {
        // Default to offline rate or fee
        const basePrice = parseFloat(registrationData.course.offlineRate || registrationData.course.fee);
        setPrice(basePrice);
        
        // Calculate final price after discount
        const discountAmount = basePrice * (registrationData.discountPercentage / 100);
        setFinalPrice(basePrice - discountAmount);
      }
    }
  }, [registrationData]);

  // Update price when class type changes
  const handleClassTypeChange = (value: string) => {
    if (!course) return;
    
    let newPrice: number;
    switch (value) {
      case "online":
        newPrice = parseFloat(course.onlineRate || course.fee);
        break;
      case "offline":
        newPrice = parseFloat(course.offlineRate || course.fee);
        break;
      case "private":
        newPrice = parseFloat(course.privateRate || course.fee);
        break;
      case "batch":
        newPrice = parseFloat(course.batchRate || course.fee);
        break;
      default:
        newPrice = parseFloat(course.fee);
    }
    
    setPrice(newPrice);
    const discountAmount = newPrice * (discount / 100);
    setFinalPrice(newPrice - discountAmount);
    
    // Update form value
    form.setValue("classType", value as any);
  };

  const onSubmit = (data: PublicRegistrationFormValues) => {
    submitMutation.mutate(data);
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading registration details...</p>
        </div>
      </div>
    );
  }

  if (error || fetchError) {
    return (
      <div className="container max-w-2xl py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "An error occurred while loading registration details. Please try again or contact the administrator."}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button variant="default" onClick={() => window.location.href = "/"}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="container max-w-2xl py-10">
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Registration Link Expired</AlertTitle>
          <AlertDescription>
            This registration link has expired. Please contact Orbit Institute for a new registration link.
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button variant="default" onClick={() => window.location.href = "/"}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 px-2 sm:py-8 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl">Orbit Institute Registration</CardTitle>
            <CardDescription className="mt-2">
              {course ? `Register for ${course.name}` : "Complete your registration form"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-3 sm:px-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 md:space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-base sm:text-lg font-medium">Personal Information</h3>
                  <Separator className="my-3" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your first name" />
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
                          <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your last name" />
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
                          <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="your.email@example.com" />
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
                          <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+971 XX XXX XXXX" />
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
                          <FormLabel>Alternative Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+971 XX XXX XXXX" />
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
                          <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
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
                          <FormLabel>Nationality <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Your nationality" />
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
                            <Input {...field} placeholder="Your highest education" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Identification */}
                <div>
                  <h3 className="text-base sm:text-lg font-medium">Identification</h3>
                  <Separator className="my-3" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <FormField
                      control={form.control}
                      name="passportNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passport Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Your passport number" />
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
                          <FormLabel>Emirates ID Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Your Emirates ID number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="emirates"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emirate</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Emirate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                              <SelectItem value="Dubai">Dubai</SelectItem>
                              <SelectItem value="Sharjah">Sharjah</SelectItem>
                              <SelectItem value="Ajman">Ajman</SelectItem>
                              <SelectItem value="Umm Al Quwain">Umm Al Quwain</SelectItem>
                              <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
                              <SelectItem value="Fujairah">Fujairah</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Address Information */}
                <div>
                  <h3 className="text-base sm:text-lg font-medium">Address Information</h3>
                  <Separator className="my-3" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="col-span-full">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Your full address" />
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
                            <Input {...field} placeholder="Your country of residence" />
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
                          <FormLabel>Company/University Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="If applicable" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Course Details */}
                {course && (
                  <div>
                    <h3 className="text-base sm:text-lg font-medium">Course Details</h3>
                    <Separator className="my-3" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div className="space-y-2">
                        <Label>Course Name</Label>
                        <div className="p-2 border rounded-md bg-muted/50">
                          {course.name}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <div className="p-2 border rounded-md bg-muted/50">
                          {course.duration}
                        </div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="classType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class Type <span className="text-red-500">*</span></FormLabel>
                            <Select 
                              onValueChange={(value) => handleClassTypeChange(value)} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select class type" />
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
                      
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Method <span className="text-red-500">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="tabby">Tabby</SelectItem>
                                <SelectItem value="tamara">Tamara</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Price Details */}
                    <div className="mt-3 sm:mt-4 border rounded-md p-3 sm:p-4 bg-muted/30">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm sm:text-base">
                          <span>Original Price:</span>
                          <span>AED {price.toFixed(2)}</span>
                        </div>
                        
                        {discount > 0 && (
                          <div className="flex justify-between text-green-600 text-sm sm:text-base">
                            <span>Discount ({discount}%):</span>
                            <span>- AED {(price * (discount / 100)).toFixed(2)}</span>
                          </div>
                        )}
                        
                        <Separator className="my-2" />
                        
                        <div className="flex justify-between font-bold text-sm sm:text-base">
                          <span>Final Price:</span>
                          <span>AED {finalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Terms and Signature */}
                <div>
                  <h3 className="text-base sm:text-lg font-medium">Terms and Signature</h3>
                  <Separator className="my-3" />
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-muted/30 p-3 sm:p-4 rounded-md text-xs sm:text-sm space-y-1 sm:space-y-2">
                      <p className="font-medium">Orbit Institute Dubai - Terms and Conditions</p>
                      <p>1. Registration is considered complete only after payment of fees.</p>
                      <p>2. Course fees are non-refundable and non-transferable.</p>
                      <p>3. Orbit Institute reserves the right to reschedule or cancel classes if necessary.</p>
                      <p>4. Students must maintain a minimum attendance of 80% to be eligible for certification.</p>
                      <p>5. Student information may be used for administrative and marketing purposes.</p>
                      <p>6. Students are responsible for any property damage caused by them in the institute premises.</p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I have read and agree to the terms and conditions <span className="text-red-500">*</span>
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="signatureData"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Signature <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <SignaturePad
                              value={field.value}
                              onChange={field.onChange}
                              className="h-40 w-full border border-input rounded-md"
                            />
                          </FormControl>
                          <FormDescription>
                            Please sign above using your mouse or touch screen
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex justify-center sm:justify-end mt-4">
                  <Button 
                    type="submit" 
                    disabled={submitMutation.isPending}
                    className="w-full sm:w-auto sm:min-w-[150px]"
                    size="lg"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : "Submit Registration"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center text-center text-xs sm:text-sm text-muted-foreground px-3 py-4 sm:py-6">
            <p>For any assistance, please contact Orbit Institute at +971 4 885 2477</p>
            <p>© {new Date().getFullYear()} Orbit Institute UAE. All rights reserved.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}