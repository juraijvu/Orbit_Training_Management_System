import { FC, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon, Search, Filter, UserPlus, Calendar, Clock, Download, FileText, Printer, MoreHorizontal, PlusCircle, Mail, Upload, Users, Building, User, Briefcase, Award, MapPin, Phone, AtSign, FileUp, Clipboard, UserCheck, FileEdit, Trash2, ShieldCheck, Star, UserX } from 'lucide-react';
import { format, parseISO, differenceInMonths, differenceInDays, addMonths } from 'date-fns';

// Types
interface StaffMember {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  joiningDate: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Probation';
  status: 'Active' | 'On Leave' | 'Inactive' | 'Terminated';
  address?: string;
  workLocation: string;
  manager?: string;
  skills: string[];
  certifications?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  documents?: {
    type: string;
    fileName: string;
    uploadDate: string;
  }[];
  performanceRating?: number; // 1-5
  lastReviewDate?: string;
  leaveBalance?: number; // days
  probationEndDate?: string;
  notes?: string;
}

const StaffManagement: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false);
  const [isUploadDocumentOpen, setIsUploadDocumentOpen] = useState(false);
  const [newStaffData, setNewStaffData] = useState({
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    joiningDate: '',
    employmentType: '',
    status: 'Active',
    workLocation: '',
    address: ''
  });

  // Mock data
  const { data: staffMembers, isLoading } = useQuery<StaffMember[]>({
    queryKey: ['/api/hrm/staff'],
    queryFn: async () => {
      // Mocked data
      return [
        {
          id: 1,
          name: 'Ahmed Abdullah',
          position: 'Lead Trainer',
          department: 'Training',
          email: 'ahmed.abdullah@orbitinstitute.ae',
          phone: '+971 50 123 4567',
          joiningDate: '2022-03-15',
          employmentType: 'Full-time',
          status: 'Active',
          address: '123 Al Wasl Road, Dubai, UAE',
          workLocation: 'Dubai Office',
          manager: 'Mohammed Al Hashimi',
          skills: ['Cybersecurity', 'Network Administration', 'Python Programming'],
          certifications: ['Certified Ethical Hacker', 'AWS Certified Solutions Architect'],
          emergencyContact: {
            name: 'Fatima Abdullah',
            relationship: 'Spouse',
            phone: '+971 50 765 4321'
          },
          documents: [
            {
              type: 'Employment Contract',
              fileName: 'contract_ahmed.pdf',
              uploadDate: '2022-03-15'
            },
            {
              type: 'Passport Copy',
              fileName: 'passport_ahmed.pdf',
              uploadDate: '2022-03-15'
            }
          ],
          performanceRating: 4.5,
          lastReviewDate: '2024-12-20',
          leaveBalance: 18,
          notes: 'Excellent trainer, consistently receives high ratings from students'
        },
        {
          id: 2,
          name: 'Priya Kumar',
          position: 'Operations Manager',
          department: 'Operations',
          email: 'priya.kumar@orbitinstitute.ae',
          phone: '+971 50 987 6543',
          joiningDate: '2021-06-10',
          employmentType: 'Full-time',
          status: 'On Leave',
          address: '456 Sheikh Zayed Road, Dubai, UAE',
          workLocation: 'Dubai Office',
          skills: ['Project Management', 'Operations', 'Team Leadership'],
          certifications: ['PMP', 'Six Sigma Green Belt'],
          emergencyContact: {
            name: 'Raj Kumar',
            relationship: 'Spouse',
            phone: '+971 50 876 5432'
          },
          documents: [
            {
              type: 'Employment Contract',
              fileName: 'contract_priya.pdf',
              uploadDate: '2021-06-10'
            }
          ],
          performanceRating: 4.7,
          lastReviewDate: '2024-11-15',
          leaveBalance: 12,
          notes: 'Highly effective manager, greatly improved operational efficiency'
        },
        {
          id: 3,
          name: 'Mohammed Al Hashimi',
          position: 'Training Director',
          department: 'Training',
          email: 'mohammed.alhashimi@orbitinstitute.ae',
          phone: '+971 50 345 6789',
          joiningDate: '2020-01-15',
          employmentType: 'Full-time',
          status: 'Active',
          workLocation: 'Dubai Office',
          skills: ['Educational Leadership', 'Curriculum Development', 'Strategic Planning'],
          certifications: ['Ed.D in Educational Leadership'],
          performanceRating: 4.8,
          lastReviewDate: '2025-01-10',
          leaveBalance: 22
        },
        {
          id: 4,
          name: 'Sara Ali',
          position: 'HR Specialist',
          department: 'Human Resources',
          email: 'sara.ali@orbitinstitute.ae',
          phone: '+971 50 234 5678',
          joiningDate: '2023-02-01',
          employmentType: 'Full-time',
          status: 'Active',
          workLocation: 'Dubai Office',
          manager: 'John Smith',
          skills: ['Recruitment', 'Employee Relations', 'HR Policies'],
          documents: [
            {
              type: 'Employment Contract',
              fileName: 'contract_sara.pdf',
              uploadDate: '2023-02-01'
            }
          ],
          performanceRating: 4.2,
          lastReviewDate: '2024-12-05',
          leaveBalance: 15
        },
        {
          id: 5,
          name: 'John Smith',
          position: 'HR Manager',
          department: 'Human Resources',
          email: 'john.smith@orbitinstitute.ae',
          phone: '+971 50 456 7890',
          joiningDate: '2021-09-20',
          employmentType: 'Full-time',
          status: 'Active',
          workLocation: 'Dubai Office',
          skills: ['HR Management', 'Organizational Development', 'Talent Acquisition'],
          certifications: ['SHRM-SCP', 'HR Management Certificate'],
          performanceRating: 4.5,
          lastReviewDate: '2024-11-20',
          leaveBalance: 16
        },
        {
          id: 6,
          name: 'Aisha Khan',
          position: 'IT Support Specialist',
          department: 'IT',
          email: 'aisha.khan@orbitinstitute.ae',
          phone: '+971 50 567 8901',
          joiningDate: '2023-05-10',
          employmentType: 'Full-time',
          status: 'Active',
          workLocation: 'Dubai Office',
          manager: 'Rahul Patel',
          skills: ['Technical Support', 'Network Troubleshooting', 'Hardware Maintenance'],
          probationEndDate: '2023-08-10',
          performanceRating: 3.8,
          lastReviewDate: '2024-10-15',
          leaveBalance: 14
        },
        {
          id: 7,
          name: 'Rahul Patel',
          position: 'IT Manager',
          department: 'IT',
          email: 'rahul.patel@orbitinstitute.ae',
          phone: '+971 50 678 9012',
          joiningDate: '2022-07-01',
          employmentType: 'Full-time',
          status: 'Active',
          workLocation: 'Dubai Office',
          skills: ['IT Management', 'System Administration', 'Cybersecurity'],
          certifications: ['CISSP', 'ITIL Foundation'],
          performanceRating: 4.6,
          lastReviewDate: '2024-12-10',
          leaveBalance: 18
        },
        {
          id: 8,
          name: 'Fatima Al Mansoori',
          position: 'Marketing Specialist',
          department: 'Marketing',
          email: 'fatima.almansoori@orbitinstitute.ae',
          phone: '+971 50 789 0123',
          joiningDate: '2023-08-15',
          employmentType: 'Probation',
          status: 'Active',
          workLocation: 'Dubai Office',
          manager: 'Layla Mahmoud',
          skills: ['Digital Marketing', 'Social Media', 'Content Creation'],
          probationEndDate: '2024-02-15',
          performanceRating: 3.9,
          leaveBalance: 8
        },
        {
          id: 9,
          name: 'Layla Mahmoud',
          position: 'Marketing Manager',
          department: 'Marketing',
          email: 'layla.mahmoud@orbitinstitute.ae',
          phone: '+971 50 890 1234',
          joiningDate: '2022-10-01',
          employmentType: 'Full-time',
          status: 'Active',
          workLocation: 'Dubai Office',
          skills: ['Marketing Strategy', 'Brand Management', 'Analytics'],
          certifications: ['Digital Marketing Certificate'],
          performanceRating: 4.4,
          lastReviewDate: '2024-11-25',
          leaveBalance: 16
        },
        {
          id: 10,
          name: 'Ali Hassan',
          position: 'Finance Officer',
          department: 'Finance',
          email: 'ali.hassan@orbitinstitute.ae',
          phone: '+971 50 901 2345',
          joiningDate: '2023-01-15',
          employmentType: 'Full-time',
          status: 'Active',
          workLocation: 'Dubai Office',
          manager: 'Fahad Al Mansouri',
          skills: ['Accounting', 'Financial Reporting', 'Budgeting'],
          performanceRating: 4.1,
          lastReviewDate: '2024-12-01',
          leaveBalance: 14
        },
        {
          id: 11,
          name: 'Fahad Al Mansouri',
          position: 'Finance Manager',
          department: 'Finance',
          email: 'fahad.almansouri@orbitinstitute.ae',
          phone: '+971 50 012 3456',
          joiningDate: '2021-11-01',
          employmentType: 'Full-time',
          status: 'Active',
          workLocation: 'Dubai Office',
          skills: ['Financial Management', 'Strategic Planning', 'Risk Assessment'],
          certifications: ['CPA', 'MBA in Finance'],
          performanceRating: 4.7,
          lastReviewDate: '2024-11-30',
          leaveBalance: 19
        },
        {
          id: 12,
          name: 'Sarah Johnson',
          position: 'Administrative Assistant',
          department: 'Administration',
          email: 'sarah.johnson@orbitinstitute.ae',
          phone: '+971 50 123 4567',
          joiningDate: '2023-07-01',
          employmentType: 'Part-time',
          status: 'Active',
          workLocation: 'Dubai Office',
          manager: 'Priya Kumar',
          skills: ['Office Administration', 'Calendar Management', 'Document Processing'],
          performanceRating: 4.0,
          lastReviewDate: '2024-11-05',
          leaveBalance: 10
        }
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get departments from staff data
  const departments = staffMembers 
    ? Array.from(new Set(staffMembers.map(staff => staff.department))) 
    : [];

  // Filter staff members based on search and filters
  const filteredStaff = staffMembers?.filter(staff => {
    const matchesSearch = searchQuery === '' || 
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || staff.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || staff.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(parseISO(dateString), 'dd MMM yyyy');
  };

  // Get appropriate badge for staff status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{status}</Badge>;
      case 'On Leave':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{status}</Badge>;
      case 'Inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
      case 'Terminated':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get appropriate badge for employment type
  const getEmploymentTypeBadge = (type: string) => {
    switch (type) {
      case 'Full-time':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{type}</Badge>;
      case 'Part-time':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">{type}</Badge>;
      case 'Contract':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">{type}</Badge>;
      case 'Probation':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{type}</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  // Get employment duration
  const getEmploymentDuration = (joiningDate: string) => {
    const start = parseISO(joiningDate);
    const now = new Date();
    const months = differenceInMonths(now, start);
    
    if (months < 12) {
      return `${months} month${months === 1 ? '' : 's'}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} year${years === 1 ? '' : 's'}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}` : ''}`;
    }
  };

  // Calculate probation status
  const getProbationStatus = (staff: StaffMember) => {
    if (staff.employmentType !== 'Probation' || !staff.probationEndDate) {
      return null;
    }
    
    const endDate = parseISO(staff.probationEndDate);
    const now = new Date();
    const daysLeft = differenceInDays(endDate, now);
    
    if (daysLeft < 0) {
      return <Badge className="bg-red-100 text-red-800">Probation Ended</Badge>;
    } else if (daysLeft <= 7) {
      return <Badge className="bg-amber-100 text-amber-800">Due in {daysLeft} days</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Ends {formatDate(staff.probationEndDate)}</Badge>;
    }
  };

  // Get staff count by department
  const getStaffCountByDepartment = () => {
    if (!staffMembers) return [];
    
    const counts: {[key: string]: number} = {};
    staffMembers.forEach(staff => {
      counts[staff.department] = (counts[staff.department] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Get total staff count by status
  const getStaffCountByStatus = () => {
    if (!staffMembers) return { active: 0, onLeave: 0, inactive: 0, terminated: 0, total: 0 };
    
    return {
      active: staffMembers.filter(s => s.status === 'Active').length,
      onLeave: staffMembers.filter(s => s.status === 'On Leave').length,
      inactive: staffMembers.filter(s => s.status === 'Inactive').length,
      terminated: staffMembers.filter(s => s.status === 'Terminated').length,
      total: staffMembers.length
    };
  };

  // Handle view staff details
  const handleViewDetails = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsViewDetailsOpen(true);
  };

  // Handle edit staff details
  const handleEditStaff = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsEditStaffOpen(true);
  };

  // Handle upload document
  const handleUploadDocument = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsUploadDocumentOpen(true);
  };

  const statusCounts = getStaffCountByStatus();
  const departmentCounts = getStaffCountByDepartment();

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage employee records, documents, and performance
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
                <span>Print Staff List</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild variant="outline">
            <Link href="/visa-management">
              <Clipboard className="mr-2 h-4 w-4" />
              Visa Management
            </Link>
          </Button>
          <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>
                  Enter the details to add a new staff member to the system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name*</Label>
                  <Input id="name" placeholder="Full name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position*</Label>
                    <Input id="position" placeholder="Job title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department*</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="admin">Administration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email*</Label>
                    <Input id="email" type="email" placeholder="email@orbitinstitute.ae" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone*</Label>
                    <Input id="phone" placeholder="+971 5X XXX XXXX" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="joiningDate">Joining Date*</Label>
                    <Input id="joiningDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Employment Type*</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fulltime">Full-time</SelectItem>
                        <SelectItem value="parttime">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="probation">Probation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status*</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="onleave">On Leave</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workLocation">Work Location*</Label>
                    <Input id="workLocation" placeholder="Office location" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Manager</Label>
                  <Input id="manager" placeholder="Manager's name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma separated)</Label>
                  <Input id="skills" placeholder="Skills, competencies" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" placeholder="Full address" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddStaffOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddStaffOpen(false)}>
                  Add Staff
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '-' : statusCounts.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <UserCheck className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '-' : statusCounts.active}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-amber-100 p-3">
                <Clock className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '-' : statusCounts.onLeave}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 p-3">
                <Building className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '-' : departments.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Distribution */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Staff allocation across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Loading department data...</div>
              ) : (
                departmentCounts.map(({ department, count }) => (
                  <div key={department} className="flex items-center">
                    <div className="w-36 flex-shrink-0">{department}</div>
                    <div className="flex-1 mx-2">
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-primary h-3 rounded-full" 
                          style={{ width: `${(count / statusCounts.total) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-10 text-muted-foreground text-right">{count}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Staff metrics and indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Full-time Staff</div>
                <div className="font-medium">
                  {isLoading ? '-' : staffMembers?.filter(s => s.employmentType === 'Full-time').length}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Part-time Staff</div>
                <div className="font-medium">
                  {isLoading ? '-' : staffMembers?.filter(s => s.employmentType === 'Part-time').length}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Probation</div>
                <div className="font-medium">
                  {isLoading ? '-' : staffMembers?.filter(s => s.employmentType === 'Probation').length}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Contract</div>
                <div className="font-medium">
                  {isLoading ? '-' : staffMembers?.filter(s => s.employmentType === 'Contract').length}
                </div>
              </div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Avg. Performance</div>
                <div className="font-medium">
                  {isLoading ? '-' : staffMembers && staffMembers.length > 0 ? (
                    (staffMembers
                      .filter(s => s.performanceRating !== undefined)
                      .reduce((sum, s) => sum + (s.performanceRating || 0), 0) /
                    (staffMembers.filter(s => s.performanceRating !== undefined).length || 1))
                      .toFixed(1)
                  ) : '-'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
                  placeholder="Search staff by name, position, or email..."
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
                  {departments.map(department => (
                    <SelectItem key={department} value={department}>{department}</SelectItem>
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
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="allstaff" className="mb-6">
        <TabsList>
          <TabsTrigger value="allstaff">All Staff</TabsTrigger>
          <TabsTrigger value="probation">Probation</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Staff Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Employment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    Loading staff data...
                  </TableCell>
                </TableRow>
              ) : filteredStaff?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    No staff members found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff?.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>{staff.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{staff.position}</TableCell>
                    <TableCell>{staff.department}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getEmploymentTypeBadge(staff.employmentType)}
                        {staff.employmentType === 'Probation' && getProbationStatus(staff)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(staff.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatDate(staff.joiningDate)}</span>
                        <span className="text-xs text-muted-foreground">
                          {getEmploymentDuration(staff.joiningDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="flex items-center">
                          <AtSign className="h-3 w-3 mr-1" /> {staff.email.split('@')[0]}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" /> {staff.phone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(staff)}>
                            <User className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditStaff(staff)}>
                            <FileEdit className="mr-2 h-4 w-4" />
                            <span>Edit Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUploadDocument(staff)}>
                            <Upload className="mr-2 h-4 w-4" />
                            <span>Upload Document</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Award className="mr-2 h-4 w-4" />
                            <span>Add Performance Review</span>
                          </DropdownMenuItem>
                          {staff.status === 'Active' && (
                            <DropdownMenuItem>
                              <Clock className="mr-2 h-4 w-4" />
                              <span>Mark as On Leave</span>
                            </DropdownMenuItem>
                          )}
                          {staff.status === 'On Leave' && (
                            <DropdownMenuItem>
                              <UserCheck className="mr-2 h-4 w-4" />
                              <span>Mark as Active</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <UserX className="mr-2 h-4 w-4" />
                            <span>Mark as Inactive</span>
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
      </Card>

      {/* View Staff Details Dialog */}
      <Dialog open={isViewDetailsOpen && selectedStaff !== null} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about the employee.
            </DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <div className="py-4">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedStaff.name}</h3>
                  <p className="text-muted-foreground">{selectedStaff.position}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(selectedStaff.status)}
                    {getEmploymentTypeBadge(selectedStaff.employmentType)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    setIsViewDetailsOpen(false);
                    handleEditStaff(selectedStaff);
                  }}>
                    <FileEdit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setIsViewDetailsOpen(false);
                    handleUploadDocument(selectedStaff);
                  }}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Personal Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <div className="w-32 text-sm text-muted-foreground">Department</div>
                      <div className="flex-1">{selectedStaff.department}</div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-32 text-sm text-muted-foreground">Email</div>
                      <div className="flex-1">{selectedStaff.email}</div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-32 text-sm text-muted-foreground">Phone</div>
                      <div className="flex-1">{selectedStaff.phone}</div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-32 text-sm text-muted-foreground">Address</div>
                      <div className="flex-1">{selectedStaff.address || '-'}</div>
                    </div>
                    {selectedStaff.emergencyContact && (
                      <div className="flex items-start">
                        <div className="w-32 text-sm text-muted-foreground">Emergency</div>
                        <div className="flex-1">
                          {selectedStaff.emergencyContact.name} ({selectedStaff.emergencyContact.relationship})<br />
                          {selectedStaff.emergencyContact.phone}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Employment Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <div className="w-32 text-sm text-muted-foreground">Joined</div>
                      <div className="flex-1">{formatDate(selectedStaff.joiningDate)} ({getEmploymentDuration(selectedStaff.joiningDate)})</div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-32 text-sm text-muted-foreground">Manager</div>
                      <div className="flex-1">{selectedStaff.manager || '-'}</div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-32 text-sm text-muted-foreground">Work Location</div>
                      <div className="flex-1">{selectedStaff.workLocation}</div>
                    </div>
                    {selectedStaff.employmentType === 'Probation' && selectedStaff.probationEndDate && (
                      <div className="flex items-start">
                        <div className="w-32 text-sm text-muted-foreground">Probation</div>
                        <div className="flex-1">{formatDate(selectedStaff.probationEndDate)}</div>
                      </div>
                    )}
                    <div className="flex items-start">
                      <div className="w-32 text-sm text-muted-foreground">Leave Balance</div>
                      <div className="flex-1">{selectedStaff.leaveBalance !== undefined ? `${selectedStaff.leaveBalance} days` : '-'}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Skills & Qualifications</h4>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <div className="w-32 text-sm text-muted-foreground">Skills</div>
                      <div className="flex-1 flex flex-wrap gap-1">
                        {selectedStaff.skills.map((skill, index) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    {selectedStaff.certifications && (
                      <div className="flex items-start">
                        <div className="w-32 text-sm text-muted-foreground">Certifications</div>
                        <div className="flex-1">
                          <ul className="list-disc pl-4">
                            {selectedStaff.certifications.map((cert, index) => (
                              <li key={index}>{cert}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Performance</h4>
                  <div className="space-y-2">
                    {selectedStaff.performanceRating !== undefined && (
                      <div className="flex items-start">
                        <div className="w-32 text-sm text-muted-foreground">Rating</div>
                        <div className="flex-1 flex items-center">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(selectedStaff.performanceRating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm">({selectedStaff.performanceRating}/5)</span>
                        </div>
                      </div>
                    )}
                    {selectedStaff.lastReviewDate && (
                      <div className="flex items-start">
                        <div className="w-32 text-sm text-muted-foreground">Last Review</div>
                        <div className="flex-1">{formatDate(selectedStaff.lastReviewDate)}</div>
                      </div>
                    )}
                    {selectedStaff.notes && (
                      <div className="flex items-start">
                        <div className="w-32 text-sm text-muted-foreground">Notes</div>
                        <div className="flex-1">{selectedStaff.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedStaff.documents && selectedStaff.documents.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium mb-3">Documents</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Type</TableHead>
                        <TableHead>Filename</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedStaff.documents.map((doc, index) => (
                        <TableRow key={index}>
                          <TableCell>{doc.type}</TableCell>
                          <TableCell>{doc.fileName}</TableCell>
                          <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={isUploadDocumentOpen && selectedStaff !== null} onOpenChange={setIsUploadDocumentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document for {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="docType">Document Type*</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Employment Contract</SelectItem>
                  <SelectItem value="passport">Passport Copy</SelectItem>
                  <SelectItem value="visa">Visa Copy</SelectItem>
                  <SelectItem value="emirates">Emirates ID</SelectItem>
                  <SelectItem value="certificate">Certificate/Degree</SelectItem>
                  <SelectItem value="medical">Medical Insurance</SelectItem>
                  <SelectItem value="evaluation">Performance Evaluation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="docFile">Document File*</Label>
              <Input id="docFile" type="file" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="docDescription">Description</Label>
              <Textarea id="docDescription" placeholder="Additional notes about this document" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDocumentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsUploadDocumentOpen(false)}>
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagement;