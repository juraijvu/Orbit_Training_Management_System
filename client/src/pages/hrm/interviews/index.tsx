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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Search, Filter, UserPlus, Calendar, Clock, Download, FileText, Printer, MoreHorizontal, PlusCircle, Mail, Pencil as Edit, Trash2 as Trash, CheckCircle, XCircle, Users } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';

// Types
interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: 'Scheduled' | 'Completed' | 'No Show' | 'Cancelled' | 'Hired' | 'Rejected';
  resumeUrl?: string;
  score?: number;
  feedback?: string;
}

interface InterviewManagementProps {
  showAddDialog?: boolean;
}

interface Interview {
  id: number;
  candidateId: number;
  candidateName: string;
  position: string;
  date: string;
  time: string;
  duration: number; // in minutes
  interviewers: string[];
  status: 'Scheduled' | 'Completed' | 'No Show' | 'Cancelled';
  type: 'In Person' | 'Phone' | 'Video Call';
  location?: string;
  feedback?: string;
  decision?: 'Hired' | 'Rejected' | 'On Hold' | 'Next Round';
  score?: number;
}

const InterviewManagement: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [isAddInterviewOpen, setIsAddInterviewOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [newInterviewData, setNewInterviewData] = useState({
    candidateName: '',
    position: '',
    email: '',
    phone: '',
    interviewDate: '',
    interviewTime: '',
    interviewType: 'In-person',
    interviewer: '',
    status: 'Scheduled',
    resume: '',
    notes: ''
  });

  // Mock data
  const { data: interviews, isLoading } = useQuery<Interview[]>({
    queryKey: ['/api/hrm/interviews'],
    queryFn: async () => {
      // Mocked data
      return [
        {
          id: 1,
          candidateId: 101,
          candidateName: 'Ahmed Khalid',
          position: 'Senior Trainer',
          date: '2025-04-25',
          time: '10:00',
          duration: 60,
          interviewers: ['Sara Al Jaber', 'Mohammed Rahman'],
          status: 'Scheduled',
          type: 'In Person',
          location: 'Dubai Office - Meeting Room 3'
        },
        {
          id: 2,
          candidateId: 102,
          candidateName: 'Layla Mahmoud',
          position: 'Marketing Specialist',
          date: '2025-04-20',
          time: '14:30',
          duration: 45,
          interviewers: ['Rahul Patel'],
          status: 'Completed',
          type: 'Video Call',
          feedback: 'Strong communication skills, good knowledge of digital marketing strategies. Needs more experience with analytics tools.',
          decision: 'Next Round',
          score: 8
        },
        {
          id: 3,
          candidateId: 103,
          candidateName: 'John Smith',
          position: 'IT Support Specialist',
          date: '2025-04-18',
          time: '11:00',
          duration: 60,
          interviewers: ['Aisha Khan', 'Priya Singh'],
          status: 'Completed',
          type: 'In Person',
          location: 'Dubai Office - Meeting Room 1',
          feedback: 'Excellent technical knowledge, answered all technical questions correctly. Good problem-solving skills.',
          decision: 'Hired',
          score: 9
        },
        {
          id: 4,
          candidateId: 104,
          candidateName: 'Fatima Ali',
          position: 'Administrative Assistant',
          date: '2025-04-22',
          time: '09:30',
          duration: 45,
          interviewers: ['Sara Al Jaber'],
          status: 'Scheduled',
          type: 'Phone',
          location: 'Phone Interview'
        },
        {
          id: 5,
          candidateId: 105,
          candidateName: 'Mohammed Al Hashimi',
          position: 'Finance Manager',
          date: '2025-04-15',
          time: '13:00',
          duration: 90,
          interviewers: ['Ahmed Abdullah', 'Priya Singh'],
          status: 'No Show',
          type: 'In Person',
          location: 'Dubai Office - Meeting Room 2'
        },
        {
          id: 6,
          candidateId: 106,
          candidateName: 'Sarah Johnson',
          position: 'Course Advisor',
          date: '2025-04-19',
          time: '15:00',
          duration: 60,
          interviewers: ['Rahul Patel', 'Mohammed Rahman'],
          status: 'Cancelled',
          type: 'Video Call'
        },
        {
          id: 7,
          candidateId: 107,
          candidateName: 'Ali Hassan',
          position: 'Senior Trainer',
          date: '2025-04-17',
          time: '10:00',
          duration: 60,
          interviewers: ['Ahmed Abdullah'],
          status: 'Completed',
          type: 'In Person',
          location: 'Dubai Office - Meeting Room 3',
          feedback: 'Excellent teaching skills, good domain knowledge, but needs more experience with online teaching tools.',
          decision: 'On Hold',
          score: 7
        }
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Derive positions from interviews data
  const positions = interviews ? Array.from(new Set(interviews.map(i => i.position))) : [];

  // Filter interviews based on search and filters
  const filteredInterviews = interviews?.filter(interview => {
    const matchesSearch = searchQuery === '' || 
      interview.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    const matchesPosition = positionFilter === 'all' || interview.position === positionFilter;
    
    return matchesSearch && matchesStatus && matchesPosition;
  });

  // Get upcoming interviews (next 7 days)
  const upcomingInterviews = interviews?.filter(interview => {
    const interviewDate = parseISO(interview.date);
    const now = new Date();
    const nextWeek = addDays(now, 7);
    return (
      interview.status === 'Scheduled' && 
      isAfter(interviewDate, now) && 
      isBefore(interviewDate, nextWeek)
    );
  });

  // Format date and time
  const formatDateTime = (date: string, time: string) => {
    return `${format(parseISO(date), 'dd MMM yyyy')} at ${time}`;
  };

  // Get appropriate badge for interview status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{status}</Badge>;
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{status}</Badge>;
      case 'No Show':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{status}</Badge>;
      case 'Cancelled':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get appropriate badge for decision
  const getDecisionBadge = (decision?: string) => {
    if (!decision) return null;
    
    switch (decision) {
      case 'Hired':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{decision}</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{decision}</Badge>;
      case 'On Hold':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">{decision}</Badge>;
      case 'Next Round':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{decision}</Badge>;
      default:
        return <Badge>{decision}</Badge>;
    }
  };

  // Add new interview handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setNewInterviewData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setNewInterviewData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddInterview = () => {
    // Here we would normally send this data to the backend
    console.log('Scheduling new interview:', newInterviewData);
    
    // In a real application, you would add API call here
    // For now, just close the dialog
    setIsAddInterviewOpen(false);
    
    // Reset form data
    setNewInterviewData({
      candidateName: '',
      position: '',
      email: '',
      phone: '',
      interviewDate: '',
      interviewTime: '',
      interviewType: 'In-person',
      interviewer: '',
      status: 'Scheduled',
      resume: '',
      notes: ''
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Interview Management</h1>
          <p className="text-muted-foreground">
            Schedule, track, and manage candidate interviews
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
                <span>Print List</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isAddInterviewOpen} onOpenChange={setIsAddInterviewOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Schedule Interview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Interview</DialogTitle>
                <DialogDescription>
                  Enter the details to schedule a new candidate interview.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="candidateName">Candidate Name*</Label>
                  <Input 
                    id="candidateName" 
                    placeholder="Full name" 
                    value={newInterviewData.candidateName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email*</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="email@example.com" 
                      value={newInterviewData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone*</Label>
                    <Input 
                      id="phone" 
                      placeholder="+971 5X XXX XXXX" 
                      value={newInterviewData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position*</Label>
                  <Select 
                    value={newInterviewData.position}
                    onValueChange={(value) => handleSelectChange('position', value)}
                  >
                    <SelectTrigger id="position">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Senior Trainer">Senior Trainer</SelectItem>
                      <SelectItem value="Marketing Specialist">Marketing Specialist</SelectItem>
                      <SelectItem value="IT Support Specialist">IT Support Specialist</SelectItem>
                      <SelectItem value="Administrative Assistant">Administrative Assistant</SelectItem>
                      <SelectItem value="Finance Manager">Finance Manager</SelectItem>
                      <SelectItem value="Course Advisor">Course Advisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="interviewDate">Date*</Label>
                    <Input 
                      id="interviewDate" 
                      type="date" 
                      value={newInterviewData.interviewDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interviewTime">Time*</Label>
                    <Input 
                      id="interviewTime" 
                      type="time" 
                      value={newInterviewData.interviewTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)*</Label>
                    <Input 
                      id="duration" 
                      type="number" 
                      defaultValue="60" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interviewType">Interview Type*</Label>
                    <Select
                      value={newInterviewData.interviewType}
                      onValueChange={(value) => handleSelectChange('interviewType', value)}
                    >
                      <SelectTrigger id="interviewType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In-person">In Person</SelectItem>
                        <SelectItem value="Phone">Phone</SelectItem>
                        <SelectItem value="Video Call">Video Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interviewer">Interviewers*</Label>
                  <Input 
                    id="interviewer" 
                    placeholder="Select interviewers" 
                    value={newInterviewData.interviewer}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Additional notes" 
                    value={newInterviewData.notes}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddInterviewOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddInterview}>
                  Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Calendar className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Interviews</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '-' : interviews?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <Clock className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '-' : upcomingInterviews?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '-' : 
                    interviews?.filter(i => i.status === 'Completed').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <XCircle className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">No Show / Cancelled</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '-' : 
                    interviews?.filter(i => i.status === 'No Show' || i.status === 'Cancelled').length || 0}
                </p>
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
                  placeholder="Search candidates or positions..."
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
                value={positionFilter} 
                onValueChange={setPositionFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
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
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="No Show">No Show</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Interviews</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="feedback">Needs Feedback</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Interview Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Interviewers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    Loading interviews...
                  </TableCell>
                </TableRow>
              ) : filteredInterviews?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    No interviews found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInterviews?.map((interview) => (
                  <TableRow key={interview.id}>
                    <TableCell className="font-medium">
                      {interview.candidateName}
                    </TableCell>
                    <TableCell>{interview.position}</TableCell>
                    <TableCell>{formatDateTime(interview.date, interview.time)}</TableCell>
                    <TableCell>{interview.type}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        {interview.interviewers.map((interviewer, idx) => (
                          <span key={idx} className="text-sm">{interviewer}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(interview.status)}</TableCell>
                    <TableCell>{interview.decision ? getDecisionBadge(interview.decision) : '-'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {interview.status === 'Scheduled' && (
                            <>
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>Reschedule</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <XCircle className="mr-2 h-4 w-4" />
                                <span>Mark as No Show</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                <span>Send Reminder</span>
                              </DropdownMenuItem>
                            </>
                          )}
                          {interview.status === 'Completed' && !interview.feedback && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedInterview(interview);
                              setIsFeedbackDialogOpen(true);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Add Feedback</span>
                            </DropdownMenuItem>
                          )}
                          {interview.status === 'Completed' && interview.feedback && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedInterview(interview);
                              setIsFeedbackDialogOpen(true);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Feedback</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
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

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackDialogOpen && selectedInterview !== null} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Interview Feedback</DialogTitle>
            <DialogDescription>
              {selectedInterview?.candidateName} - {selectedInterview?.position}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea 
                id="feedback" 
                placeholder="Enter interview feedback" 
                rows={5}
                defaultValue={selectedInterview?.feedback || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="decision">Decision</Label>
              <Select defaultValue={selectedInterview?.decision}>
                <SelectTrigger>
                  <SelectValue placeholder="Select decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hired">Hired</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Next Round">Next Round</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="score">Interview Score (1-10)</Label>
              <Input 
                id="score" 
                type="number" 
                min={1} 
                max={10} 
                defaultValue={selectedInterview?.score || 5} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeedbackDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsFeedbackDialogOpen(false)}>
              Save Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InterviewManagement;