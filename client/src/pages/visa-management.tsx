import { FC, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Search, Filter, AlertCircle, Calendar, UserCheck, FileText, ArrowUpDown, MessageSquare, CheckCircle2, ClipboardCheck, FileCheck } from 'lucide-react';
import { format, parseISO, differenceInDays, isAfter, isBefore, addMonths } from 'date-fns';

// Form schema
const visaEmployeeSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  position: z.string().min(1, 'Position is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  passportNumber: z.string().min(1, 'Passport number is required'),
  visaType: z.string().min(1, 'Visa type is required'),
  visaStatus: z.string().min(1, 'Visa status is required'),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
});

type VisaEmployeeData = z.infer<typeof visaEmployeeSchema>;

// Interfaces
interface Employee {
  id: number;
  name: string;
  position: string;
  nationality: string;
  passportNumber: string;
  visaType: 'Employment' | 'Visit' | 'Dependent' | 'Student' | 'Partner';
  visaStatus: VisaStatus;
  expiryDate: string;
  images: {
    passport?: string;
    visa?: string;
    emirates_id?: string;
    medical?: string;
    insurance?: string;
  };
  alerts?: string[];
  progress?: number;
  statusHistory: VisaStatusUpdate[];
}

type VisaStatus = 
  | 'Active' 
  | 'Expired' 
  | 'Processing' 
  | 'Applied' 
  | 'Approved'
  | 'Medical Required'
  | 'Stamping Required'
  | 'Emirates ID Processing'
  | 'Completed';

interface VisaStatusUpdate {
  status: VisaStatus;
  date: string;
  notes?: string;
  updatedBy: string;
  documents?: {
    type: string;
    filename: string;
    uploadDate: string;
  }[];
}

const VisaManagementPage: FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addEmployeeOpen, setAddEmployeeOpen] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeDetailsOpen, setEmployeeDetailsOpen] = useState<boolean>(false);
  const [updateStatusOpen, setUpdateStatusOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const form = useForm<VisaEmployeeData>({
    resolver: zodResolver(visaEmployeeSchema),
    defaultValues: {
      fullName: '',
      position: '',
      nationality: '',
      passportNumber: '',
      visaType: '',
      visaStatus: '',
      expiryDate: '',
      notes: '',
    },
  });

  // Add employee mutation
  const addEmployeeMutation = useMutation({
    mutationFn: (data: VisaEmployeeData) => apiRequest('POST', '/api/visa-management/employees', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/visa-management/employees'] });
      toast({
        title: 'Success',
        description: 'Employee has been added to visa management successfully.',
      });
      form.reset();
      setAddEmployeeOpen(false);
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      console.error('Error adding employee:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add employee. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: VisaEmployeeData) => {
    console.log('Adding employee to visa management:', data);
    setIsSubmitting(true);
    addEmployeeMutation.mutate(data);
  };

  // Fetch employee visa data
  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ['/api/visa-management/employees'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/visa-management/employees', {
          credentials: 'include'
        });
        if (response.ok) {
          const apiData = await response.json();
          console.log('Fetched visa employees from API:', apiData);
          
          return apiData.map((emp: any) => ({
            id: emp.id,
            name: emp.name || emp.fullName,
            position: emp.position,
            nationality: emp.nationality,
            passportNumber: emp.passportNumber,
            visaType: emp.visaType,
            visaStatus: emp.visaStatus,
            expiryDate: emp.expiryDate || '2026-08-15',
            images: emp.images || {},
            alerts: emp.alerts || [],
            progress: emp.progress || (emp.visaStatus === 'Active' ? 100 : 50),
            statusHistory: emp.statusHistory || []
          }));
        }
      } catch (error) {
        console.error('Error fetching from API:', error);
      }
      
      return [];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Filter employees based on search query and status filter
  const filteredEmployees = employees?.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.nationality.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      employee.visaStatus.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Get counts of visa statuses for the dashboard
  const getStatusCounts = () => {
    if (!employees) return { active: 0, processing: 0, expired: 0, expiring: 0, total: 0 };
    
    const now = new Date();
    
    return {
      active: employees.filter(e => e.visaStatus === 'Active').length,
      processing: employees.filter(e => 
        e.visaStatus !== 'Active' && 
        e.visaStatus !== 'Expired'
      ).length,
      expired: employees.filter(e => e.visaStatus === 'Expired').length,
      expiring: employees.filter(e => {
        if (e.visaStatus === 'Expired' || !e.expiryDate) return false;
        const expiryDate = new Date(e.expiryDate);
        const daysUntilExpiry = differenceInDays(expiryDate, now);
        return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
      }).length,
      total: employees.length
    };
  };

  const getStatusBadgeColor = (status: VisaStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Applied':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-purple-100 text-purple-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEmployeeDetailsOpen(true);
  };

  const handleUpdateStatus = (employee: Employee) => {
    setSelectedEmployee(employee);
    setUpdateStatusOpen(true);
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Visa Management</h1>
          <p className="text-muted-foreground">Track and manage employee visas and immigration status</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={addEmployeeOpen} onOpenChange={setAddEmployeeOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Enter employee details and visa information. Required fields are marked with *.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Employee's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position *</FormLabel>
                          <FormControl>
                            <Input placeholder="Job title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nationality" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="passportNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passport Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Passport number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="visaType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visa Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select visa type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Employment">Employment</SelectItem>
                              <SelectItem value="Visit">Visit</SelectItem>
                              <SelectItem value="Dependent">Dependent</SelectItem>
                              <SelectItem value="Student">Student</SelectItem>
                              <SelectItem value="Partner">Partner</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="visaStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visa Status *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Processing">Processing</SelectItem>
                              <SelectItem value="Applied">Applied</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Input placeholder="Additional information" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setAddEmployeeOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Adding...' : 'Add Employee'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.total}</div>
            <p className="text-xs text-muted-foreground">
              with visa records
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Visas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statusCounts.active}</div>
            <p className="text-xs text-muted-foreground">
              valid employee visas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statusCounts.processing}</div>
            <p className="text-xs text-muted-foreground">
              visas in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{statusCounts.expiring}</div>
            <p className="text-xs text-muted-foreground">
              &lt; 90 days remaining
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statusCounts.expired}</div>
            <p className="text-xs text-muted-foreground">
              require immediate action
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Visa Records</CardTitle>
          <CardDescription>
            Manage and track visa status for all employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">Loading visa records...</div>
          ) : !filteredEmployees || filteredEmployees.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No employees found.</p>
              <Button 
                className="mt-2" 
                onClick={() => setAddEmployeeOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add First Employee
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>Visa Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {employee.passportNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.nationality}</TableCell>
                    <TableCell>{employee.visaType}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(employee.visaStatus)}>
                        {employee.visaStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {employee.expiryDate}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={employee.progress || 0} className="w-[60px]" />
                        <span className="text-sm">{employee.progress || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(employee)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(employee)}
                        >
                          Update
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VisaManagementPage;