import { FC, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  PlusCircle, 
  Search, 
  Filter, 
  MoreHorizontal,
  Download,
  Printer,
  Mail,
  FileText,
  Edit,
  Trash2
} from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joiningDate: string;
  status: 'Active' | 'On Leave' | 'Terminated' | 'Inactive';
  employeeId: string;
  visaStatus?: string;
  visaExpiry?: string;
}

const EmployeeManagement: FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewType, setViewType] = useState<'list' | 'card'>('list');
  
  // Fetch employees data
  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ['/api/hrm/employees'],
    queryFn: async () => {
      // Mock data - will be replaced with actual API call
      return [
        {
          id: 1,
          name: 'Ahmed Abdullah',
          email: 'ahmed.abdullah@orbitedu.ae',
          phone: '+971 50 123 4567',
          department: 'Training',
          position: 'Lead Trainer',
          joiningDate: '2023-03-15',
          status: 'Active',
          employeeId: 'EMP001',
          visaStatus: 'Active',
          visaExpiry: '2026-08-15'
        },
        {
          id: 2,
          name: 'Sara Al Jaber',
          email: 'sara.aljaber@orbitedu.ae',
          phone: '+971 55 987 6543',
          department: 'Administration',
          position: 'Administrative Assistant',
          joiningDate: '2025-03-10',
          status: 'Active',
          employeeId: 'EMP002',
          visaStatus: 'Active',
          visaExpiry: '2026-09-22'
        },
        {
          id: 3,
          name: 'Mohammed Rahman',
          email: 'mohammed.rahman@orbitedu.ae',
          phone: '+971 52 456 7890',
          department: 'Marketing',
          position: 'Digital Marketing Expert',
          joiningDate: '2025-03-15',
          status: 'Active',
          employeeId: 'EMP003',
          visaStatus: 'Active',
          visaExpiry: '2027-01-30'
        },
        {
          id: 4,
          name: 'Priya Kumar',
          email: 'priya.kumar@orbitedu.ae',
          phone: '+971 54 321 6547',
          department: 'Operations',
          position: 'Operations Manager',
          joiningDate: '2024-06-01',
          status: 'On Leave',
          employeeId: 'EMP004',
          visaStatus: 'Processing',
          visaExpiry: '2025-11-30'
        },
        {
          id: 5,
          name: 'Aisha Khan',
          email: 'aisha.khan@orbitedu.ae',
          phone: '+971 56 789 1234',
          department: 'Training',
          position: 'Training Specialist',
          joiningDate: '2025-04-01',
          status: 'Active',
          employeeId: 'EMP005',
          visaStatus: 'Active',
          visaExpiry: '2026-11-15'
        },
        {
          id: 6,
          name: 'John Williams',
          email: 'john.williams@orbitedu.ae',
          phone: '+971 50 222 3333',
          department: 'IT',
          position: 'IT Support Specialist',
          joiningDate: '2024-09-15',
          status: 'On Leave',
          employeeId: 'EMP006',
          visaStatus: 'Active',
          visaExpiry: '2026-02-28'
        },
        {
          id: 7,
          name: 'Fatima Ali',
          email: 'fatima.ali@orbitedu.ae',
          phone: '+971 55 444 5555',
          department: 'Sales',
          position: 'Course Advisor',
          joiningDate: '2025-03-01',
          status: 'Active',
          employeeId: 'EMP007',
          visaStatus: 'Active',
          visaExpiry: '2026-10-05'
        },
        {
          id: 8,
          name: 'Rahul Patel',
          email: 'rahul.patel@orbitedu.ae',
          phone: '+971 52 666 7777',
          department: 'IT',
          position: 'Full Stack Developer',
          joiningDate: '2025-03-05',
          status: 'Active',
          employeeId: 'EMP008',
          visaStatus: 'Active',
          visaExpiry: '2026-12-18'
        },
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const itemsPerPage = 6;
  
  // Filter the employees based on search query and filters
  const filteredEmployees = employees?.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Paginate the results
  const paginatedEmployees = filteredEmployees?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate the total number of pages
  const totalPages = filteredEmployees ? Math.ceil(filteredEmployees.length / itemsPerPage) : 0;

  // Get unique departments for filter
  const departments = employees ? 
    Array.from(new Set(employees.map(employee => employee.department))) : [];

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AE', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'On Leave':
        return <Badge className="bg-amber-100 text-amber-800">On Leave</Badge>;
      case 'Terminated':
        return <Badge className="bg-red-100 text-red-800">Terminated</Badge>;
      case 'Inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <MainLayout>
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
            <Button asChild>
              <Link href="/hrm/employees/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Employee
              </Link>
            </Button>
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
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
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
            <CardFooter className="border-t bg-muted/50 p-4">
              <div className="flex w-full items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {paginatedEmployees?.length || 0} of {filteredEmployees?.length || 0} employees
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        isActive={currentPage > 1}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          onClick={() => setCurrentPage(index + 1)}
                          isActive={currentPage === index + 1}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        isActive={currentPage < totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedEmployees?.map((employee) => (
              <Card key={employee.id} className="overflow-hidden">
                <Link href={`/hrm/employees/${employee.id}`}>
                  <CardHeader className="pb-2 bg-muted">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-base">{employee.name}</CardTitle>
                        <CardDescription>{employee.position}</CardDescription>
                      </div>
                      {getStatusBadge(employee.status)}
                    </div>
                  </CardHeader>
                </Link>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Employee ID</span>
                      <span className="text-sm font-medium">{employee.employeeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Department</span>
                      <span className="text-sm font-medium">{employee.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Joined</span>
                      <span className="text-sm font-medium">{formatDate(employee.joiningDate)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-4 border-t">
                  <div className="flex w-full justify-between">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/hrm/employees/${employee.id}`}>
                        View Profile
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete Employee</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardFooter>
              </Card>
            ))}
            
            {/* Show pagination below the card layout */}
            <div className="col-span-full mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      isActive={currentPage > 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        onClick={() => setCurrentPage(index + 1)}
                        isActive={currentPage === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      isActive={currentPage < totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default EmployeeManagement;