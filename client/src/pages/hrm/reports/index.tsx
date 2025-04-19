import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Users,
  DollarSign,
  FilePieChart,
  UserCog,
  UserPlus,
  UserMinus,
  Building
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReportType {
  id: number;
  name: string;
  description: string;
  category: string;
  lastGenerated?: string;
  icon: React.ReactNode;
}

const HRReports: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Dummy report data
  const reports: ReportType[] = [
    {
      id: 1,
      name: 'Employee Directory',
      description: 'Complete list of all employees with contact details and department information',
      category: 'employees',
      lastGenerated: '15 Apr 2025',
      icon: <Users className="h-8 w-8 text-blue-600" />
    },
    {
      id: 2,
      name: 'Department Headcount',
      description: 'Summary of employee count by department and employment type',
      category: 'employees',
      lastGenerated: '10 Apr 2025',
      icon: <Building className="h-8 w-8 text-purple-600" />
    },
    {
      id: 3,
      name: 'Salary Distribution',
      description: 'Analysis of salary ranges across departments and positions',
      category: 'payroll',
      lastGenerated: '12 Apr 2025',
      icon: <DollarSign className="h-8 w-8 text-green-600" />
    },
    {
      id: 4,
      name: 'Payroll Summary',
      description: 'Monthly payroll expenses broken down by department',
      category: 'payroll',
      lastGenerated: '1 Apr 2025',
      icon: <FilePieChart className="h-8 w-8 text-green-600" />
    },
    {
      id: 5,
      name: 'Leave Balance Report',
      description: 'Overview of remaining leave balances for all employees',
      category: 'attendance',
      lastGenerated: '5 Apr 2025',
      icon: <Calendar className="h-8 w-8 text-amber-600" />
    },
    {
      id: 6,
      name: 'Visa Expiry Report',
      description: 'List of employees with upcoming visa expirations',
      category: 'compliance',
      icon: <FileText className="h-8 w-8 text-red-600" />
    },
    {
      id: 7,
      name: 'New Hires Report',
      description: 'Summary of employees hired in the selected time period',
      category: 'recruitment',
      lastGenerated: '8 Apr 2025',
      icon: <UserPlus className="h-8 w-8 text-indigo-600" />
    },
    {
      id: 8,
      name: 'Turnover Report',
      description: 'Analysis of employee departures and turnover rates',
      category: 'recruitment',
      icon: <UserMinus className="h-8 w-8 text-red-600" />
    },
    {
      id: 9,
      name: 'Performance Review Schedule',
      description: 'List of upcoming and overdue performance reviews',
      category: 'performance',
      icon: <UserCog className="h-8 w-8 text-blue-600" />
    },
  ];

  // Filter reports based on search query and category
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle report generation
  const handleGenerateReport = (report: ReportType) => {
    setSelectedReport(report);
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return dateString;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">HR Reports</h1>
          <p className="text-muted-foreground">Generate and manage human resource reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/hrm">
              <span className="mr-2">Back to Dashboard</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 md:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Input
                  type="search"
                  placeholder="Search reports..."
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
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="employees">Employees</SelectItem>
                  <SelectItem value="payroll">Payroll</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="recruitment">Recruitment</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Categories Tabs */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="recent">Recently Used</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {report.icon}
                  <div>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {report.description}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-sm text-muted-foreground">
                Category: <span className="capitalize">{report.category}</span>
              </div>
              {report.lastGenerated && (
                <div className="text-sm text-muted-foreground mt-1">
                  Last generated: {report.lastGenerated}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 flex justify-between items-center">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={() => handleGenerateReport(report)}
                disabled={isGenerating && selectedReport?.id === report.id}
              >
                {isGenerating && selectedReport?.id === report.id ? (
                  <>Generating...</>
                ) : (
                  <>
                    <FileText className="mr-1 h-3 w-3" />
                    Generate
                  </>
                )}
              </Button>
              {report.lastGenerated && (
                <Button variant="ghost" size="sm" className="text-xs">
                  <Download className="mr-1 h-3 w-3" />
                  Download
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            No reports found matching your search criteria.
          </div>
        </Card>
      )}

      {/* Generate Report Dialog */}
      {/* 
        This would be a dialog component for configuring report parameters before generation
        For now, we're just simulating report generation with a button click
      */}
    </div>
  );
};

export default HRReports;