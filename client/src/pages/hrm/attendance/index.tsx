import { FC, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Clock,
  CalendarCheck,
  CalendarX,
  Users,
  Calendar,
  ArrowUpDown,
  Search,
  Filter,
  Download,
  Plus
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: 'present' | 'absent' | 'late' | 'half-day';
  notes?: string;
}

const HRMAttendance: FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [department, setDepartment] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  // Fetch attendance records
  const { data: attendanceRecords, isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ['/api/hrm/attendance', { startDate, endDate, department, status }],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        {
          id: 1,
          employeeId: 101,
          employeeName: 'Ahmed Al Mansouri',
          department: 'Administration',
          date: '2025-04-19',
          checkIn: '08:45:22',
          checkOut: '17:30:15',
          status: 'present'
        },
        {
          id: 2,
          employeeId: 102,
          employeeName: 'Sara Al Jaber',
          department: 'Administration',
          date: '2025-04-19',
          checkIn: '09:15:43',
          checkOut: '17:45:30',
          status: 'late',
          notes: 'Traffic delay'
        },
        {
          id: 3,
          employeeId: 103,
          employeeName: 'Mohammed Rahman',
          department: 'Marketing',
          date: '2025-04-19',
          checkIn: '08:30:10',
          checkOut: '17:15:22',
          status: 'present'
        },
        {
          id: 4,
          employeeId: 104,
          employeeName: 'Jamal Hassan',
          department: 'Training',
          date: '2025-04-19',
          checkIn: '08:25:05',
          checkOut: null,
          status: 'present'
        },
        {
          id: 5,
          employeeId: 105,
          employeeName: 'Fatima Ali',
          department: 'Sales',
          date: '2025-04-19',
          checkIn: '12:10:25',
          checkOut: '17:20:33',
          status: 'half-day',
          notes: 'Doctor appointment in morning'
        },
        {
          id: 6,
          employeeId: 106,
          employeeName: 'Rahul Patel',
          department: 'IT',
          date: '2025-04-19',
          checkIn: null,
          checkOut: null,
          status: 'absent',
          notes: 'Sick leave'
        }
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Format time for display
  const formatTime = (timeString: string | null) => {
    if (!timeString) return '—';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const meridiem = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes.substring(0, 2)} ${meridiem}`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Filter records based on search query
  const filteredRecords = attendanceRecords?.filter(record => {
    const matchesSearch = 
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = department === 'all' || record.department === department;
    const matchesStatus = status === 'all' || record.status === status;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Calculate attendance statistics
  const getAttendanceStats = () => {
    if (!attendanceRecords) return { present: 0, late: 0, absent: 0, halfDay: 0, total: 0 };
    
    return {
      present: attendanceRecords.filter(r => r.status === 'present').length,
      late: attendanceRecords.filter(r => r.status === 'late').length,
      absent: attendanceRecords.filter(r => r.status === 'absent').length,
      halfDay: attendanceRecords.filter(r => r.status === 'half-day').length,
      total: attendanceRecords.length
    };
  };

  const stats = getAttendanceStats();

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">
            Track and manage employee attendance records
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/hrm/attendance/reports">
              <Download className="mr-2 h-4 w-4" />
              Reports
            </Link>
          </Button>
          <Button asChild>
            <Link href="/hrm/attendance/new">
              <Plus className="mr-2 h-4 w-4" />
              Record Attendance
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-muted-foreground text-sm">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 mb-2">
              <CalendarCheck className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-muted-foreground text-sm">Present</p>
            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 mb-2">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-muted-foreground text-sm">Late</p>
            <p className="text-2xl font-bold text-amber-600">{stats.late}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-2">
              <ArrowUpDown className="h-5 w-5 text-gray-600" />
            </div>
            <p className="text-muted-foreground text-sm">Half Day</p>
            <p className="text-2xl font-bold text-gray-600">{stats.halfDay}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 mb-2">
              <CalendarX className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-muted-foreground text-sm">Absent</p>
            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="daily">Daily View</TabsTrigger>
          <TabsTrigger value="history">Attendance History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-AE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search employees..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:flex gap-2">
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="w-full md:w-[160px]">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full md:w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="half-day">Half Day</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Attendance Table */}
              {isLoading ? (
                <div className="text-center p-6">Loading attendance data...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-3 px-2 font-medium text-muted-foreground">Employee</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Department</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Check In</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Check Out</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Status</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Notes</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords?.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-muted-foreground">
                            No attendance records found for the selected filters
                          </td>
                        </tr>
                      ) : (
                        filteredRecords?.map(record => (
                          <tr key={record.id} className="border-b last:border-0">
                            <td className="py-3 px-2 font-medium">{record.employeeName}</td>
                            <td className="py-3 px-2">{record.department}</td>
                            <td className="py-3 px-2">{record.checkIn ? formatTime(record.checkIn) : '—'}</td>
                            <td className="py-3 px-2">{record.checkOut ? formatTime(record.checkOut) : '—'}</td>
                            <td className="py-3 px-2">
                              <Badge variant={
                                record.status === 'present' ? 'default' :
                                record.status === 'late' ? 'warning' :
                                record.status === 'half-day' ? 'secondary' : 'destructive'
                              }>
                                {record.status === 'half-day' ? 'Half Day' : 
                                  record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-sm text-muted-foreground max-w-xs truncate">
                              {record.notes || '—'}
                            </td>
                            <td className="py-3 px-2 text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/hrm/attendance/edit/${record.id}`}>
                                  Edit
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                View attendance records for a specific date range
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Date Range Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Start Date</p>
                    <DatePicker date={startDate} setDate={setStartDate} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">End Date</p>
                    <DatePicker date={endDate} setDate={setEndDate} />
                  </div>
                  <Button className="mt-auto md:self-end" variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
                <div className="flex-1 md:flex md:justify-end">
                  <Button variant="outline" className="w-full md:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Placeholder for historical data */}
              <div className="text-center p-12 border rounded-md text-muted-foreground">
                Select a date range and apply filters to view historical attendance data
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRMAttendance;