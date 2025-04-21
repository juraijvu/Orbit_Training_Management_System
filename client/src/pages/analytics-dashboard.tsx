import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/components/layout/app-layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart,
  BarChart3,
  DollarSign, 
  Users, 
  BookOpen, 
  TrendingUp,
  PieChart,
  Activity,
  Clock,
  Building,
  UserCheck,
  UserCog
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import {
  AreaChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell
} from 'recharts';

// Type definitions for API responses
interface DashboardStats {
  counts: {
    students: number;
    courses: number;
    trainers: number;
    leads: number;
  };
  revenue: {
    total: string;
    currentMonth: string;
  };
  monthlyRegistrations: Array<{
    month: string;
    count: number;
  }>;
  recentStudents: Array<any>;
  paymentStatusDistribution: Array<{
    status: string;
    count: number;
  }>;
  topCourses: Array<{
    id: number;
    name: string;
    count: number;
  }>;
}

interface StudentAnalytics {
  registrationTrends: Array<{
    month: string;
    count: number;
  }>;
  courseEnrollments: Array<{
    course: string;
    students: number;
  }>;
  paymentMethodDistribution: Array<{
    paymentMode: string;
    count: number;
  }>;
  classTypeDistribution: Array<{
    classType: string;
    count: number;
  }>;
  nationalityDistribution: Array<{
    nationality: string;
    count: number;
  }>;
  emiratesDistribution: Array<{
    emirates: string;
    count: number;
  }>;
}

interface FinancialAnalytics {
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  paymentMethodDistribution: Array<{
    paymentMode: string;
    count: number;
    total: string;
  }>;
  courseRevenue: Array<{
    course: string;
    revenue: string;
  }>;
  unpaidInvoices: {
    count: number;
    total: string;
  };
}

interface CourseAnalytics {
  courseStats: Array<{
    id: number;
    name: string;
    description: string | null;
    fee: string;
    enrollments: number;
  }>;
  popularTimeSlots: Array<{
    timeSlot: string;
    count: number;
  }>;
}

interface CrmAnalytics {
  leadStats: {
    total: number;
    converted: number;
    conversionRate: string;
  };
  leadSources: Array<{
    source: string;
    count: number;
  }>;
  leadStatus: Array<{
    status: string;
    count: number;
  }>;
  followUpStats: {
    totalFollowUps: number;
    avgFollowUpsPerLead: string;
  };
}

interface HrmAnalytics {
  employeeStats: {
    totalEmployees: number;
    activeEmployees: number;
    onLeave: number;
    newHires: number;
  };
  departments: Array<{
    name: string;
    count: number;
  }>;
  recentHires: Array<{
    id: number;
    name: string;
    position: string;
    department: string;
    joinDate: string;
  }>;
  upcomingLeaves: Array<{
    id: number;
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    status: string;
  }>;
  attendanceStats: {
    present: number;
    absent: number;
    late: number;
    onLeave: number;
    present_percentage: string;
  };
}

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

const AnalyticsDashboard: FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Main dashboard stats
  const { data: dashboardStats, isLoading: dashboardLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/analytics/dashboard'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Student analytics
  const { data: studentAnalytics, isLoading: studentLoading } = useQuery<StudentAnalytics>({
    queryKey: ['/api/analytics/students'],
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === 'students',
  });
  
  // Financial analytics
  const { data: financialAnalytics, isLoading: financialLoading } = useQuery<FinancialAnalytics>({
    queryKey: ['/api/analytics/financial'],
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === 'financial',
  });
  
  // Course analytics
  const { data: courseAnalytics, isLoading: courseLoading } = useQuery<CourseAnalytics>({
    queryKey: ['/api/analytics/courses'],
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === 'courses',
  });
  
  // CRM analytics
  const { data: crmAnalytics, isLoading: crmLoading } = useQuery<CrmAnalytics>({
    queryKey: ['/api/analytics/crm'],
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === 'crm',
  });
  
  // HRM analytics
  const { data: hrmAnalytics, isLoading: hrmLoading } = useQuery<HrmAnalytics>({
    queryKey: ['/api/analytics/hrm'],
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === 'hrm',
  });
  
  // Check if user has access to analytics
  const hasAccess = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Analytics Dashboard</h1>
        <p className="text-gray-600">
          Comprehensive analytics and insights for Orbit Institute Management System
        </p>
      </div>
      
      {/* Analytics access check */}
      {!hasAccess ? (
        <Card className="mb-8">
          <CardContent className="py-8 text-center">
            <p className="mb-4 text-lg text-gray-700">You do not have access to the analytics dashboard.</p>
            <p className="text-gray-500">Please contact an administrator if you need access.</p>
          </CardContent>
        </Card>
      ) : (
        /* Analytics Dashboard */
        <Tabs 
          defaultValue="overview" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Students</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Financial</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Courses</span>
            </TabsTrigger>
            <TabsTrigger value="crm" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">CRM</span>
            </TabsTrigger>
            <TabsTrigger value="hrm" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">HRM</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {dashboardLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats?.counts.students}</div>
                      <p className="text-xs text-muted-foreground">
                        +{dashboardStats?.monthlyRegistrations[dashboardStats.monthlyRegistrations.length - 1].count || 0} this month
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats?.counts.courses}</div>
                      <p className="text-xs text-muted-foreground">
                        Across various categories
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats?.revenue.total}</div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardStats?.revenue.currentMonth} this month
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats?.counts.leads}</div>
                      <p className="text-xs text-muted-foreground">
                        From various lead sources
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Monthly Registrations Chart */}
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Monthly Student Registrations</CardTitle>
                      <CardDescription>Number of new students registered per month</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={dashboardStats?.monthlyRegistrations}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                              dataKey="month" 
                              tick={{ fontSize: 12 }} 
                            />
                            <YAxis 
                              width={30}
                              tick={{ fontSize: 12 }} 
                              tickFormatter={(value) => value.toString()} 
                            />
                            <Tooltip formatter={(value) => [`${value} students`, 'Registrations']} />
                            <Area 
                              type="monotone" 
                              dataKey="count" 
                              stroke="#8884d8" 
                              fillOpacity={1} 
                              fill="url(#colorCount)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Top Courses Chart */}
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Top Courses by Enrollment</CardTitle>
                      <CardDescription>Most popular courses based on student enrollment</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={dashboardStats?.topCourses}
                            margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 11 }} 
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis 
                              width={30}
                              tick={{ fontSize: 12 }} 
                            />
                            <Tooltip formatter={(value) => [`${value} students`, 'Enrollments']} />
                            <Legend />
                            <Bar dataKey="count" fill="#82ca9d" name="Enrolled Students" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Payment Status Distribution */}
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Payment Status Distribution</CardTitle>
                      <CardDescription>Distribution of student payment statuses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie>
                            <Pie
                              data={dashboardStats?.paymentStatusDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="count"
                              nameKey="status"
                            >
                              {dashboardStats?.paymentStatusDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name, props) => [`${value} students`, props.payload.status]} />
                            <Legend />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Recent Students */}
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Recent Student Registrations</CardTitle>
                      <CardDescription>Recently registered students</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dashboardStats?.recentStudents?.slice(0, 5).map((student, index) => (
                          <div key={index} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Users className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Registered on {student.registrationDate ? format(new Date(student.registrationDate), 'PPP') : 'N/A'}
                              </p>
                            </div>
                            <div className="text-sm text-right">
                              <p className="font-medium">{student.classType || 'Standard'}</p>
                              <p className="text-xs text-muted-foreground">{student.nationality || 'Unknown'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
          
          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            {studentLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Registration Trends */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Student Registration Trends</CardTitle>
                    <CardDescription>Monthly student registration trends over the past year</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={studentAnalytics?.registrationTrends}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis width={30} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value) => [`${value} students`, 'Registrations']} />
                          <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#8884d8" 
                            fillOpacity={1} 
                            fill="url(#colorReg)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Course Enrollments */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Course Enrollment Distribution</CardTitle>
                    <CardDescription>Student enrollment distribution across courses</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={studentAnalytics?.courseEnrollments}
                          margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="course" 
                            tick={{ fontSize: 11 }} 
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis width={30} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value) => [`${value} students`, 'Enrollments']} />
                          <Bar dataKey="students" fill="#82ca9d" name="Students" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Payment Method Distribution */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Payment Method Distribution</CardTitle>
                    <CardDescription>Distribution of student payment methods</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={studentAnalytics?.paymentMethodDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="paymentMode"
                          >
                            {studentAnalytics?.paymentMethodDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name, props) => [`${value} students`, props.payload.paymentMode]} />
                          <Legend />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Class Type Distribution */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Class Type Distribution</CardTitle>
                    <CardDescription>Distribution of students by class type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={studentAnalytics?.classTypeDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="classType"
                          >
                            {studentAnalytics?.classTypeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name, props) => [`${value} students`, props.payload.classType]} />
                          <Legend />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Nationality Distribution */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Top Nationalities</CardTitle>
                    <CardDescription>Distribution of students by nationality</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={studentAnalytics?.nationalityDistribution}
                          layout="vertical"
                          margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 12 }} />
                          <YAxis 
                            dataKey="nationality" 
                            type="category" 
                            tick={{ fontSize: 12 }}
                            width={80}
                          />
                          <Tooltip formatter={(value) => [`${value} students`, 'Students']} />
                          <Bar dataKey="count" fill="#8884d8" name="Students" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Emirates Distribution */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Emirates Distribution</CardTitle>
                    <CardDescription>Distribution of students by emirate</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={studentAnalytics?.emiratesDistribution}
                          layout="vertical"
                          margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 12 }} />
                          <YAxis 
                            dataKey="emirates" 
                            type="category" 
                            tick={{ fontSize: 12 }}
                            width={80}
                          />
                          <Tooltip formatter={(value) => [`${value} students`, 'Students']} />
                          <Bar dataKey="count" fill="#00C49F" name="Students" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-4">
            {financialLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Monthly Revenue */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Monthly Revenue</CardTitle>
                    <CardDescription>Revenue collected each month for the past year</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={financialAnalytics?.monthlyRevenue}
                          margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.2}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis 
                            width={60}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `AED ${(value / 1000).toFixed(0)}K`}
                          />
                          <Tooltip formatter={(value) => [`AED ${value.toLocaleString()}`, 'Revenue']} />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#82ca9d" 
                            fillOpacity={1} 
                            fill="url(#colorRev)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Course Revenue */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Revenue by Course</CardTitle>
                    <CardDescription>Top courses by revenue generated</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={financialAnalytics?.courseRevenue.map(item => ({
                            ...item,
                            // Extract numeric value from AED string for chart display
                            numericRevenue: parseFloat(item.revenue.replace(/[^0-9.]/g, ''))
                          }))}
                          margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="course" 
                            tick={{ fontSize: 11 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis 
                            width={60}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `AED ${(value / 1000).toFixed(0)}K`}
                          />
                          <Tooltip formatter={(value, name) => [value.toLocaleString(), name]} />
                          <Bar 
                            dataKey="numericRevenue" 
                            fill="#8884d8" 
                            name="Revenue" 
                            label={{ position: 'top', formatter: (value) => `AED ${(value/1000).toFixed(1)}K` }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Payment Method Distribution */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Revenue distribution by payment method</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={financialAnalytics?.paymentMethodDistribution.map(item => ({
                              ...item,
                              // Extract numeric value from total string for chart display
                              numericTotal: typeof item.total === 'string' 
                                ? parseFloat(item.total.replace(/[^0-9.]/g, '')) 
                                : item.total
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="numericTotal"
                            nameKey="paymentMode"
                          >
                            {financialAnalytics?.paymentMethodDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name, props) => [
                              props.payload.total || `AED ${value.toLocaleString()}`, 
                              props.payload.paymentMode
                            ]}
                          />
                          <Legend />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Unpaid Invoices */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Unpaid Invoices</CardTitle>
                    <CardDescription>Outstanding invoice summary</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center h-[300px] space-y-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-amber-600">
                          {financialAnalytics?.unpaidInvoices.count}
                        </div>
                        <p className="text-muted-foreground mt-2">Unpaid Invoices</p>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-red-600">
                          {financialAnalytics?.unpaidInvoices.total}
                        </div>
                        <p className="text-muted-foreground mt-2">Outstanding Amount</p>
                      </div>
                      <Button className="mt-4">View Unpaid Invoices</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            {courseLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Course Enrollment Stats */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Course Enrollment Statistics</CardTitle>
                    <CardDescription>Student enrollments by course</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={courseAnalytics?.courseStats}
                          margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 11 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            width={30}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip 
                            formatter={(value, name) => [value, name]}
                            labelFormatter={(label) => `Course: ${label}`}
                          />
                          <Legend />
                          <Bar dataKey="enrollments" fill="#8884d8" name="Students" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Popular Time Slots */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Popular Class Time Slots</CardTitle>
                    <CardDescription>Most popular time slots for classes</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={courseAnalytics?.popularTimeSlots}
                          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 12 }} />
                          <YAxis 
                            dataKey="timeSlot" 
                            type="category"
                            tick={{ fontSize: 12 }}
                            width={80}
                          />
                          <Tooltip formatter={(value) => [`${value} classes`, 'Classes']} />
                          <Bar dataKey="count" fill="#82ca9d" name="Classes" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Course Fee Comparison */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Course Fee Comparison</CardTitle>
                    <CardDescription>Comparison of course fees across all courses</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={courseAnalytics?.courseStats.map(course => ({
                            ...course,
                            // Extract numeric value from fee string for chart display
                            numericFee: parseFloat(course.fee.replace(/[^0-9.]/g, ''))
                          }))}
                          margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 11 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            width={60}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `AED ${value}`}
                          />
                          <Tooltip 
                            formatter={(value, name) => [`AED ${value}`, name]}
                            labelFormatter={(label) => `Course: ${label}`}
                          />
                          <Legend />
                          <Bar dataKey="numericFee" fill="#FFBB28" name="Course Fee" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          {/* CRM Tab */}
          <TabsContent value="crm" className="space-y-4">
            {crmLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Lead Conversion Stats */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Lead Conversion Statistics</CardTitle>
                    <CardDescription>Lead conversion rate and totals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center h-[300px] space-y-6">
                      <div className="grid grid-cols-3 w-full text-center gap-4">
                        <div>
                          <div className="text-4xl font-bold text-blue-600">
                            {crmAnalytics?.leadStats.total}
                          </div>
                          <p className="text-muted-foreground mt-1">Total Leads</p>
                        </div>
                        <div>
                          <div className="text-4xl font-bold text-green-600">
                            {crmAnalytics?.leadStats.converted}
                          </div>
                          <p className="text-muted-foreground mt-1">Converted</p>
                        </div>
                        <div>
                          <div className="text-4xl font-bold text-amber-600">
                            {crmAnalytics?.leadStats.conversionRate}
                          </div>
                          <p className="text-muted-foreground mt-1">Conversion Rate</p>
                        </div>
                      </div>
                      
                      <div className="text-center mt-8">
                        <div className="text-3xl font-bold text-purple-600">
                          {crmAnalytics?.followUpStats.totalFollowUps}
                        </div>
                        <p className="text-muted-foreground mt-1">Total Follow-ups</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Average {crmAnalytics?.followUpStats.avgFollowUpsPerLead} follow-ups per lead
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Lead Sources */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Lead Source Distribution</CardTitle>
                    <CardDescription>Distribution of leads by source</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={crmAnalytics?.leadSources}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="source"
                          >
                            {crmAnalytics?.leadSources.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name, props) => [`${value} leads`, props.payload.source]} />
                          <Legend />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Lead Status */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Lead Status Distribution</CardTitle>
                    <CardDescription>Current status of all leads in the system</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={crmAnalytics?.leadStatus}
                          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                          <YAxis width={30} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value) => [`${value} leads`, 'Leads']} />
                          <Legend />
                          <Bar dataKey="count" fill="#00C49F" name="Leads" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          {/* HRM Tab */}
          <TabsContent value="hrm" className="space-y-4">
            {hrmLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Employee Stats */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Employee Statistics</CardTitle>
                    <CardDescription>Overview of employee statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center h-[300px] space-y-6">
                      <div className="grid grid-cols-2 w-full text-center gap-4">
                        <div>
                          <div className="text-4xl font-bold text-blue-600">
                            {hrmAnalytics?.employeeStats.totalEmployees}
                          </div>
                          <p className="text-muted-foreground mt-1">Total Employees</p>
                        </div>
                        <div>
                          <div className="text-4xl font-bold text-green-600">
                            {hrmAnalytics?.employeeStats.activeEmployees}
                          </div>
                          <p className="text-muted-foreground mt-1">Active Employees</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 w-full text-center gap-4 mt-4">
                        <div>
                          <div className="text-4xl font-bold text-amber-600">
                            {hrmAnalytics?.employeeStats.onLeave}
                          </div>
                          <p className="text-muted-foreground mt-1">On Leave</p>
                        </div>
                        <div>
                          <div className="text-4xl font-bold text-purple-600">
                            {hrmAnalytics?.employeeStats.newHires}
                          </div>
                          <p className="text-muted-foreground mt-1">New Hires</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Department Distribution */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Department Distribution</CardTitle>
                    <CardDescription>Distribution of employees by department</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={hrmAnalytics?.departments}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="name"
                          >
                            {hrmAnalytics?.departments.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name, props) => [`${value} employees`, props.payload.name]} />
                          <Legend />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Attendance Stats */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Today's Attendance</CardTitle>
                    <CardDescription>Current day attendance statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={[
                              { name: 'Present', value: hrmAnalytics?.attendanceStats.present },
                              { name: 'Absent', value: hrmAnalytics?.attendanceStats.absent },
                              { name: 'Late', value: hrmAnalytics?.attendanceStats.late },
                              { name: 'On Leave', value: hrmAnalytics?.attendanceStats.onLeave },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                          >
                            <Cell fill="#4CAF50" /> {/* Present - Green */}
                            <Cell fill="#F44336" /> {/* Absent - Red */}
                            <Cell fill="#FFC107" /> {/* Late - Amber */}
                            <Cell fill="#2196F3" /> {/* On Leave - Blue */}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value} employees`, name]} />
                          <Legend />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-4">
                      <p className="text-sm font-medium">Present Rate: {hrmAnalytics?.attendanceStats.present_percentage}</p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Upcoming Leaves */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Upcoming Leaves</CardTitle>
                    <CardDescription>Employees with upcoming approved or pending leaves</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 overflow-auto max-h-[300px] pr-2">
                      {hrmAnalytics?.upcomingLeaves.map((leave) => (
                        <div key={leave.id} className="bg-muted/50 p-3 rounded-md space-y-2">
                          <div className="flex justify-between">
                            <p className="font-medium">{leave.employeeName}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              leave.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {leave.status}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <p>{leave.leaveType}</p>
                            <p>{leave.startDate} to {leave.endDate}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Recent Hires */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Hires</CardTitle>
                    <CardDescription>Recently hired employees</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {hrmAnalytics?.recentHires.map((hire) => (
                        <div key={hire.id} className="flex items-center gap-4 p-3 rounded-md hover:bg-muted/50">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <UserCog className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{hire.name}</p>
                            <p className="text-xs text-muted-foreground">{hire.position}</p>
                          </div>
                          <div className="text-sm text-right">
                            <p className="font-medium">{hire.department}</p>
                            <p className="text-xs text-muted-foreground">Joined: {hire.joinDate}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </AppLayout>
  );
};

export default AnalyticsDashboard;