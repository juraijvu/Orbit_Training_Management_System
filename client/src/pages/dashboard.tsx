import { FC, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Activity } from '@shared/types';
import { Link } from 'wouter';
import AppLayout from '@/components/layout/app-layout';
import StatCard from '@/components/dashboard/stats-card';
import RecentActivities from '@/components/dashboard/recent-activities';
import UpcomingSchedule from '@/components/dashboard/upcoming-schedule';
import QuickActions from '@/components/dashboard/quick-actions';
import { DashboardReportSection } from '@/components/dashboard/report-section';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Users, 
  BookOpen, 
  Award, 
  AlertCircle, 
  TrendingUp, 
  Calendar, 
  Clock, 
  ChevronRight,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface DashboardStats {
  totalStudents: number;
  activeCourses: number;
  revenue: number;
  certificates: number;
  todayCollection: number;
  pendingFees: number;
  trainerRevenue: number;  // New field for trainer revenue stats
}

interface ScheduleItem {
  id: number;
  title: string;
  courseName: string;
  trainerName: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface DuePaymentStudent {
  id: number;
  name: string;
  course: string;
  balanceDue: number;
  dueDate: string;
  phone: string;
}

const Dashboard: FC = () => {
  const { user } = useAuth();
  
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch recent activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['/api/dashboard/activities'],
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Fetch upcoming schedules
  const { data: schedules, isLoading: schedulesLoading } = useQuery<ScheduleItem[]>({
    queryKey: ['/api/dashboard/schedules'],
    staleTime: 60 * 1000, // 1 minute
  });

  // Fetch students with due payments today
  const { data: duePayments, isLoading: duePaymentsLoading } = useQuery<DuePaymentStudent[]>({
    queryKey: ['/api/dashboard/due-payments'],
    staleTime: 60 * 1000, // 1 minute
  });

  // Format revenue for display - changing to AED for UAE
  const formatRevenue = (amount: number) => {
    if (amount >= 100000) {
      return `AED ${(amount / 1000).toFixed(1)}K`;
    } else if (amount >= 1000) {
      return `AED ${(amount / 1000).toFixed(1)}K`;
    } else {
      return `AED ${amount}`;
    }
  };
  
  // Get today's date for due payments section
  const today = format(new Date(), 'MMMM d, yyyy');
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to Orbit Institute Management System, {user?.fullName || user?.username}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={statsLoading ? "—" : stats?.totalStudents.toString() || "0"}
          change="12% from last month"
          type="students"
          icon={<Users className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          title="Active Courses"
          value={statsLoading ? "—" : stats?.activeCourses.toString() || "0"}
          change="3 new this month"
          type="courses"
          icon={<BookOpen className="h-5 w-5 text-yellow-600" />}
        />
        <StatCard
          title="Total Revenue"
          value={statsLoading ? "—" : formatRevenue(stats?.revenue || 0)}
          change="8% from last month"
          type="revenue"
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          title="Certificates"
          value={statsLoading ? "—" : stats?.certificates.toString() || "0"}
          change="42 this month"
          type="certificates"
          icon={<Award className="h-5 w-5 text-purple-600" />}
        />
      </div>

      {/* Today's Collection and Due Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Today's Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <p className="text-3xl font-bold text-gray-900">
                {statsLoading ? "—" : formatRevenue(stats?.todayCollection || 0)}
              </p>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                Today
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {today}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
              Pending Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <p className="text-3xl font-bold text-gray-900">
                {statsLoading ? "—" : formatRevenue(stats?.pendingFees || 0)}
              </p>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <Calendar className="h-3 w-3 mr-1" />
                Due Today
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {duePaymentsLoading ? 'Loading payments due today...' : 
                `${duePayments?.length || 0} students with payments due today`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Students with Due Payments Today */}
      {(duePayments && duePayments.length > 0) && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Students With Due Payments Today</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Balance Due</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {duePayments.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell className="text-red-600 font-medium">
                      AED {student.balanceDue.toLocaleString()}
                    </TableCell>
                    <TableCell>{student.dueDate}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Collect <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline">View All Due Payments</Button>
          </CardFooter>
        </Card>
      )}

      {/* Recent Activities and Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RecentActivities 
          activities={activities || []} 
          loading={activitiesLoading} 
        />
        <UpcomingSchedule 
          schedules={schedules || []} 
          loading={schedulesLoading} 
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />
      
      {/* Reports Section - only shown to admin and superadmin */}
      {(user?.role === 'admin' || user?.role === 'superadmin') && (
        <div className="mb-8">
          <DashboardReportSection />
        </div>
      )}
      
      {/* Admin-specific sections */}
      {(user?.role === 'admin' || user?.role === 'superadmin') && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Admin Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Course Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Manage course content, pricing, and availability</p>
              </CardContent>
              <CardFooter>
                <Link href="/course-management">
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Courses
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Trainer Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Track trainer performance and revenue generated
                  </p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatRevenue(stats?.trainerRevenue || 0)}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/trainer-revenue">
                  <Button variant="outline" size="sm" className="w-full">
                    Trainer Reports
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">HR Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Employee management, payroll, and HR operations
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/hrm">
                  <Button variant="outline" size="sm" className="w-full">
                    HR Dashboard
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">System Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  {user?.role === 'superadmin' ? 
                    'Generate monthly, yearly, and date range reports' : 
                    'View monthly reports and analytics'
                  }
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/reports">
                  <Button variant="outline" size="sm" className="w-full">
                    Generate Reports
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
          
          <h3 className="text-md font-semibold text-gray-800 mb-4">Institute Operations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Company Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Track and manage all institute expenses</p>
              </CardContent>
              <CardFooter>
                <Link href="/expenses">
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Expenses
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Visa Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Track employee visa status, renewals, and expirations
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/visa-management">
                  <Button variant="outline" size="sm" className="w-full">
                    Visa Dashboard
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Facility Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Manage institute facilities, classrooms, and equipment
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/facilities">
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Facilities
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
      
      {/* Counselor-specific sections */}
      {user?.role === 'counselor' && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Counselor Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Student Dues</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">View students with upcoming payment dues</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">View Due List</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Monthly Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">View student enrollment counts by month</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">View Enrollment Stats</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">New Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Register a new student for courses</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">New Registration</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;
