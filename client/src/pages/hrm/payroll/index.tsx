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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  Calendar,
  DollarSign, 
  Download, 
  Eye, 
  FileText, 
  Filter, 
  Mail, 
  MoreHorizontal, 
  PlusCircle, 
  Printer, 
  Search, 
  Send
} from 'lucide-react';

// Chart imports for payroll summary and reports
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface PayrollRecord {
  id: number;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  month: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'Paid' | 'Pending' | 'Processing' | 'Failed';
  paymentDate?: string;
  paymentMethod?: string;
}

interface PayrollSummary {
  totalPaid: number;
  pendingAmount: number;
  employeeCount: number;
  averageSalary: number;
  departmentDistribution: {
    department: string;
    amount: number;
    count: number;
  }[];
  monthlyTrend: {
    month: string;
    amount: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A28DFF', '#FF6B6B'];

interface PayrollManagementProps {
  showAddDialog?: boolean;
}

const PayrollManagement: FC<PayrollManagementProps> = ({ showAddDialog = false }) => {
  // State variables for filtering and pagination
  const [selectedMonth, setSelectedMonth] = useState<string>('April 2025');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'transactions' | 'summary'>('transactions');
  const [isProcessPayrollOpen, setIsProcessPayrollOpen] = useState(false);
  
  // Open dialog when component mounts if showAddDialog is true
  useEffect(() => {
    if (showAddDialog) {
      setIsProcessPayrollOpen(true);
    }
  }, [showAddDialog]);
  
  // Fetch payroll records
  const { data: payrollRecords, isLoading: recordsLoading } = useQuery<PayrollRecord[]>({
    queryKey: ['/api/hrm/payroll/records', selectedMonth],
    queryFn: async () => {
      // Mock data - will be replaced with actual API call
      return [
        {
          id: 1,
          employeeId: 'EMP001',
          employeeName: 'Ahmed Abdullah',
          department: 'Training',
          position: 'Lead Trainer',
          month: 'April 2025',
          baseSalary: 12000,
          allowances: 3000,
          deductions: 1500,
          netSalary: 13500,
          status: 'Paid',
          paymentDate: '2025-04-01',
          paymentMethod: 'Bank Transfer'
        },
        {
          id: 2,
          employeeId: 'EMP002',
          employeeName: 'Sara Al Jaber',
          department: 'Administration',
          position: 'Administrative Assistant',
          month: 'April 2025',
          baseSalary: 8000,
          allowances: 1000,
          deductions: 800,
          netSalary: 8200,
          status: 'Paid',
          paymentDate: '2025-04-01',
          paymentMethod: 'Bank Transfer'
        },
        {
          id: 3,
          employeeId: 'EMP003',
          employeeName: 'Mohammed Rahman',
          department: 'Marketing',
          position: 'Digital Marketing Expert',
          month: 'April 2025',
          baseSalary: 10000,
          allowances: 2000,
          deductions: 1200,
          netSalary: 10800,
          status: 'Paid',
          paymentDate: '2025-04-01',
          paymentMethod: 'Bank Transfer'
        },
        {
          id: 4,
          employeeId: 'EMP004',
          employeeName: 'Priya Kumar',
          department: 'Operations',
          position: 'Operations Manager',
          month: 'April 2025',
          baseSalary: 15000,
          allowances: 3500,
          deductions: 1800,
          netSalary: 16700,
          status: 'Paid',
          paymentDate: '2025-04-01',
          paymentMethod: 'Bank Transfer'
        },
        {
          id: 5,
          employeeId: 'EMP005',
          employeeName: 'Aisha Khan',
          department: 'Training',
          position: 'Training Specialist',
          month: 'April 2025',
          baseSalary: 9000,
          allowances: 1500,
          deductions: 1000,
          netSalary: 9500,
          status: 'Paid',
          paymentDate: '2025-04-01',
          paymentMethod: 'Bank Transfer'
        },
        {
          id: 6,
          employeeId: 'EMP006',
          employeeName: 'John Williams',
          department: 'IT',
          position: 'IT Support Specialist',
          month: 'April 2025',
          baseSalary: 11000,
          allowances: 2000,
          deductions: 1300,
          netSalary: 11700,
          status: 'Pending',
          paymentMethod: 'Bank Transfer'
        },
        {
          id: 7,
          employeeId: 'EMP007',
          employeeName: 'Fatima Ali',
          department: 'Sales',
          position: 'Course Advisor',
          month: 'April 2025',
          baseSalary: 9500,
          allowances: 2500,
          deductions: 1200,
          netSalary: 10800,
          status: 'Processing',
          paymentMethod: 'Bank Transfer'
        },
        {
          id: 8,
          employeeId: 'EMP008',
          employeeName: 'Rahul Patel',
          department: 'IT',
          position: 'Full Stack Developer',
          month: 'April 2025',
          baseSalary: 14000,
          allowances: 2800,
          deductions: 1700,
          netSalary: 15100,
          status: 'Paid',
          paymentDate: '2025-04-01',
          paymentMethod: 'Bank Transfer'
        },
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch payroll summary
  const { data: payrollSummary, isLoading: summaryLoading } = useQuery<PayrollSummary>({
    queryKey: ['/api/hrm/payroll/summary', selectedMonth],
    queryFn: async () => {
      // Mock data - will be replaced with actual API call
      return {
        totalPaid: 96300,
        pendingAmount: 22500,
        employeeCount: 8,
        averageSalary: 12037.5,
        departmentDistribution: [
          { department: 'Training', amount: 23000, count: 2 },
          { department: 'Administration', amount: 8200, count: 1 },
          { department: 'Marketing', amount: 10800, count: 1 },
          { department: 'Operations', amount: 16700, count: 1 },
          { department: 'IT', amount: 26800, count: 2 },
          { department: 'Sales', amount: 10800, count: 1 },
        ],
        monthlyTrend: [
          { month: 'Jan 2025', amount: 92000 },
          { month: 'Feb 2025', amount: 94000 },
          { month: 'Mar 2025', amount: 95500 },
          { month: 'Apr 2025', amount: 96300 },
        ]
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const itemsPerPage = 6;
  const months = [
    'April 2025', 
    'March 2025', 
    'February 2025', 
    'January 2025', 
    'December 2024', 
    'November 2024'
  ];
  
  // Filter the payroll records based on search query and filters
  const filteredRecords = payrollRecords?.filter(record => {
    const matchesSearch = 
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      record.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || record.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Get departments for filter
  const departments = payrollRecords ? 
    Array.from(new Set(payrollRecords.map(record => record.department))) : [];

  // Paginate the results
  const paginatedRecords = filteredRecords?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate the total number of pages
  const totalPages = filteredRecords ? Math.ceil(filteredRecords.length / itemsPerPage) : 0;

  // Format currency function
  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString()}`;
  };

  // Format date function
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
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
      case 'Paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'Pending':
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case 'Processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'Failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Prepare chart data
  const prepareDepartmentChartData = () => {
    return payrollSummary?.departmentDistribution.map(item => ({
      name: item.department,
      value: item.amount
    })) || [];
  };

  return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Payroll Management</h1>
            <p className="text-muted-foreground">
              View, process, and manage employee payroll information
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/hrm">
                <Calendar className="mr-2 h-4 w-4" />
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
                  <span>Print Payroll</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isProcessPayrollOpen} onOpenChange={setIsProcessPayrollOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Process Payroll
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Process Payroll</DialogTitle>
                  <DialogDescription>
                    Create or update payroll records for the selected month.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="payrollMonth">Month</Label>
                    <Select defaultValue={selectedMonth}>
                      <SelectTrigger id="payrollMonth">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Payment Date</Label>
                    <Input type="date" id="paymentDate" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="department">
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select defaultValue="Bank Transfer">
                      <SelectTrigger id="paymentMethod">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input id="notes" placeholder="Additional notes for this payroll" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsProcessPayrollOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Process Payroll</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* View mode selector */}
        <div className="flex justify-between items-center mb-6">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'transactions' | 'summary')}>
            <TabsList>
              <TabsTrigger value="transactions">Payroll Transactions</TabsTrigger>
              <TabsTrigger value="summary">Payroll Summary</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Stats and Payroll Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <DollarSign className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Payroll</p>
                  <p className="text-2xl font-bold">
                    {summaryLoading ? '-' : formatCurrency(payrollSummary?.totalPaid || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-amber-100 p-3">
                  <DollarSign className="h-6 w-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Amount</p>
                  <p className="text-2xl font-bold">
                    {summaryLoading ? '-' : formatCurrency(payrollSummary?.pendingAmount || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-100 p-3">
                  <DollarSign className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Salary</p>
                  <p className="text-2xl font-bold">
                    {summaryLoading ? '-' : formatCurrency(payrollSummary?.averageSalary || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-100 p-3">
                  <Calendar className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employees Paid</p>
                  <p className="text-2xl font-bold">
                    {recordsLoading ? '-' : 
                      payrollRecords?.filter(r => r.status === 'Paid').length || 0}
                    <span className="text-sm text-muted-foreground ml-1">
                      / {payrollRecords?.length || 0}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content based on view mode */}
        {viewMode === 'transactions' ? (
          <>
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
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payroll Transactions Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Basic Salary</TableHead>
                      <TableHead>Allowances</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recordsLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10">
                          Loading payroll records...
                        </TableCell>
                      </TableRow>
                    ) : filteredRecords?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10">
                          No payroll records found. Try adjusting your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRecords?.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="font-medium">{record.employeeName}</div>
                            <div className="text-sm text-muted-foreground">{record.employeeId}</div>
                          </TableCell>
                          <TableCell>{record.department}</TableCell>
                          <TableCell>{formatCurrency(record.baseSalary)}</TableCell>
                          <TableCell>{formatCurrency(record.allowances)}</TableCell>
                          <TableCell>{formatCurrency(record.deductions)}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(record.netSalary)}</TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
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
                                  <Link href={`/hrm/payroll/${record.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>View Details</span>
                                  </Link>
                                </DropdownMenuItem>
                                {record.status !== 'Paid' && (
                                  <DropdownMenuItem>
                                    <Send className="mr-2 h-4 w-4" />
                                    <span>Process Payment</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  <span>Send Pay Slip</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="mr-2 h-4 w-4" />
                                  <span>Print Pay Slip</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              {!recordsLoading && filteredRecords && filteredRecords.length > 0 && (
                <CardFooter className="border-t bg-muted/50 p-4">
                  <div className="flex w-full items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {paginatedRecords?.length || 0} of {filteredRecords?.length || 0} records
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
              )}
            </Card>
          </>
        ) : (
          <>
            {/* Payroll Summary Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Payroll Distribution by Department */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Payroll Distribution by Department</CardTitle>
                  <CardDescription>
                    Salary distribution across different departments
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-80">
                    {summaryLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <p>Loading chart data...</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareDepartmentChartData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {prepareDepartmentChartData().map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Payroll Trend */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Monthly Payroll Trend</CardTitle>
                  <CardDescription>
                    Payroll expenses over recent months
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-80">
                    {summaryLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <p>Loading chart data...</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={payrollSummary?.monthlyTrend}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend />
                          <Bar dataKey="amount" name="Total Payroll" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department-wise Payroll Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Department-wise Payroll Breakdown</CardTitle>
                <CardDescription>
                  Detailed breakdown of payroll expenses by department
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Number of Employees</TableHead>
                      <TableHead>Total Payroll</TableHead>
                      <TableHead>Average Salary</TableHead>
                      <TableHead className="text-right">% of Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaryLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          Loading department data...
                        </TableCell>
                      </TableRow>
                    ) : (
                      payrollSummary?.departmentDistribution.map((dept, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{dept.department}</TableCell>
                          <TableCell>{dept.count}</TableCell>
                          <TableCell>{formatCurrency(dept.amount)}</TableCell>
                          <TableCell>
                            {formatCurrency(Math.round(dept.amount / dept.count))}
                          </TableCell>
                          <TableCell className="text-right">
                            {((dept.amount / (payrollSummary?.totalPaid || 1)) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
  );
};

export default PayrollManagement;