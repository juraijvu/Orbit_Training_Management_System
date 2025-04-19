import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Search, Filter, AlertCircle, Calendar, UserCheck, FileText, ArrowUpDown, MessageSquare, CheckCircle2, ClipboardCheck, FileCheck } from 'lucide-react';
import { format, parseISO, differenceInDays, isAfter, isBefore, addMonths } from 'date-fns';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addEmployeeOpen, setAddEmployeeOpen] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeDetailsOpen, setEmployeeDetailsOpen] = useState<boolean>(false);
  const [updateStatusOpen, setUpdateStatusOpen] = useState<boolean>(false);

  // Fetch employee visa data - this will be replaced with actual API call
  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ['/api/visa-management/employees'],
    queryFn: async () => {
      // Mock data for now
      return [
        {
          id: 1,
          name: 'Ahmed Abdullah',
          position: 'Lead Trainer',
          nationality: 'Egyptian',
          passportNumber: 'A1234567',
          visaType: 'Employment',
          visaStatus: 'Active',
          expiryDate: '2026-08-15',
          images: {
            passport: 'passport_1.jpg',
            visa: 'visa_1.jpg',
            emirates_id: 'eid_1.jpg',
            medical: 'medical_1.pdf',
            insurance: 'insurance_1.pdf'
          },
          progress: 100,
          statusHistory: [
            {
              status: 'Applied',
              date: '2023-01-10',
              notes: 'Application submitted to immigration',
              updatedBy: 'Sara Ali',
              documents: [
                {
                  type: 'Application Form',
                  filename: 'application_form_1.pdf',
                  uploadDate: '2023-01-10'
                }
              ]
            },
            {
              status: 'Approved',
              date: '2023-01-25',
              notes: 'Visa approved by immigration',
              updatedBy: 'Sara Ali'
            },
            {
              status: 'Medical Required',
              date: '2023-02-05',
              notes: 'Medical test required for visa stamping',
              updatedBy: 'Sara Ali'
            },
            {
              status: 'Stamping Required',
              date: '2023-02-15',
              notes: 'Medical passed, ready for visa stamping',
              updatedBy: 'Sara Ali',
              documents: [
                {
                  type: 'Medical Certificate',
                  filename: 'medical_certificate_1.pdf',
                  uploadDate: '2023-02-15'
                }
              ]
            },
            {
              status: 'Emirates ID Processing',
              date: '2023-03-01',
              notes: 'Emirates ID application submitted',
              updatedBy: 'Sara Ali'
            },
            {
              status: 'Completed',
              date: '2023-03-20',
              notes: 'Process completed, all documents received',
              updatedBy: 'Sara Ali',
              documents: [
                {
                  type: 'Emirates ID',
                  filename: 'emirates_id_1.jpg',
                  uploadDate: '2023-03-20'
                },
                {
                  type: 'Residence Visa',
                  filename: 'visa_1.jpg',
                  uploadDate: '2023-03-20'
                }
              ]
            },
            {
              status: 'Active',
              date: '2023-03-21',
              notes: 'Visa activated',
              updatedBy: 'System'
            }
          ]
        },
        {
          id: 2,
          name: 'Priya Kumar',
          position: 'Operations Manager',
          nationality: 'Indian',
          passportNumber: 'Z9876543',
          visaType: 'Employment',
          visaStatus: 'Processing',
          expiryDate: '2025-11-30',
          images: {
            passport: 'passport_2.jpg'
          },
          progress: 40,
          statusHistory: [
            {
              status: 'Applied',
              date: '2025-03-15',
              notes: 'Application submitted to immigration',
              updatedBy: 'Sara Ali',
              documents: [
                {
                  type: 'Application Form',
                  filename: 'application_form_2.pdf',
                  uploadDate: '2025-03-15'
                }
              ]
            },
            {
              status: 'Approved',
              date: '2025-03-28',
              notes: 'Visa approved by immigration',
              updatedBy: 'Sara Ali'
            },
            {
              status: 'Processing',
              date: '2025-04-02',
              notes: 'Waiting for medical test appointment',
              updatedBy: 'Sara Ali'
            }
          ]
        },
        {
          id: 3,
          name: 'Mohammed Al Hashimi',
          position: 'Marketing Director',
          nationality: 'Emirati',
          passportNumber: 'U7654321',
          visaType: 'Partner',
          visaStatus: 'Active',
          expiryDate: '2027-05-20',
          images: {
            passport: 'passport_3.jpg',
            emirates_id: 'eid_3.jpg'
          },
          progress: 100,
          statusHistory: [
            {
              status: 'Applied',
              date: '2022-05-15',
              notes: 'Partner visa application submitted',
              updatedBy: 'Sara Ali'
            },
            {
              status: 'Approved',
              date: '2022-05-20',
              notes: 'Partner visa approved',
              updatedBy: 'Sara Ali'
            },
            {
              status: 'Active',
              date: '2022-05-21',
              notes: 'Visa activated',
              updatedBy: 'System'
            }
          ]
        },
        {
          id: 4,
          name: 'Sarah Johnson',
          position: 'Administrative Assistant',
          nationality: 'British',
          passportNumber: 'GBR123456',
          visaType: 'Employment',
          visaStatus: 'Expired',
          expiryDate: '2025-02-10',
          images: {
            passport: 'passport_4.jpg',
            visa: 'visa_4.jpg',
            emirates_id: 'eid_4.jpg'
          },
          alerts: ['Visa expired 2 months ago', 'Renewal process not initiated'],
          progress: 100,
          statusHistory: [
            {
              status: 'Active',
              date: '2023-02-10',
              notes: 'Visa activated',
              updatedBy: 'System'
            },
            {
              status: 'Expired',
              date: '2025-02-10',
              notes: 'Visa expired',
              updatedBy: 'System'
            }
          ]
        },
        {
          id: 5,
          name: 'Fahad Al Mansouri',
          position: 'Finance Manager',
          nationality: 'Saudi',
          passportNumber: 'KSA789012',
          visaType: 'Visit',
          visaStatus: 'Active',
          expiryDate: '2025-05-30',
          images: {
            passport: 'passport_5.jpg',
            visa: 'visa_5.jpg'
          },
          progress: 100,
          statusHistory: [
            {
              status: 'Applied',
              date: '2025-03-01',
              notes: 'Visit visa application submitted',
              updatedBy: 'Sara Ali'
            },
            {
              status: 'Approved',
              date: '2025-03-05',
              notes: 'Visit visa approved',
              updatedBy: 'Sara Ali'
            },
            {
              status: 'Active',
              date: '2025-03-05',
              notes: 'Visa activated',
              updatedBy: 'System'
            }
          ]
        }
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
        if (e.visaStatus !== 'Active') return false;
        const expiryDate = parseISO(e.expiryDate);
        return differenceInDays(expiryDate, now) <= 90 && differenceInDays(expiryDate, now) > 0;
      }).length,
      total: employees.length
    };
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd MMM yyyy');
  };

  // Calculate days until expiry for a visa
  const getDaysUntilExpiry = (expiryDateStr: string) => {
    const now = new Date();
    const expiryDate = parseISO(expiryDateStr);
    
    if (isBefore(expiryDate, now)) {
      return -differenceInDays(now, expiryDate);
    }
    
    return differenceInDays(expiryDate, now);
  };

  // Get appropriate status color badge
  const getStatusBadgeColor = (status: VisaStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      case 'Processing':
      case 'Applied':
      case 'Medical Required':
      case 'Stamping Required':
      case 'Emirates ID Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Approved':
        return 'bg-purple-100 text-purple-800';
      case 'Completed':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get appropriate expiry date status indicator
  const getExpiryStatus = (expiryDateStr: string) => {
    const now = new Date();
    const expiryDate = parseISO(expiryDateStr);
    const daysUntil = getDaysUntilExpiry(expiryDateStr);
    
    if (daysUntil < 0) {
      return {
        label: `Expired ${Math.abs(daysUntil)} days ago`,
        color: 'text-red-600'
      };
    } else if (daysUntil <= 30) {
      return {
        label: `Expires in ${daysUntil} days`,
        color: 'text-red-600'
      };
    } else if (daysUntil <= 90) {
      return {
        label: `Expires in ${daysUntil} days`,
        color: 'text-amber-600'
      };
    } else {
      return {
        label: `Expires in ${daysUntil} days`,
        color: 'text-green-600'
      };
    }
  };

  // View employee details
  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEmployeeDetailsOpen(true);
  };

  // Open the update status dialog
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
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" placeholder="Employee's full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position *</Label>
                      <Input id="position" placeholder="Job title" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality *</Label>
                      <Input id="nationality" placeholder="Nationality" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passportNumber">Passport Number *</Label>
                      <Input id="passportNumber" placeholder="Passport number" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="visaType">Visa Type *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visa type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employment">Employment</SelectItem>
                          <SelectItem value="visit">Visit</SelectItem>
                          <SelectItem value="dependent">Dependent</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visaStatus">Visa Status *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input id="expiryDate" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passport">Passport Copy</Label>
                      <Input id="passport" type="file" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input id="notes" placeholder="Additional information" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddEmployeeOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Employee
                  </Button>
                </DialogFooter>
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Employees</TabsTrigger>
              <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
              <TabsTrigger value="processing">In Processing</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Search employees..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[250px]"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
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
          </div>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">
                        <div className="flex items-center space-x-1">
                          <span>Employee</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Nationality</TableHead>
                      <TableHead>Visa Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">Loading employee data...</TableCell>
                      </TableRow>
                    ) : filteredEmployees && filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => {
                        const expiryStatus = getExpiryStatus(employee.expiryDate);
                        
                        return (
                          <TableRow key={employee.id}>
                            <TableCell className="font-medium">{employee.name}</TableCell>
                            <TableCell>{employee.position}</TableCell>
                            <TableCell>{employee.nationality}</TableCell>
                            <TableCell>{employee.visaType}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeColor(employee.visaStatus)}>
                                {employee.visaStatus}
                              </Badge>
                              {employee.alerts && employee.alerts.length > 0 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <AlertCircle className="h-4 w-4 ml-1 text-red-500 inline" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <ul className="list-disc pl-4">
                                        {employee.alerts.map((alert, idx) => (
                                          <li key={idx}>{alert}</li>
                                        ))}
                                      </ul>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </TableCell>
                            <TableCell className={expiryStatus.color}>
                              {formatDate(employee.expiryDate)}
                              <div className="text-xs">
                                {expiryStatus.label}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={employee.progress || 0} className="h-2 w-20" />
                                <span className="text-xs">{employee.progress || 0}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleViewDetails(employee)}
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleUpdateStatus(employee)}
                                >
                                  <ClipboardCheck className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">No employee records found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredEmployees?.length || 0} of {employees?.length || 0} employees
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="expiring">
            <Card>
              <CardHeader>
                <CardTitle>Visas Expiring Soon</CardTitle>
                <CardDescription>Employees with visas expiring within the next 90 days</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center p-8">Loading employee data...</div>
                ) : employees ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Visa Type</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Days Remaining</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees
                        .filter(e => {
                          if (e.visaStatus !== 'Active') return false;
                          const daysRemaining = getDaysUntilExpiry(e.expiryDate);
                          return daysRemaining > 0 && daysRemaining <= 90;
                        })
                        .sort((a, b) => getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate))
                        .map((employee) => {
                          const daysRemaining = getDaysUntilExpiry(employee.expiryDate);
                          let urgencyClass = 'text-green-600';
                          if (daysRemaining <= 30) urgencyClass = 'text-red-600';
                          else if (daysRemaining <= 60) urgencyClass = 'text-amber-600';
                          
                          return (
                            <TableRow key={employee.id}>
                              <TableCell className="font-medium">{employee.name}</TableCell>
                              <TableCell>{employee.position}</TableCell>
                              <TableCell>{employee.visaType}</TableCell>
                              <TableCell>{formatDate(employee.expiryDate)}</TableCell>
                              <TableCell className={urgencyClass}>
                                {daysRemaining} days
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" size="sm">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Renew Visa
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      {employees.filter(e => {
                        if (e.visaStatus !== 'Active') return false;
                        const daysRemaining = getDaysUntilExpiry(e.expiryDate);
                        return daysRemaining > 0 && daysRemaining <= 90;
                      }).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            No visas expiring within the next 90 days
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-8">No employee data available</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processing">
            <Card>
              <CardHeader>
                <CardTitle>Visas In Processing</CardTitle>
                <CardDescription>Employees with visas currently in the application or renewal process</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center p-8">Loading employee data...</div>
                ) : employees ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Visa Type</TableHead>
                        <TableHead>Current Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees
                        .filter(e => e.visaStatus !== 'Active' && e.visaStatus !== 'Expired')
                        .map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell className="font-medium">{employee.name}</TableCell>
                            <TableCell>{employee.position}</TableCell>
                            <TableCell>{employee.visaType}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeColor(employee.visaStatus)}>
                                {employee.visaStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={employee.progress || 0} className="h-2 w-20" />
                                <span className="text-xs">{employee.progress || 0}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUpdateStatus(employee)}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Update Status
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {employees.filter(e => 
                        e.visaStatus !== 'Active' && e.visaStatus !== 'Expired'
                      ).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            No visas currently in processing
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-8">No employee data available</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expired">
            <Card>
              <CardHeader>
                <CardTitle>Expired Visas</CardTitle>
                <CardDescription>Employees with expired visas requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center p-8">Loading employee data...</div>
                ) : employees ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Visa Type</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Expired For</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees
                        .filter(e => e.visaStatus === 'Expired')
                        .sort((a, b) => getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate))
                        .map((employee) => {
                          const daysExpired = Math.abs(getDaysUntilExpiry(employee.expiryDate));
                          
                          return (
                            <TableRow key={employee.id}>
                              <TableCell className="font-medium">{employee.name}</TableCell>
                              <TableCell>{employee.position}</TableCell>
                              <TableCell>{employee.visaType}</TableCell>
                              <TableCell>{formatDate(employee.expiryDate)}</TableCell>
                              <TableCell className="text-red-600 font-medium">
                                {daysExpired} days
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" size="sm">
                                  <FileCheck className="mr-2 h-4 w-4" />
                                  Initiate Renewal
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      {employees.filter(e => e.visaStatus === 'Expired').length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            No expired visas found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-8">No employee data available</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Employee Details Dialog */}
        {selectedEmployee && (
          <Dialog open={employeeDetailsOpen} onOpenChange={setEmployeeDetailsOpen}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Employee Visa Details</DialogTitle>
                <DialogDescription>
                  Detailed visa information and documents for {selectedEmployee.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Full Name:</span>
                        <span className="font-medium">{selectedEmployee.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Position:</span>
                        <span>{selectedEmployee.position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nationality:</span>
                        <span>{selectedEmployee.nationality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Passport Number:</span>
                        <span>{selectedEmployee.passportNumber}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Visa Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Visa Type:</span>
                        <span>{selectedEmployee.visaType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Status:</span>
                        <Badge className={getStatusBadgeColor(selectedEmployee.visaStatus)}>
                          {selectedEmployee.visaStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expiry Date:</span>
                        <span className={getExpiryStatus(selectedEmployee.expiryDate).color}>
                          {formatDate(selectedEmployee.expiryDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Process Completion:</span>
                        <div className="flex items-center gap-2">
                          <Progress value={selectedEmployee.progress || 0} className="h-2 w-20" />
                          <span className="text-xs">{selectedEmployee.progress || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Documents</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(selectedEmployee.images).map(([key, value]) => (
                      <div key={key} className="bg-muted p-2 rounded-md text-center">
                        <div className="mb-2">
                          <FileText className="h-10 w-10 mx-auto text-primary" />
                        </div>
                        <p className="text-sm font-medium">
                          {key.replace('_', ' ').charAt(0).toUpperCase() + key.replace('_', ' ').slice(1)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{value}</p>
                        <Button variant="ghost" size="sm" className="mt-2">
                          <FileText className="h-3 w-3 mr-1" /> View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Status History</h3>
                  <div className="max-h-60 overflow-y-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Updated By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedEmployee.statusHistory.map((update, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatDate(update.date)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeColor(update.status)}>
                                {update.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{update.notes || 'No notes'}</TableCell>
                            <TableCell>{update.updatedBy}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEmployeeDetailsOpen(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setEmployeeDetailsOpen(false);
                    handleUpdateStatus(selectedEmployee);
                  }}
                >
                  Update Status
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Update Status Dialog */}
        {selectedEmployee && (
          <Dialog open={updateStatusOpen} onOpenChange={setUpdateStatusOpen}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update Visa Status</DialogTitle>
                <DialogDescription>
                  Update the visa status for {selectedEmployee.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="current-status">Current Status</Label>
                  <div className="p-2 bg-muted rounded-md">
                    <Badge className={getStatusBadgeColor(selectedEmployee.visaStatus)}>
                      {selectedEmployee.visaStatus}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-status">New Status *</Label>
                  <Select defaultValue={selectedEmployee.visaStatus.toLowerCase()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="medicalRequired">Medical Required</SelectItem>
                      <SelectItem value="stampingRequired">Stamping Required</SelectItem>
                      <SelectItem value="emiratesIdProcessing">Emirates ID Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statusNotes">Notes</Label>
                  <Input id="statusNotes" placeholder="Add notes about this status change" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statusDate">Date</Label>
                  <Input id="statusDate" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">Attach Document (optional)</Label>
                  <Input id="document" type="file" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUpdateStatusOpen(false)}>
                  Cancel
                </Button>
                <Button>
                  Update Status
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
  );
};

export default VisaManagementPage;