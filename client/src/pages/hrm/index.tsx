import { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Users,
  FileText,
  Clock,
  Calendar,
  DollarSign,
  Plane,
  Award,
  ListChecks,
  Briefcase,
  FileEdit
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Mock data types and interfaces
interface EmployeeOverview {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  newHires: number;
  departments: {
    name: string;
    count: number;
  }[];
  recentHires: {
    id: number;
    name: string;
    position: string;
    department: string;
    joinDate: string;
  }[];
  upcomingLeaves: {
    id: number;
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    status: string;
  }[];
  birthdays: {
    id: number;
    name: string;
    department: string;
    date: string;
  }[];
  workAnniversaries: {
    id: number;
    name: string;
    department: string;
    years: number;
    date: string;
  }[];
}

const HRMDashboard: FC = () => {
  // Fetch HRM dashboard data
  const { data: overviewData, isLoading } = useQuery<EmployeeOverview>({
    queryKey: ['/api/hrm/overview'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return {
        totalEmployees: 48,
        activeEmployees: 45,
        onLeave: 3,
        newHires: 5,
        departments: [
          { name: 'Administration', count: 8 },
          { name: 'Training', count: 15 },
          { name: 'Marketing', count: 7 },
          { name: 'Sales', count: 9 },
          { name: 'IT', count: 4 },
          { name: 'Finance', count: 5 }
        ],
        recentHires: [
          { id: 1, name: 'Aisha Khan', position: 'Training Specialist', department: 'Training', joinDate: '2025-04-01' },
          { id: 2, name: 'Mohammed Rahman', position: 'Digital Marketing Expert', department: 'Marketing', joinDate: '2025-03-15' },
          { id: 3, name: 'Sara Al Jaber', position: 'Administrative Assistant', department: 'Administration', joinDate: '2025-03-10' },
          { id: 4, name: 'Rahul Patel', position: 'Full Stack Developer', department: 'IT', joinDate: '2025-03-05' },
          { id: 5, name: 'Fatima Ali', position: 'Course Advisor', department: 'Sales', joinDate: '2025-03-01' }
        ],
        upcomingLeaves: [
          { id: 1, employeeName: 'Ahmed Al Mansouri', leaveType: 'Annual', startDate: '2025-04-25', endDate: '2025-05-05', status: 'Approved' },
          { id: 2, employeeName: 'Priya Singh', leaveType: 'Sick', startDate: '2025-04-20', endDate: '2025-04-22', status: 'Approved' },
          { id: 3, employeeName: 'John Williams', leaveType: 'Personal', startDate: '2025-04-28', endDate: '2025-04-30', status: 'Pending' }
        ],
        birthdays: [
          { id: 1, name: 'Layla Ahmed', department: 'Sales', date: '2025-04-22' },
          { id: 2, name: 'Omar Al Farsi', department: 'Training', date: '2025-04-25' },
          { id: 3, name: 'Zainab Malik', department: 'Administration', date: '2025-05-02' }
        ],
        workAnniversaries: [
          { id: 1, name: 'Jamal Hassan', department: 'Training', years: 5, date: '2025-04-20' },
          { id: 2, name: 'Sanjay Kumar', department: 'IT', years: 3, date: '2025-04-24' },
          { id: 3, name: 'Amina Al Zaabi', department: 'Finance', years: 2, date: '2025-05-05' }
        ]
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Function to calculate days until a date
  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    const differenceInTime = targetDate.getTime() - today.getTime();
    return Math.ceil(differenceInTime / (1000 * 3600 * 24));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Human Resource Management</h1>
          <p className="text-muted-foreground">
            Dashboard and management tools for employees, payroll, and HR operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/hrm/reports">
              <FileText className="mr-2 h-4 w-4" />
              HR Reports
            </Link>
          </Button>
          <Button asChild>
            <Link href="/hrm/employees/new">
              <Users className="mr-2 h-4 w-4" />
              Add Employee
            </Link>
          </Button>
        </div>
      </div>

      {/* HR Quick Access Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Link href="/hrm/employees">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-md">Employees</CardTitle>
              <CardDescription>
                Employee directory
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        
        <Link href="/hrm/staff">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                <Briefcase className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-md">Staff Management</CardTitle>
              <CardDescription>
                Staff profiles and documents
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        
        <Link href="/hrm/payroll">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-md">Payroll</CardTitle>
              <CardDescription>
                Salary processing
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        
        <Link href="/visa-management">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                <Plane className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-md">Visa Management</CardTitle>
              <CardDescription>
                Visa status tracking
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/hrm/interviews">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <FileEdit className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-md">Interviews</CardTitle>
              <CardDescription>
                Candidate interviews
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Card className="hover:bg-accent/50 transition-colors cursor-not-allowed h-full opacity-70">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-slate-600" />
            </div>
            <CardTitle className="text-md">Attendance</CardTitle>
            <CardDescription>
              Coming Soon
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Employee Overview</CardTitle>
            <CardDescription>Current staff distribution and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{isLoading ? '...' : overviewData?.totalEmployees}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{isLoading ? '...' : overviewData?.activeEmployees}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold text-amber-600">{isLoading ? '...' : overviewData?.onLeave}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">New Hires (30d)</p>
                <p className="text-2xl font-bold text-blue-600">{isLoading ? '...' : overviewData?.newHires}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Department Distribution</h3>
              {isLoading ? (
                <div className="h-20 flex items-center justify-center">
                  <p>Loading department data...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {overviewData?.departments.sort((a, b) => b.count - a.count).map(dept => (
                    <div key={dept.name} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{dept.name}</span>
                        <span className="text-sm text-muted-foreground">{dept.count} employees</span>
                      </div>
                      <Progress 
                        value={(dept.count / overviewData.totalEmployees) * 100} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Birthdays, anniversaries and leaves</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-blue-600" />
                  Upcoming Birthdays
                </h3>
                <ul className="space-y-2">
                  {isLoading ? (
                    <li>Loading birthdays...</li>
                  ) : overviewData?.birthdays.length === 0 ? (
                    <li className="text-sm text-muted-foreground">No upcoming birthdays</li>
                  ) : (
                    overviewData?.birthdays.map(birthday => (
                      <li key={birthday.id} className="text-sm border-l-2 border-blue-600 pl-3 py-1">
                        <p className="font-medium">{birthday.name}</p>
                        <p className="text-muted-foreground flex justify-between">
                          <span>{birthday.department}</span>
                          <span>{formatDate(birthday.date)}</span>
                        </p>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Award className="h-4 w-4 mr-1 text-amber-600" />
                  Work Anniversaries
                </h3>
                <ul className="space-y-2">
                  {isLoading ? (
                    <li>Loading anniversaries...</li>
                  ) : overviewData?.workAnniversaries.length === 0 ? (
                    <li className="text-sm text-muted-foreground">No upcoming anniversaries</li>
                  ) : (
                    overviewData?.workAnniversaries.map(anniversary => (
                      <li key={anniversary.id} className="text-sm border-l-2 border-amber-600 pl-3 py-1">
                        <p className="font-medium">{anniversary.name}</p>
                        <p className="text-muted-foreground flex justify-between">
                          <span>{anniversary.years} {anniversary.years === 1 ? 'year' : 'years'}</span>
                          <span>{formatDate(anniversary.date)}</span>
                        </p>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recentHires" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="recentHires">Recent Hires</TabsTrigger>
          <TabsTrigger value="upcomingLeaves">Upcoming Leaves</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recentHires">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Recently Hired Employees</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/hrm/employees?filter=recent">
                    View All
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center p-6">Loading recent hires...</div>
              ) : overviewData?.recentHires.length === 0 ? (
                <div className="text-center p-6 text-muted-foreground">No recent hires found</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {overviewData?.recentHires.map(employee => (
                    <Card key={employee.id} className="overflow-hidden">
                      <CardHeader className="pb-2 bg-muted">
                        <CardTitle className="text-base">{employee.name}</CardTitle>
                        <CardDescription>{employee.position}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Department</p>
                            <p className="font-medium">{employee.department}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Joined</p>
                            <p className="font-medium">{formatDate(employee.joinDate)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upcomingLeaves">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Leave Requests</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/hrm/leaves">
                    Manage Leaves
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center p-6">Loading leave requests...</div>
              ) : overviewData?.upcomingLeaves.length === 0 ? (
                <div className="text-center p-6 text-muted-foreground">No upcoming leaves</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-3 px-2 font-medium text-muted-foreground">Employee</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Type</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">From</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">To</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overviewData?.upcomingLeaves.map(leave => (
                        <tr key={leave.id} className="border-b last:border-0">
                          <td className="py-3 px-2 font-medium">{leave.employeeName}</td>
                          <td className="py-3 px-2">{leave.leaveType}</td>
                          <td className="py-3 px-2">{formatDate(leave.startDate)}</td>
                          <td className="py-3 px-2">{formatDate(leave.endDate)}</td>
                          <td className="py-3 px-2 text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              leave.status === 'Approved' 
                                ? 'bg-green-100 text-green-800' 
                                : leave.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {leave.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/hrm/employees/new">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>New Employee</span>
              </Button>
            </Link>
            <Link href="/hrm/payroll/new">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span>Run Payroll</span>
              </Button>
            </Link>
            <Link href="/hrm/reports">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <span>Reports</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRMDashboard;