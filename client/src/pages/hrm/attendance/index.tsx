import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  Calendar,
  Clock,
  Filter,
  Search,
  Plus,
  MoreHorizontal,
  FileDown,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';

// Types
interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'leave';
  notes?: string;
}

// Status Badge component
const StatusBadge = ({ status }: { status: AttendanceRecord['status'] }) => {
  const statusConfig = {
    present: { color: 'bg-green-100 text-green-800', label: 'Present' },
    absent: { color: 'bg-red-100 text-red-800', label: 'Absent' },
    late: { color: 'bg-amber-100 text-amber-800', label: 'Late' },
    'half-day': { color: 'bg-blue-100 text-blue-800', label: 'Half Day' },
    leave: { color: 'bg-purple-100 text-purple-800', label: 'Leave' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={`${config.color} border-0`}>
      {config.label}
    </Badge>
  );
};

// Mark Attendance Dialog Component
const MarkAttendanceDialog = ({ 
  isOpen, 
  setIsOpen 
}: { 
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [department, setDepartment] = useState<string>('all');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Attendance Marked",
      description: "Attendance has been recorded successfully",
    });
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogDescription>
            Record attendance for employees on a specific date
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <DatePicker
                  date={date}
                  setDate={setDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="administration">Administration</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-3">Employees</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Example employee rows */}
                {[
                  { id: 1, name: 'Aisha Khan', department: 'Training', position: 'Training Specialist' },
                  { id: 2, name: 'Mohammed Rahman', department: 'Marketing', position: 'Digital Marketing Expert' },
                  { id: 3, name: 'Sara Al Jaber', department: 'Administration', position: 'Administrative Assistant' },
                  { id: 4, name: 'Rahul Patel', department: 'IT', position: 'Full Stack Developer' },
                  { id: 5, name: 'Fatima Ali', department: 'Sales', position: 'Course Advisor' },
                ].map(employee => (
                  <div key={employee.id} className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.position} • {employee.department}</p>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <Select defaultValue="present">
                        <SelectTrigger className="w-[110px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="half-day">Half Day</SelectItem>
                          <SelectItem value="leave">Leave</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="time" placeholder="In" className="w-20" defaultValue="09:00" />
                        <Input type="time" placeholder="Out" className="w-20" defaultValue="17:00" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" placeholder="Any additional notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">
              Save Attendance
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main component
const AttendanceManagement: React.FC<{ showAddDialog?: boolean }> = ({ showAddDialog = false }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateString, setSelectedDateString] = useState<string>(new Date().toISOString().split('T')[0]);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isMarkAttendanceOpen, setIsMarkAttendanceOpen] = useState<boolean>(showAddDialog);
  
  // Example attendance data
  const attendanceData: AttendanceRecord[] = [
    { id: 1, employeeId: 1, employeeName: 'Aisha Khan', department: 'Training', date: '2025-04-19', checkIn: '08:55', checkOut: '17:15', status: 'present' },
    { id: 2, employeeId: 2, employeeName: 'Mohammed Rahman', department: 'Marketing', date: '2025-04-19', checkIn: '09:15', checkOut: '17:30', status: 'late' },
    { id: 3, employeeId: 3, employeeName: 'Sara Al Jaber', department: 'Administration', date: '2025-04-19', checkIn: '', checkOut: '', status: 'absent' },
    { id: 4, employeeId: 4, employeeName: 'Rahul Patel', department: 'IT', date: '2025-04-19', checkIn: '09:00', checkOut: '13:00', status: 'half-day' },
    { id: 5, employeeId: 5, employeeName: 'Fatima Ali', department: 'Sales', date: '2025-04-19', checkIn: '', checkOut: '', status: 'leave', notes: 'Annual leave approved' },
  ];
  
  // Filter attendance records
  const filteredAttendance = attendanceData.filter(record => {
    const matchesSearch = 
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      record.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || record.department.toLowerCase() === departmentFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Calculate attendance statistics
  const totalEmployees = attendanceData.length;
  const presentCount = attendanceData.filter(record => record.status === 'present').length;
  const lateCount = attendanceData.filter(record => record.status === 'late').length;
  const absentCount = attendanceData.filter(record => record.status === 'absent').length;
  const onLeaveCount = attendanceData.filter(record => record.status === 'leave').length;

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      setSelectedDateString(date.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">
            Track and manage employee attendance records
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/hrm">
              <span className="mr-2">Back to Dashboard</span>
            </Link>
          </Button>
          <Button onClick={() => setIsMarkAttendanceOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="py-3">
            <CardDescription>Date</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{formatDate(selectedDateString)}</CardTitle>
              <DatePicker
                date={currentDate}
                setDate={handleDateChange}
                align="end"
                trigger={<Button size="icon" variant="ghost"><Calendar className="h-4 w-4" /></Button>}
              />
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardDescription>Total Employees</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{totalEmployees}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardDescription>Present</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-green-600">{presentCount}</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardDescription>Absent</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-red-600">{absentCount}</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardDescription>Late / On Leave</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-amber-600">{lateCount} / {onLeaveCount}</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 md:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
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
                  <SelectItem value="administration">Administration</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
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
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="half-day">Half Day</SelectItem>
                  <SelectItem value="leave">Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader className="py-4">
          <div className="flex justify-between items-center">
            <CardTitle>Attendance Records</CardTitle>
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell>{record.department}</TableCell>
                    <TableCell>
                      {record.checkIn ? (
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          {record.checkIn}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {record.checkOut ? (
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          {record.checkOut}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={record.status} />
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {record.notes || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit Record</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>View Employee</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No attendance records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <MarkAttendanceDialog 
        isOpen={isMarkAttendanceOpen} 
        setIsOpen={setIsMarkAttendanceOpen}
      />
    </div>
  );
};

export default AttendanceManagement;