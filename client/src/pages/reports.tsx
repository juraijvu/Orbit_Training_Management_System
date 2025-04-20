import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { addDays, format, subDays } from 'date-fns';
import { 
  CreditCard, 
  Download, 
  FileText, 
  Loader2, 
  Search, 
  User, 
  Users 
} from 'lucide-react';
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
  Cell,
} from 'recharts';

// Sample data (replace with actual API data)
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const studentRegistrationData = [
  { month: 'Jan', count: 12 },
  { month: 'Feb', count: 19 },
  { month: 'Mar', count: 15 },
  { month: 'Apr', count: 25 },
  { month: 'May', count: 32 },
  { month: 'Jun', count: 28 },
];

const coursePopularityData = [
  { name: 'CAD Design', students: 45 },
  { name: 'Revit Architecture', students: 37 },
  { name: 'Project Management', students: 28 },
  { name: 'AutoCAD', students: 32 },
  { name: 'BIM Modeling', students: 18 },
];

const revenueData = [
  { month: 'Jan', revenue: 15000 },
  { month: 'Feb', revenue: 23500 },
  { month: 'Mar', revenue: 18700 },
  { month: 'Apr', revenue: 32000 },
  { month: 'May', revenue: 39500 },
  { month: 'Jun', revenue: 35200 },
];

// Sample payment history data
const paymentHistory = [
  { id: 1, student: 'Ali Mohammed', course: 'CAD Design', amount: 15000, date: '2025-04-15', status: 'Paid' },
  { id: 2, student: 'Sara Al Mansoor', course: 'Revit Architecture', amount: 18500, date: '2025-04-14', status: 'Paid' },
  { id: 3, student: 'Hassan Khalid', course: 'AutoCAD', amount: 12000, date: '2025-04-10', status: 'Paid' },
  { id: 4, student: 'Fatima Al-Zahra', course: 'Project Management', amount: 22000, date: '2025-04-08', status: 'Paid' },
  { id: 5, student: 'Amina Safi', course: 'BIM Modeling', amount: 17500, date: '2025-04-05', status: 'Paid' },
];

const ReportsPage: FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [reportType, setReportType] = useState<string>('monthly');
  
  // Filter payment history based on search query
  const filteredPayments = paymentHistory.filter(payment => 
    payment.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.course.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleExportReport = () => {
    // Implementation for exporting reports as CSV/PDF
    console.log('Exporting report...');
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-gray-500">Analyze institute performance and generate reports</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-2">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">AED 185,200</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                  <div className="mt-4 h-1 w-full bg-gray-200 rounded">
                    <div className="h-1 bg-green-500 rounded" style={{ width: '75%' }}></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">137</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                  <div className="mt-4 h-1 w-full bg-gray-200 rounded">
                    <div className="h-1 bg-blue-500 rounded" style={{ width: '65%' }}></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 from last month</p>
                  <div className="mt-4 h-1 w-full bg-gray-200 rounded">
                    <div className="h-1 bg-purple-500 rounded" style={{ width: '85%' }}></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">92%</div>
                  <p className="text-xs text-muted-foreground">+5% from last month</p>
                  <div className="mt-4 h-1 w-full bg-gray-200 rounded">
                    <div className="h-1 bg-amber-500 rounded" style={{ width: '92%' }}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Student Registrations</CardTitle>
                  <CardDescription>Monthly registration count for the current year</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={studentRegistrationData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" name="Students" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Course Popularity</CardTitle>
                  <CardDescription>Distribution of students by course</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={coursePopularityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="students"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {coursePopularityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} students`, 'Enrolled']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue for the current year</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={revenueData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`AED ${value.toLocaleString()}`, 'Revenue']} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Revenue (AED)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Latest payment transactions</CardDescription>
                </div>
                <Input 
                  placeholder="Search payments..." 
                  className="max-w-sm" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.student}</TableCell>
                        <TableCell>{payment.course}</TableCell>
                        <TableCell>AED {payment.amount.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(payment.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {payment.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Report</CardTitle>
                <CardDescription>
                  Detailed financial data for the selected period: {dateRange?.from ? format(dateRange.from, 'dd/MM/yyyy') : ''} - {dateRange?.to ? format(dateRange.to, 'dd/MM/yyyy') : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="mr-4 bg-blue-100 p-2 rounded-lg">
                        <CreditCard className="h-6 w-6 text-blue-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <p className="text-xl font-bold">AED 185,200</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="mr-4 bg-green-100 p-2 rounded-lg">
                        <Users className="h-6 w-6 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">New Enrollments</p>
                        <p className="text-xl font-bold">28</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="mr-4 bg-purple-100 p-2 rounded-lg">
                        <FileText className="h-6 w-6 text-purple-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Avg. Course Fee</p>
                        <p className="text-xl font-bold">AED 15,400</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={300} className="mb-8">
                  <BarChart
                    data={revenueData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`AED ${value.toLocaleString()}`, 'Revenue']} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Revenue (AED)" />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Gross Revenue (AED)</TableHead>
                        <TableHead>Expenses (AED)</TableHead>
                        <TableHead>Net Profit (AED)</TableHead>
                        <TableHead>Growth (%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>January</TableCell>
                        <TableCell>15,000</TableCell>
                        <TableCell>6,500</TableCell>
                        <TableCell>8,500</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>February</TableCell>
                        <TableCell>23,500</TableCell>
                        <TableCell>7,200</TableCell>
                        <TableCell>16,300</TableCell>
                        <TableCell>+91.8%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>March</TableCell>
                        <TableCell>18,700</TableCell>
                        <TableCell>6,800</TableCell>
                        <TableCell>11,900</TableCell>
                        <TableCell>-27.0%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>April</TableCell>
                        <TableCell>32,000</TableCell>
                        <TableCell>9,500</TableCell>
                        <TableCell>22,500</TableCell>
                        <TableCell>+89.1%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>May</TableCell>
                        <TableCell>39,500</TableCell>
                        <TableCell>12,300</TableCell>
                        <TableCell>27,200</TableCell>
                        <TableCell>+20.9%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>June</TableCell>
                        <TableCell>35,200</TableCell>
                        <TableCell>11,800</TableCell>
                        <TableCell>23,400</TableCell>
                        <TableCell>-14.0%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Analytics</CardTitle>
                <CardDescription>Student registration and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="mr-4 bg-blue-100 p-2 rounded-lg">
                        <User className="h-6 w-6 text-blue-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Students</p>
                        <p className="text-xl font-bold">137</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="mr-4 bg-green-100 p-2 rounded-lg">
                        <Users className="h-6 w-6 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">New Students (This Month)</p>
                        <p className="text-xl font-bold">32</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="mr-4 bg-amber-100 p-2 rounded-lg">
                        <FileText className="h-6 w-6 text-amber-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Completion Rate</p>
                        <p className="text-xl font-bold">92%</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={300} className="mb-8">
                  <BarChart
                    data={studentRegistrationData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Students" />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Age Group</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Female</TableHead>
                        <TableHead>Male</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>18-24</TableCell>
                        <TableCell>35</TableCell>
                        <TableCell>25.5%</TableCell>
                        <TableCell>19</TableCell>
                        <TableCell>16</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>25-34</TableCell>
                        <TableCell>52</TableCell>
                        <TableCell>38.0%</TableCell>
                        <TableCell>24</TableCell>
                        <TableCell>28</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>35-44</TableCell>
                        <TableCell>32</TableCell>
                        <TableCell>23.4%</TableCell>
                        <TableCell>15</TableCell>
                        <TableCell>17</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>45+</TableCell>
                        <TableCell>18</TableCell>
                        <TableCell>13.1%</TableCell>
                        <TableCell>8</TableCell>
                        <TableCell>10</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Analytics</CardTitle>
                <CardDescription>Course performance and popularity metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="mr-4 bg-purple-100 p-2 rounded-lg">
                        <FileText className="h-6 w-6 text-purple-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Active Courses</p>
                        <p className="text-xl font-bold">12</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="mr-4 bg-blue-100 p-2 rounded-lg">
                        <Users className="h-6 w-6 text-blue-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Avg. Students per Course</p>
                        <p className="text-xl font-bold">11.4</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="mr-4 bg-green-100 p-2 rounded-lg">
                        <CreditCard className="h-6 w-6 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Avg. Revenue per Course</p>
                        <p className="text-xl font-bold">AED 15,433</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Course Popularity</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={coursePopularityData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="students"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {coursePopularityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} students`, 'Enrolled']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Course Revenue</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={coursePopularityData.map(course => ({
                          name: course.name,
                          revenue: course.students * 12000 // Simulated revenue based on student count
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`AED ${value.toLocaleString()}`, 'Revenue']} />
                        <Legend />
                        <Bar dataKey="revenue" fill="#82ca9d" name="Revenue (AED)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Name</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Avg. Completion Rate</TableHead>
                        <TableHead>Revenue (AED)</TableHead>
                        <TableHead>Start Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>CAD Design</TableCell>
                        <TableCell>45</TableCell>
                        <TableCell>94%</TableCell>
                        <TableCell>540,000</TableCell>
                        <TableCell>10/01/2025</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Revit Architecture</TableCell>
                        <TableCell>37</TableCell>
                        <TableCell>90%</TableCell>
                        <TableCell>444,000</TableCell>
                        <TableCell>15/01/2025</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Project Management</TableCell>
                        <TableCell>28</TableCell>
                        <TableCell>88%</TableCell>
                        <TableCell>336,000</TableCell>
                        <TableCell>05/02/2025</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>AutoCAD</TableCell>
                        <TableCell>32</TableCell>
                        <TableCell>92%</TableCell>
                        <TableCell>384,000</TableCell>
                        <TableCell>20/02/2025</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>BIM Modeling</TableCell>
                        <TableCell>18</TableCell>
                        <TableCell>85%</TableCell>
                        <TableCell>216,000</TableCell>
                        <TableCell>05/03/2025</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;