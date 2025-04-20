import React, { useState } from "react";
import { useQuery, useMutation, queryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Loader2, Search, Plus, FileText, Edit, Trash2, ListFilter, Database } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StudentsPage() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  
  // Seed students mutation
  const seedMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/seed/students");
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.seedingSkipped) {
        toast({
          title: "Seeding Skipped",
          description: data.message,
        });
      } else {
        toast({
          title: "Sample Data Created",
          description: `Successfully created ${data.studentsCreated} students with ${data.registrationCoursesCreated} courses and ${data.invoicesCreated} invoices.`,
          variant: "success",
        });
        // Refresh the student list
        queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to seed sample student data",
        variant: "destructive",
      });
    }
  });
  
  // Fetch students
  const { 
    data: students = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["/api/students"],
    throwOnError: false
  });
  
  // Filtering
  const filteredStudents = students.filter((student: any) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      student.firstName?.toLowerCase().includes(searchTerm) ||
      student.lastName?.toLowerCase().includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchTerm) ||
      student.phoneNo?.toLowerCase().includes(searchTerm) ||
      student.registrationNumber?.toLowerCase().includes(searchTerm)
    );
  });
  
  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  
  // Page navigation
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error Loading Students</h1>
        <p className="mb-4">There was an error loading the student list.</p>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Students</CardTitle>
            <CardDescription>
              Manage student registrations and records
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {students.length === 0 && (
              <Button 
                variant="outline" 
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
              >
                {seedMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Seeding...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" /> Add Sample Data
                  </>
                )}
              </Button>
            )}
            <Button onClick={() => navigate("/students/register")}>
              <Plus className="h-4 w-4 mr-2" /> Register New Student
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Class Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentStudents.map((student: any) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.registrationNumber || "-"}</TableCell>
                      <TableCell>{student.firstName} {student.lastName}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phoneNo}</TableCell>
                      <TableCell>
                        {student.classType && (
                          <Badge variant="outline">
                            {student.classType.charAt(0).toUpperCase() + student.classType.slice(1)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <span className="sr-only">Open menu</span>
                              <ListFilter className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/students/view/${student.id}`)}>
                              <FileText className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/students/print/${student.id}`)}>
                              <FileText className="h-4 w-4 mr-2" /> Print Registration
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/students/edit/${student.id}`)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => paginate(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}