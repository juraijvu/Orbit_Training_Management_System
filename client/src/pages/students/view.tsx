import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { format } from "date-fns";
import { Loader2, ArrowLeft, Printer, FileText, Edit, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function StudentDetailPage() {
  const [match, params] = useRoute('/students/view/:id');
  const id = params?.id;
  const [_, navigate] = useLocation();
  
  // Fetch student details
  const {
    data: student,
    isLoading: studentLoading,
    error: studentError,
  } = useQuery({
    queryKey: [`/api/students/${id}`],
  });
  
  // Fetch student's registration courses
  const {
    data: courses = [],
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery({
    queryKey: [`/api/registrations/${id}/courses`],
    enabled: !!id,
  });
  
  // Fetch student's invoices
  const {
    data: invoices = [],
    isLoading: invoicesLoading,
    error: invoicesError,
  } = useQuery({
    queryKey: [`/api/students/${id}/invoices`],
    enabled: !!id,
  });
  
  if (studentLoading || coursesLoading || invoicesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (studentError || !student) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error Loading Student</h1>
        <p className="mb-4">There was an error loading the student details.</p>
        <Button onClick={() => navigate("/students")}>Back to Students</Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          className="mr-2"
          onClick={() => navigate("/students")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Students
        </Button>
        
        <div className="ml-auto space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/students/edit/${id}`)}
          >
            <Edit className="h-4 w-4 mr-2" /> Edit Student
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/students/print/${id}`)}
          >
            <Printer className="h-4 w-4 mr-2" /> Print Registration
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p className="text-lg font-medium">{student.firstName} {student.lastName}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Registration Number</h3>
              <p>{student.registrationNumber || "Not Assigned"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
              <p>{student.email}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
              <p>{student.phoneNo}</p>
            </div>
            
            {student.alternativeNo && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Alternative Number</h3>
                <p>{student.alternativeNo}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Date of Birth</h3>
              <p>{format(new Date(student.dateOfBirth), "PPP")}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Nationality</h3>
              <p>{student.nationality}</p>
            </div>
            
            {student.education && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Education</h3>
                <p>{student.education}</p>
              </div>
            )}
            
            {student.companyOrUniversityName && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Company/University</h3>
                <p>{student.companyOrUniversityName}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Registration Date</h3>
              <p>{format(new Date(student.createdAt), "PPP")}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Class Type</h3>
              <Badge variant="outline" className="mt-1">
                {student.classType ? student.classType.charAt(0).toUpperCase() + student.classType.slice(1) : "N/A"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Student Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="courses">
              <TabsList className="mb-4">
                <TabsTrigger value="courses">Registered Courses</TabsTrigger>
                <TabsTrigger value="invoices">Invoice History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="courses">
                {courses.length === 0 ? (
                  <div className="p-4 text-center border rounded-lg">
                    <p className="text-muted-foreground">No courses registered</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Price (AED)</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>Net Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courses.map((course: any) => {
                          const discountAmount = (course.price * course.discount) / 100;
                          const netPrice = course.price - discountAmount;
                          
                          return (
                            <TableRow key={course.id}>
                              <TableCell className="font-medium">{course.courseName}</TableCell>
                              <TableCell>{parseFloat(course.price).toFixed(2)}</TableCell>
                              <TableCell>{course.discount}% ({discountAmount.toFixed(2)} AED)</TableCell>
                              <TableCell>{netPrice.toFixed(2)} AED</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="invoices">
                {invoices.length === 0 ? (
                  <div className="p-4 text-center border rounded-lg">
                    <p className="text-muted-foreground">No invoice history</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Payment Mode</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice: any) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                            <TableCell>{format(new Date(invoice.paymentDate), "PPP")}</TableCell>
                            <TableCell>{parseFloat(invoice.amount).toFixed(2)} AED</TableCell>
                            <TableCell>{invoice.paymentMode}</TableCell>
                            <TableCell>
                              <Badge variant={invoice.status === "paid" ? "outline" : "destructive"} 
                                     className={invoice.status === "paid" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                                {invoice.status === "paid" ? "Paid" : "Pending"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/invoices/${invoice.id}`)}
                              >
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">View Invoice</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}