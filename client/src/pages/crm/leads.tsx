import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Calendar,
  User,
  FileText,
  Trash,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
  Clock,
  Bell,
  CalendarClock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export default function LeadsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [editMode, setEditMode] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    source: "",
    interestedCourse: "",
    notes: "",
    status: "New",
    followUpDate: null,
    followUpStatus: "None"
  });
  
  // Follow-up form state
  const [followUpFormOpen, setFollowUpFormOpen] = useState(false);
  const [followUpData, setFollowUpData] = useState({
    leadId: null,
    notes: "",
    followUpDate: new Date(),
    followUpTime: "",
    priority: "Medium",
    status: "Pending"
  });

  // Query to fetch leads
  const { 
    data: leads = [], 
    isLoading 
  } = useQuery({
    queryKey: ['/api/crm/leads'],
  });
  
  // Query to fetch courses for dropdown
  const {
    data: courses = []
  } = useQuery({
    queryKey: ['/api/courses'],
  });
  
  // Create lead mutation
  const createLeadMutation = useMutation({
    mutationFn: async (leadData) => {
      const response = await apiRequest("POST", "/api/crm/leads", leadData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/leads'] });
      toast({
        title: "Success",
        description: "Lead added successfully!",
      });
      resetForm();
      setOpenDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add lead: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest("PATCH", `/api/crm/leads/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/leads'] });
      toast({
        title: "Success",
        description: "Lead updated successfully!",
      });
      resetForm();
      setOpenDialog(false);
      setEditMode(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update lead: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Delete lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiRequest("DELETE", `/api/crm/leads/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/leads'] });
      toast({
        title: "Success",
        description: "Lead deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete lead: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Handle input change in form
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };
  
  // Handle select change in form
  const handleSelectChange = (id, value) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };
  
  // Reset form 
  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      source: "",
      interestedCourse: "",
      notes: "",
      status: "New",
      followUpDate: null,
      followUpStatus: "None"
    });
    setSelectedLead(null);
  };
  
  // Reset follow-up form
  const resetFollowUpForm = () => {
    setFollowUpData({
      leadId: null,
      notes: "",
      followUpDate: new Date(),
      followUpTime: "",
      priority: "Medium",
      status: "Pending"
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.phone) {
      toast({
        title: "Validation Error",
        description: "Full name and phone are required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (editMode && selectedLead) {
      updateLeadMutation.mutate({ 
        id: selectedLead.id, 
        data: {
          ...formData,
          interestedCourses: formData.interestedCourse ? `[${formData.interestedCourse}]` : "[]"
        }
      });
    } else {
      createLeadMutation.mutate({
        ...formData,
        consultantId: user?.id || 1, // Use current user ID as consultant
        interestedCourses: formData.interestedCourse ? `[${formData.interestedCourse}]` : "[]"
      });
    }
  };
  
  // Handle edit lead
  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setFormData({
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email || "",
      source: lead.source || "",
      interestedCourse: lead.interestedCourse?.toString() || "",
      notes: lead.notes || "",
      status: lead.status,
      followUpDate: lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate) : null,
      followUpStatus: lead.followUpStatus || "None"
    });
    setEditMode(true);
    setOpenDialog(true);
  };
  
  // Handle follow-up form
  const handleOpenFollowUpForm = (lead) => {
    setSelectedLead(lead);
    setFollowUpData({
      leadId: lead.id,
      notes: "",
      followUpDate: new Date(),
      followUpTime: new Date().toTimeString().slice(0, 5), // Current time in HH:MM format
      priority: "Medium",
      status: "Pending"
    });
    setFollowUpFormOpen(true);
  };
  
  // Filter leads based on search and status
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchQuery === "" || 
      lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Leads Management</h1>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Lead
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Lead Dashboard</CardTitle>
          <CardDescription>
            Manage and track potential customers interested in your courses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search leads..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select 
              defaultValue="all"
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Interested Highly">Interested Highly</SelectItem>
                <SelectItem value="Register Soon">Register Soon</SelectItem>
                <SelectItem value="Called Back">Called Back</SelectItem>
                <SelectItem value="Wrong Enquiry">Wrong Enquiry</SelectItem>
                <SelectItem value="Not Interested">Not Interested</SelectItem>
                <SelectItem value="Converted">Converted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No leads yet</h3>
              <p className="text-muted-foreground mt-2">
                Add your first lead to start tracking potential customers.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => {
                resetForm();
                setEditMode(false);
                setOpenDialog(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Add New Lead
              </Button>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <Search className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No matching leads</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search or filter criteria.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Interested In</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow 
                      key={lead.id}
                      className={`
                        ${lead.status === 'Interested Highly' ? 'bg-green-50' : ''}
                        ${lead.status === 'Register Soon' ? 'bg-purple-50' : ''}
                        ${lead.status === 'New' ? 'bg-blue-50' : ''}
                        ${lead.status === 'Called Back' ? 'bg-yellow-50' : ''}
                        ${lead.status === 'Not Interested' ? 'bg-red-50' : ''}
                        ${lead.status === 'Wrong Enquiry' ? 'bg-orange-50' : ''}
                        ${lead.status === 'Converted' ? 'bg-emerald-50' : ''}
                      `}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          {lead.fullName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-xs">
                            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                            {lead.phone}
                          </div>
                          {lead.email && (
                            <div className="flex items-center text-xs">
                              <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                              {lead.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`
                          px-2 py-1 rounded-full text-xs inline-flex items-center
                          ${lead.status === 'New' ? 'bg-blue-100 text-blue-800' : ''}
                          ${lead.status === 'Interested Highly' ? 'bg-green-100 text-green-800' : ''}
                          ${lead.status === 'Register Soon' ? 'bg-purple-100 text-purple-800' : ''}
                          ${lead.status === 'Wrong Enquiry' ? 'bg-orange-100 text-orange-800' : ''}
                          ${lead.status === 'Not Interested' ? 'bg-red-100 text-red-800' : ''}
                          ${lead.status === 'Called Back' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${lead.status === 'Converted' ? 'bg-emerald-100 text-emerald-800' : ''}
                        `}>
                          {lead.status}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.interestedCourse ? (
                          courses.find(c => c.id === lead.interestedCourse)?.name || 
                          `Course #${lead.interestedCourse}`
                        ) : 'Not specified'}
                      </TableCell>
                      <TableCell>
                        {lead.lastContactDate ? (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-sm">
                              {format(new Date(lead.lastContactDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not contacted</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.nextFollowUpDate ? (
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span className="text-sm">
                                {format(new Date(lead.nextFollowUpDate), 'MMM d, yyyy')}
                              </span>
                            </div>
                            {lead.nextFollowUpTime && (
                              <div className="flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{lead.nextFollowUpTime}</span>
                              </div>
                            )}
                            {lead.followupStatus && (
                              <div className={`
                                mt-1 px-2 py-0.5 rounded-full text-xs inline-flex items-center w-fit
                                ${lead.followupStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${lead.followupStatus === 'Completed' ? 'bg-green-100 text-green-800' : ''}
                                ${lead.followupStatus === 'No Response' ? 'bg-red-100 text-red-800' : ''}
                                ${lead.followupStatus === 'Missed' ? 'bg-orange-100 text-orange-800' : ''}
                                ${lead.followupStatus === 'Rescheduled' ? 'bg-blue-100 text-blue-800' : ''}
                              `}>
                                {lead.followupStatus}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-xs"
                              onClick={() => handleOpenFollowUpForm(lead)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Schedule
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditLead(lead)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Lead
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenFollowUpForm(lead)}>
                              <Calendar className="mr-2 h-4 w-4" />
                              Add Follow-up
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${lead.fullName}?`)) {
                                  deleteLeadMutation.mutate(lead.id);
                                }
                              }}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Lead
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Lead Dialog */}
      <Dialog open={openDialog} onOpenChange={(open) => {
        if (!open) {
          resetForm();
          setEditMode(false);
        }
        setOpenDialog(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Lead" : "Add New Lead"}</DialogTitle>
            <DialogDescription>
              {editMode 
                ? "Update the lead's information below." 
                : "Enter the details of the potential customer. Click save when you're done."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fullName" className="text-right">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+971 50 123 4567"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="col-span-3"
                  type="email"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="source" className="text-right">
                  Source
                </Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => handleSelectChange("source", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select lead source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                    <SelectItem value="Cold Call">Cold Call</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="interestedCourse" className="text-right">
                  Interested In
                </Label>
                <Select
                  value={formData.interestedCourse}
                  onValueChange={(value) => handleSelectChange("interestedCourse", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses && courses.length > 0 ? (
                      courses.map(course => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          {course.name}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="1">Web Development</SelectItem>
                        <SelectItem value="2">Digital Marketing</SelectItem>
                        <SelectItem value="3">Graphic Design</SelectItem>
                        <SelectItem value="4">Data Science</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {editMode && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Interested Highly">Interested Highly</SelectItem>
                      <SelectItem value="Register Soon">Register Soon</SelectItem>
                      <SelectItem value="Called Back">Called Back</SelectItem>
                      <SelectItem value="Wrong Enquiry">Wrong Enquiry</SelectItem>
                      <SelectItem value="Not Interested">Not Interested</SelectItem>
                      <SelectItem value="Converted">Converted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional information"
                  className="col-span-3"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="followUpDate" className="text-right">
                  Next Follow-up
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {formData.followUpDate ? (
                          format(formData.followUpDate, "PPP")
                        ) : (
                          <span className="text-muted-foreground">Select a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.followUpDate}
                        onSelect={(date) => 
                          setFormData((prev) => ({ ...prev, followUpDate: date }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {formData.followUpDate && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="followUpStatus" className="text-right">
                    Follow-up Status
                  </Label>
                  <Select
                    value={formData.followUpStatus}
                    onValueChange={(value) => handleSelectChange("followUpStatus", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Missed">Missed</SelectItem>
                      <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              {editMode && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setEditMode(false);
                    setOpenDialog(false);
                  }}
                  className="mr-2"
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit"
                disabled={createLeadMutation.isPending || updateLeadMutation.isPending}
              >
                {createLeadMutation.isPending || updateLeadMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    Saving...
                  </div>
                ) : (
                  <>{editMode ? "Update Lead" : "Save Lead"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Follow-up Dialog */}
      <Dialog open={followUpFormOpen} onOpenChange={(open) => {
        if (!open) {
          resetFollowUpForm();
        }
        setFollowUpFormOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Follow-up</DialogTitle>
            <DialogDescription>
              Schedule a follow-up for {selectedLead?.fullName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (followUpData.leadId && followUpData.followUpDate) {
              const combinedDateTime = new Date(followUpData.followUpDate);
              const [hours, minutes] = followUpData.followUpTime.split(':');
              combinedDateTime.setHours(parseInt(hours), parseInt(minutes));
              
              // Create follow-up record
              const followUpRecord = {
                leadId: followUpData.leadId,
                notes: followUpData.notes,
                followUpDate: combinedDateTime.toISOString(),
                priority: followUpData.priority,
                status: followUpData.status
              };
              
              // Make API call to create follow-up
              apiRequest("POST", "/api/crm/follow-ups", followUpRecord)
                .then(response => response.json())
                .then(() => {
                  queryClient.invalidateQueries({ queryKey: ['/api/crm/leads'] });
                  queryClient.invalidateQueries({ queryKey: ['/api/crm/follow-ups'] });
                  toast({
                    title: "Success",
                    description: "Follow-up scheduled successfully!",
                  });
                  setFollowUpFormOpen(false);
                })
                .catch(error => {
                  toast({
                    title: "Error",
                    description: `Failed to schedule follow-up: ${error.message}`,
                    variant: "destructive"
                  });
                });
            }
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="followUpDate" className="text-right">
                  Date <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {followUpData.followUpDate ? (
                          format(followUpData.followUpDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={followUpData.followUpDate}
                        onSelect={(date) => 
                          setFollowUpData((prev) => ({ ...prev, followUpDate: date || new Date() }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="followUpTime" className="text-right">
                  Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="followUpTime"
                  type="time"
                  value={followUpData.followUpTime}
                  onChange={(e) => 
                    setFollowUpData((prev) => ({ ...prev, followUpTime: e.target.value }))
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Priority
                </Label>
                <Select
                  value={followUpData.priority}
                  onValueChange={(value) => 
                    setFollowUpData((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={followUpData.status}
                  onValueChange={(value) => 
                    setFollowUpData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={followUpData.notes}
                  onChange={(e) => 
                    setFollowUpData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Follow-up details or discussion points"
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setFollowUpFormOpen(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button type="submit">
                Schedule Follow-up
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}