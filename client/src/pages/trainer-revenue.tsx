import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  Briefcase, Calendar, Coins, DollarSign, LineChart as LineChartIcon, 
  BarChart as BarChartIcon, PieChart as PieChartIcon, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock data - will be replaced with actual API calls
const TRAINER_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B', '#54C5EB', '#FF9D5C'
];

interface TrainerRevenue {
  id: number;
  name: string;
  totalRevenue: number;
  studentCount: number;
  averagePerStudent: number;
  monthlyData: {
    month: string;
    revenue: number;
    students: number;
  }[];
  courseRevenue: {
    course: string;
    revenue: number;
    students: number;
  }[];
}

interface TrainerRevenueChartData {
  name: string;
  revenue: number;
  students: number;
}

const TrainerRevenuePage: FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('thisMonth');
  const [selectedChart, setSelectedChart] = useState<string>('bar');
  
  // Fetch trainer revenue data - this will be replaced with actual API call
  const { data: trainers, isLoading } = useQuery<TrainerRevenue[]>({
    queryKey: ['/api/trainer-revenue', selectedPeriod],
    queryFn: async () => {
      // Mock data for now
      return [
        {
          id: 1,
          name: 'Ahmed Khan',
          totalRevenue: 45000,
          studentCount: 18,
          averagePerStudent: 2500,
          monthlyData: [
            { month: 'Jan', revenue: 8000, students: 3 },
            { month: 'Feb', revenue: 9500, students: 4 },
            { month: 'Mar', revenue: 12000, students: 5 },
            { month: 'Apr', revenue: 15500, students: 6 }
          ],
          courseRevenue: [
            { course: 'AWS Certification', revenue: 18000, students: 6 },
            { course: 'Full Stack Dev', revenue: 15000, students: 5 },
            { course: 'Data Science', revenue: 12000, students: 7 }
          ]
        },
        {
          id: 2,
          name: 'Sara Al Mansoori',
          totalRevenue: 38000,
          studentCount: 15,
          averagePerStudent: 2533,
          monthlyData: [
            { month: 'Jan', revenue: 6500, students: 2 },
            { month: 'Feb', revenue: 8000, students: 3 },
            { month: 'Mar', revenue: 10500, students: 4 },
            { month: 'Apr', revenue: 13000, students: 6 }
          ],
          courseRevenue: [
            { course: 'Digital Marketing', revenue: 16000, students: 8 },
            { course: 'Social Media Master', revenue: 14000, students: 4 },
            { course: 'SEO Fundamentals', revenue: 8000, students: 3 }
          ]
        },
        {
          id: 3,
          name: 'Ravi Patel',
          totalRevenue: 56000,
          studentCount: 20,
          averagePerStudent: 2800,
          monthlyData: [
            { month: 'Jan', revenue: 10000, students: 4 },
            { month: 'Feb', revenue: 13000, students: 4 },
            { month: 'Mar', revenue: 15000, students: 5 },
            { month: 'Apr', revenue: 18000, students: 7 }
          ],
          courseRevenue: [
            { course: 'AI Fundamentals', revenue: 22000, students: 8 },
            { course: 'Python Programming', revenue: 20000, students: 7 },
            { course: 'Machine Learning', revenue: 14000, students: 5 }
          ]
        }
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Format for chart display
  const prepareChartData = () => {
    if (!trainers) return [];
    
    return trainers.map(trainer => ({
      name: trainer.name,
      revenue: trainer.totalRevenue,
      students: trainer.studentCount
    }));
  };

  // Get total and average metrics
  const getTotalRevenue = () => {
    if (!trainers) return 0;
    return trainers.reduce((sum, trainer) => sum + trainer.totalRevenue, 0);
  };

  const getTotalStudents = () => {
    if (!trainers) return 0;
    return trainers.reduce((sum, trainer) => sum + trainer.studentCount, 0);
  };

  const getAveragePerTrainer = () => {
    if (!trainers || trainers.length === 0) return 0;
    return getTotalRevenue() / trainers.length;
  };

  const getAveragePerStudent = () => {
    const totalStudents = getTotalStudents();
    if (totalStudents === 0) return 0;
    return getTotalRevenue() / totalStudents;
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString()}`;
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Trainer Revenue Analysis</h1>
            <p className="text-muted-foreground">Track trainer performance and revenue by student and course</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="lastQuarter">Last Quarter</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Export Report</Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getTotalRevenue())}</div>
              <p className="text-xs text-muted-foreground">
                From {getTotalStudents()} students
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Per Trainer</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getAveragePerTrainer())}</div>
              <p className="text-xs text-muted-foreground">
                Across {trainers?.length || 0} trainers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Per Student</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getAveragePerStudent())}</div>
              <p className="text-xs text-muted-foreground">
                Revenue per enrolled student
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trainers && trainers.length > 0
                  ? trainers.reduce((prev, current) => 
                      prev.totalRevenue > current.totalRevenue ? prev : current
                    ).name
                  : 'No data'}
              </div>
              <p className="text-xs text-muted-foreground">
                Highest revenue generator
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Visualization Options */}
        <div className="bg-background border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Revenue Visualization</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedChart === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedChart('bar')}
              >
                <BarChartIcon className="h-4 w-4 mr-1" />
                Bar
              </Button>
              <Button
                variant={selectedChart === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedChart('pie')}
              >
                <PieChartIcon className="h-4 w-4 mr-1" />
                Pie
              </Button>
              <Button
                variant={selectedChart === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedChart('line')}
              >
                <LineChartIcon className="h-4 w-4 mr-1" />
                Line
              </Button>
            </div>
          </div>

          <div className="h-80">
            {selectedChart === 'bar' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={prepareChartData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="students" name="Students" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {selectedChart === 'pie' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prepareChartData()}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {prepareChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TRAINER_COLORS[index % TRAINER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}

            {selectedChart === 'line' && trainers && trainers.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    type="category" 
                    allowDuplicatedCategory={false} 
                    domain={trainers[0].monthlyData.map(d => d.month)}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  {trainers.map((trainer, index) => (
                    <Line
                      key={trainer.id}
                      data={trainer.monthlyData}
                      type="monotone"
                      dataKey="revenue"
                      name={trainer.name}
                      stroke={TRAINER_COLORS[index % TRAINER_COLORS.length]}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Detailed Trainer Tables */}
        <div className="mb-6">
          <Tabs defaultValue="table">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Search by name..." 
                  className="w-[250px]" 
                />
                <Select defaultValue="revenue">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue: High to Low</SelectItem>
                    <SelectItem value="revenueAsc">Revenue: Low to High</SelectItem>
                    <SelectItem value="students">Students: High to Low</SelectItem>
                    <SelectItem value="average">Average: High to Low</SelectItem>
                    <SelectItem value="name">Name: A to Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="table">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Trainer Name</TableHead>
                        <TableHead className="text-right">Students</TableHead>
                        <TableHead className="text-right">Total Revenue</TableHead>
                        <TableHead className="text-right">Avg. Per Student</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">Loading trainer data...</TableCell>
                        </TableRow>
                      ) : trainers && trainers.length > 0 ? (
                        trainers.map((trainer) => (
                          <TableRow key={trainer.id}>
                            <TableCell className="font-medium">{trainer.name}</TableCell>
                            <TableCell className="text-right">{trainer.studentCount}</TableCell>
                            <TableCell className="text-right">{formatCurrency(trainer.totalRevenue)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(trainer.averagePerStudent)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">View Details</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">No trainer data available</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details">
              <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                  <div className="text-center p-8">Loading trainer details...</div>
                ) : trainers && trainers.length > 0 ? (
                  trainers.map((trainer) => (
                    <Card key={trainer.id} className="overflow-hidden">
                      <CardHeader className="bg-muted">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>{trainer.name}</CardTitle>
                            <CardDescription>
                              {trainer.studentCount} students | {formatCurrency(trainer.totalRevenue)} total revenue
                            </CardDescription>
                          </div>
                          <Button size="sm" variant="outline">Full Report</Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
                            <div className="h-60">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trainer.monthlyData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="month" />
                                  <YAxis />
                                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                  <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Revenue by Course</h3>
                            <div className="h-60">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={trainer.courseRevenue}
                                    dataKey="revenue"
                                    nameKey="course"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    label
                                  >
                                    {trainer.courseRevenue.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={TRAINER_COLORS[index % TRAINER_COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center p-8">No trainer details available</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default TrainerRevenuePage;