import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { SignaturePad } from "@/components/ui/signature-pad";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

const publicRegistrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNo: z.string().min(8, "Phone number must be at least 8 characters"),
  alternativeNo: z.string().optional(),
  dateOfBirth: z.string().refine((date) => {
    try {
      return new Date(date) <= new Date();
    } catch {
      return false;
    }
  }, "Date of birth cannot be in the future"),
  passportNo: z.string().optional(),
  emiratesIdNo: z.string().optional(),
  nationality: z.string().min(2, "Nationality must be at least 2 characters"),
  education: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  companyOrUniversityName: z.string().optional(),
  classType: z.enum(["online", "offline", "private", "batch"]),
  signatureData: z.string().min(1, "Signature is required"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
  paymentMethod: z.enum(["cash", "card", "tabby", "tamara"]),
});

type PublicRegistrationFormValues = z.infer<typeof publicRegistrationSchema>;

export default function PublicRegistration() {
  const { token } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [signatureData, setSignatureData] = useState<string>("");
  
  // Fetch registration link details
  const { data: linkData, isLoading, error } = useQuery({
    queryKey: [`/api/register/${token}`],
    throwOnError: false,
  });
  
  const form = useForm<PublicRegistrationFormValues>({
    resolver: zodResolver(publicRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNo: "",
      alternativeNo: "",
      dateOfBirth: format(new Date(), "yyyy-MM-dd"),
      passportNo: "",
      emiratesIdNo: "",
      nationality: "",
      education: "",
      address: "",
      country: "",
      companyOrUniversityName: "",
      classType: "offline",
      signatureData: "",
      termsAccepted: false,
      paymentMethod: "cash",
    },
  });
  
  // Mutation for submitting the registration
  const registerMutation = useMutation({
    mutationFn: async (data: PublicRegistrationFormValues) => {
      const response = await fetch(`/api/register/${token}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          signatureDate: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit registration");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Successful",
        description: "Your registration has been submitted successfully.",
        variant: "default",
      });
      
      // Redirect to payment page if needed
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        // Otherwise show success and provide link to contact
        setTimeout(() => {
          navigate("/register/success");
        }, 2000);
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
  
  // Handle signature change
  const handleSignatureChange = (data: string) => {
    setSignatureData(data);
    form.setValue("signatureData", data);
  };
  
  const onSubmit = (data: PublicRegistrationFormValues) => {
    registerMutation.mutate(data);
  };
  
  // Check if the registration link is expired
  const isLinkExpired = linkData?.expiryDate ? new Date(linkData.expiryDate) < new Date() : false;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (error || !linkData) {
    return (
      <div className="container py-8 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Invalid Registration Link</CardTitle>
            <CardDescription className="text-center">
              The registration link you are trying to use is invalid or has been expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <AlertTriangle className="h-20 w-20 text-yellow-500" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isLinkExpired) {
    return (
      <div className="container py-8 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Registration Link Expired</CardTitle>
            <CardDescription className="text-center">
              The registration link you are trying to use has expired. Please contact Orbit Institute for assistance.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <AlertTriangle className="h-20 w-20 text-yellow-500" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-8 mx-auto">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center bg-[#1f1566] text-white">
            <CardTitle className="text-xl md:text-2xl">Orbit Institute Registration</CardTitle>
            <CardDescription className="text-gray-200">
              Complete this form to register for your selected course
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Course Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">Selected Course:</p>
                      <p className="font-bold">{linkData.course?.name || "Unknown Course"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Course Fee:</p>
                      <p className="font-bold">
                        {linkData.course?.fee ? `${Number(linkData.course.fee).toLocaleString()} AED` : "Contact for pricing"}
                      </p>
                    </div>
                    
                    {linkData.discountPercentage > 0 && (
                      <div className="col-span-1 md:col-span-2">
                        <p className="text-sm font-medium">Special Discount:</p>
                        <p className="font-bold text-green-600">
                          {linkData.discountPercentage}% Off
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
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
                          <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
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
                          <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
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
                            <Input {...field} />
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
                          <FormLabel>Passport Number</FormLabel>
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
                          <FormLabel>Emirates ID Number</FormLabel>
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
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
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
                          <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
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
                    
                    <div className="col-span-1 md:col-span-2">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Course Selection</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="classType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class Type <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select class type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="offline">Offline (In-Person)</SelectItem>
                                <SelectItem value="online">Online</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                                <SelectItem value="batch">Group Batch</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Select Payment Method <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="cash" id="cash" />
                                <label htmlFor="cash" className="cursor-pointer">Cash (In Person)</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="card" id="card" />
                                <label htmlFor="card" className="cursor-pointer">Credit/Debit Card</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="tabby" id="tabby" />
                                <label htmlFor="tabby" className="cursor-pointer">Tabby (Pay in installments)</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="tamara" id="tamara" />
                                <label htmlFor="tamara" className="cursor-pointer">Tamara (Pay in installments)</label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Signature</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="signatureData"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Digital Signature <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <div className="border rounded-md p-2">
                              <SignaturePad
                                value={signatureData}
                                onChange={handleSignatureChange}
                                width={300}
                                height={150}
                                className="w-full border"
                              />
                              <div className="flex justify-end mt-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSignatureData("");
                                    form.setValue("signatureData", "");
                                  }}
                                >
                                  Clear
                                </Button>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div>
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
                            I accept the <a href="/terms" target="_blank" className="underline">terms and conditions</a> and certify that the information provided is correct and complete. I understand that any misrepresentation of facts will lead to the denial or cancellation of my admission.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-center pt-4">
                  <Button
                    type="submit"
                    className="w-full md:w-auto md:min-w-[200px]"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Submit Registration'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}