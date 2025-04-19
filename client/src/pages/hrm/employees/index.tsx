import { FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  FileText,
  Printer,
  MoreHorizontal,
  PlusCircle,
  Mail,
  Pencil as Edit,
  Trash2 as Trash,
  ArrowDownUp,
  Eye,
} from 'lucide-react';

interface Employee {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: 'Active' | 'On Leave' | 'Terminated' | 'Inactive';
  joiningDate: string;
  visaExpiry?: string;
  leavingDate?: string;
}

interface EmployeeManagementProps {
  showAddDialog?: boolean;
}

const EmployeeManagement: FC<EmployeeManagementProps> = ({ showAddDialog = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewType, setViewType] = useState<'list' | 'card'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock Data
  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ['/api/hrm/employees'],
    queryFn: async () => {
      // Mocked data for development
      return [
        {
          id: 1,
          employeeId: 'EMP-001',
          name: 'Ahmed Al Mansouri',
          email: 'ahmed@orbitinstitute.ae',
          phone: '+971 55 123 4567',
          department: 'Training',
          position: 'Senior Trainer',
          status: 'Active',
          joiningDate: '2023-05-15',
          visaExpiry: '2025-05-15',
        },
        {
          id: 2,
          employeeId: 'EMP-002',
          name: 'Fatima Ali',
          email: 'fatima@orbitinstitute.ae',
          phone: '+971 55 234 5678',
          department: 'Sales',
          position: 'Sales Manager',
          status: 'Active',
          joiningDate: '2023-06-01',
          visaExpiry: '2025-06-01',
        },
        {
          id: 3,
          employeeId: 'EMP-003',
          name: 'Mohammed Rahman',
          email: 'mohammed@orbitinstitute.ae',
          phone: '+971 55 345 6789',
          department: 'Marketing',
          position: 'Digital Marketing Specialist',
          status: 'On Leave',
          joiningDate: '2023-07-15',
          visaExpiry: '2025-07-15',
        },
        {
          id: 4,
          employeeId: 'EMP-004',
          name: 'Sara Al Jaber',
          email: 'sara@orbitinstitute.ae',
          phone: '+971 55 456 7890',
          department: 'Administration',
          position: 'Office Manager',
          status: 'Active',
          joiningDate: '2023-08-01',
          visaExpiry: '2025-08-01',
        },
        {
          id: 5,
          employeeId: 'EMP-005',
          name: 'Rahul Patel',
          email: 'rahul@orbitinstitute.ae',
          phone: '+971 55 567 8901',
          department: 'IT',
          position: 'IT Support Specialist',
          status: 'Active',
          joiningDate: '2023-09-15',
          visaExpiry: '2025-09-15',
        },
        {
          id: 6,
          employeeId: 'EMP-006',
          name: 'Aisha Khan',
          email: 'aisha@orbitinstitute.ae',
          phone: '+971 55 678 9012',
          department: 'Training',
          position: 'Trainer',
          status: 'Active',
          joiningDate: '2023-10-01',
          visaExpiry: '2025-02-15',
        },
        {
          id: 7,
          employeeId: 'EMP-007',
          name: 'John Smith',
          email: 'john@orbitinstitute.ae',
          phone: '+971 55 789 0123',
          department: 'Finance',
          position: 'Accountant',
          status: 'Active',
          joiningDate: '2023-11-15',
          visaExpiry: '2025-11-15',
        },
        {
          id: 8,
          employeeId: 'EMP-008',
          name: 'Priya Singh',
          email: 'priya@orbitinstitute.ae',
          phone: '+971 55 890 1234',
          department: 'HR',
          position: 'HR Manager',
          status: 'On Leave',
          joiningDate: '2023-12-01',
          visaExpiry: '2025-12-01',
        },
        {
          id: 9,
          employeeId: 'EMP-009',
          name: 'Ali Hassan',
          email: 'ali@orbitinstitute.ae',
          phone: '+971 55 901 2345',
          department: 'Sales',
          position: 'Sales Representative',
          status: 'Inactive',
          joiningDate: '2024-01-15',
          visaExpiry: '2025-01-15',
          leavingDate: '2024-03-15',
        },
        {
          id: 10,
          employeeId: 'EMP-010',
          name: 'Layla Ahmed',
          email: 'layla@orbitinstitute.ae',
          phone: '+971 55 012 3456',
          department: 'Training',
          position: 'Assistant Trainer',
          status: 'Active',
          joiningDate: '2024-02-01',
          visaExpiry: '2025-02-01',
        },
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set up state for employee form dialogs
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  
  // Open dialog when component mounts if showAddDialog is true
  useEffect(() => {
    if (showAddDialog) {
      setIsAddEmployeeOpen(true);
    }
  }, [showAddDialog]);
  
  // Derive departments from employees data
  const departments = employees ? Array.from(new Set(employees.map(e => e.department))).sort() : [];

  // Filter employees based on search and filters
  const filteredEmployees = employees?.filter(employee => {
    const matchesSearch = searchQuery === '' || 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = filteredEmployees ? Math.ceil(filteredEmployees.length / itemsPerPage) : 0;
  const paginatedEmployees = filteredEmployees?.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Get appropriate badge for employee status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{status}</Badge>;
      case 'On Leave':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">{status}</Badge>;
      case 'Terminated':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{status}</Badge>;
      case 'Inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground">
            Manage employee information, documentation, and status
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/hrm">
              <Users className="mr-2 h-4 w-4" />
              HR Dashboard
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                <span>Export to Excel</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                <span>Export to PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="mr-2 h-4 w-4" />
                <span>Print List</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Enter employee details to add a new staff member to the system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name*</Label>
                  <Input id="name" placeholder="Full name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID*</Label>
                  <Input id="employeeId" placeholder="EMP-XXX" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email*</Label>
                  <Input id="email" type="email" placeholder="email@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone*</Label>
                  <Input id="phone" placeholder="+971 5X XXX XXXX" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department*</Label>
                  <Select>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position*</Label>
                  <Input id="position" placeholder="Job title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joiningDate">Joining Date*</Label>
                  <Input id="joiningDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status*</Label>
                  <Select defaultValue="Active">
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visaExpiry">Visa Expiry Date</Label>
                  <Input id="visaExpiry" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leavingDate">Leaving Date (if applicable)</Label>
                  <Input id="leavingDate" type="date" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddEmployeeOpen(false)}>
                  Add Employee
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 md:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search employees..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select 
                value={departmentFilter} 
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1 border rounded-md">
                <Button 
                  variant={viewType === 'list' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewType('list')}
                  className="rounded-r-none"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewType === 'card' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewType('card')}
                  className="rounded-l-none"
                >
                  <Users className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '-' : filteredEmployees?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <Users className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '-' : 
                    filteredEmployees?.filter(e => e.status === 'Active').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-amber-100 p-3">
                <Users className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '-' : 
                    filteredEmployees?.filter(e => e.status === 'On Leave').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <Users className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Visa Expiring Soon</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '-' : 
                    filteredEmployees?.filter(e => {
                      if (!e.visaExpiry) return false;
                      const expiry = new Date(e.visaExpiry);
                      const today = new Date();
                      const diffTime = expiry.getTime() - today.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays <= 90 && diffDays > 0;
                    }).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Employees</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="onLeave">On Leave</TabsTrigger>
          <TabsTrigger value="visaExpiringSoon">Visa Expiring Soon</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Employees list/grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p>Loading employees...</p>
        </div>
      ) : filteredEmployees?.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No employees found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </CardContent>
        </Card>
      ) : viewType === 'list' ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees?.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.employeeId}</TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/hrm/employees/${employee.id}`} className="hover:underline">
                        {employee.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{employee.email}</div>
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{formatDate(employee.joiningDate)}</TableCell>
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/hrm/employees/${employee.id}`}>
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/hrm/employees/${employee.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Employee</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Send Email</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete Employee</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedEmployees?.map((employee) => (
            <Card key={employee.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">{employee.name}</CardTitle>
                <CardDescription>
                  {employee.position}<br/>
                  {employee.department}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-sm text-muted-foreground mb-2">
                  <p>{employee.email}</p>
                  <p>{employee.phone}</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">ID: </span>
                    {employee.employeeId}
                  </div>
                  <div>
                    {getStatusBadge(employee.status)}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/hrm/employees/${employee.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/hrm/employees/${employee.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(filteredEmployees?.length || 0) > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
              {' '}to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredEmployees?.length || 0)}
              </span>
              {' '}of{' '}
              <span className="font-medium">{filteredEmployees?.length}</span> results
            </div>
            <div>
              <Pagination>
                <PaginationContent>
                  {currentPage === 1 ? (
                    <PaginationPrevious className="cursor-not-allowed opacity-50" />
                  ) : (
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    />
                  )}
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  {currentPage === totalPages ? (
                    <PaginationNext className="cursor-not-allowed opacity-50" />
                  ) : (
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    />
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;