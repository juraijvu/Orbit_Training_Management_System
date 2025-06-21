import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, Edit, Plus, Trash, X, Mail, MessageSquare, AlertTriangle, User, Building, RefreshCw } from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { insertCrmMeetingSchema, InsertCrmMeeting } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// UI components
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

// Enhanced schema with validations
const meetingFormSchema = insertCrmMeetingSchema.extend({
  meetingDate: z.string().min(1, { message: "Meeting date is required" }),
  meetingTime: z.string().min(1, { message: "Meeting time is required" }),
  leadName: z.string().optional(),
  corporateLeadName: z.string().optional(),
});

type MeetingFormValues = z.infer<typeof meetingFormSchema>;

export default function Meetings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);

  // Fetch meetings data
  const {
    data: meetings = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/crm/meetings"],
    queryFn: async () => {
      const response = await fetch("/api/crm/meetings");
      if (!response.ok) {
        throw new Error("Failed to fetch meetings");
      }
      return await response.json();
    },
  });

  // Fetch users for assignment
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return await response.json();
    },
  });

  // Fetch leads for selection
  const { data: leads = [] } = useQuery({
    queryKey: ["/api/crm/leads"],
    queryFn: async () => {
      const response = await fetch("/api/crm/leads");
      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }
      return await response.json();
    },
  });

  // Fetch corporate leads for selection
  const { data: corporateLeads = [] } = useQuery({
    queryKey: ["/api/crm/corporate-leads"],
    queryFn: async () => {
      const response = await fetch("/api/crm/corporate-leads");
      if (!response.ok) {
        throw new Error("Failed to fetch corporate leads");
      }
      return await response.json();
    },
  });

  // Fetch WhatsApp templates
  const { data: whatsappTemplates = [] } = useQuery({
    queryKey: ["/api/whatsapp/templates"],
    queryFn: async () => {
      const response = await fetch("/api/whatsapp/templates");
      if (!response.ok) {
        throw new Error("Failed to fetch WhatsApp templates");
      }
      return await response.json();
    },
  });

  // Create meeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: async (meeting: InsertCrmMeeting) => {
      const res = await apiRequest("POST", "/api/crm/meetings", meeting);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/meetings"] });
      toast({
        title: "Meeting Created",
        description: "The meeting has been successfully scheduled.",
      });
      setOpenDialog(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create meeting",
        variant: "destructive",
      });
    },
  });

  // Update meeting mutation
  const updateMeetingMutation = useMutation({
    mutationFn: async ({ id, meeting }: { id: number; meeting: Partial<InsertCrmMeeting> }) => {
      const res = await apiRequest("PATCH", `/api/crm/meetings/${id}`, meeting);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/meetings"] });
      toast({
        title: "Meeting Updated",
        description: "The meeting has been successfully updated.",
      });
      setOpenDialog(false);
      setIsEditing(false);
      setSelectedMeeting(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update meeting",
        variant: "destructive",
      });
    },
  });

  // Delete meeting mutation
  const deleteMeetingMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/crm/meetings/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/meetings"] });
      toast({
        title: "Meeting Deleted",
        description: "The meeting has been successfully deleted.",
      });
      setSelectedMeeting(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete meeting",
        variant: "destructive",
      });
    },
  });

  // Send reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/crm/meetings/${id}/send-reminder`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/meetings"] });
      toast({
        title: "Reminder Sent",
        description: "The meeting reminder has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reminder",
        variant: "destructive",
      });
    },
  });

  // Form setup
  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      leadId: null,
      corporateLeadId: null,
      assignedTo: user?.id || 1,
      status: "scheduled",
      location: "",
      meetingDate: format(new Date(), "yyyy-MM-dd"),
      meetingTime: format(new Date(), "HH:mm"),
      participantName: "",
      participantEmail: "",
      participantPhone: "",
      sendNotification: true,
      sendReminder: true,
      notificationSent: false,
      reminderSent: false,
      outcome: "",
      duration: 30, // default to 30 minutes
    },
  });

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditing(false);
    setSelectedMeeting(null);
    form.reset();
  };

  // Handle form submission
  const onSubmit = (data: MeetingFormValues) => {
    // Combine date and time
    const meetingDateTime = new Date(`${data.meetingDate}T${data.meetingTime}`);
    
    const meetingData = {
      ...data,
      meetingDate: meetingDateTime,
      sendNotification: data.sendNotification || false,
      sendReminder: data.sendReminder || false,
      notificationMethod: sendWhatsApp ? "whatsapp" : sendEmail ? "email" : "none",
    };
    
    delete meetingData.meetingTime;
    
    if (isEditing && selectedMeeting) {
      updateMeetingMutation.mutate({ id: selectedMeeting.id, meeting: meetingData });
    } else {
      createMeetingMutation.mutate(meetingData as InsertCrmMeeting);
    }
  };

  // Edit meeting handler
  const handleEditMeeting = (meeting: any) => {
    setSelectedMeeting(meeting);
    setIsEditing(true);

    const meetingDate = format(parseISO(meeting.meetingDate), "yyyy-MM-dd");
    const meetingTime = format(parseISO(meeting.meetingDate), "HH:mm");

    setSendWhatsApp(meeting.notificationMethod === "whatsapp");
    setSendEmail(meeting.notificationMethod === "email");

    form.reset({
      ...meeting,
      meetingDate,
      meetingTime,
    });

    setOpenDialog(true);
  };

  // Filter meetings by tab
  const filteredMeetings = meetings.filter((meeting: any) => {
    const meetingDate = new Date(meeting.meetingDate);
    const now = new Date();

    switch (activeTab) {
      case "upcoming":
        return meetingDate >= now && meeting.status !== "cancelled" && meeting.status !== "completed";
      case "past":
        return meetingDate < now || meeting.status === "completed";
      case "cancelled":
        return meeting.status === "cancelled";
      case "my":
        return meeting.assignedTo === user?.id;
      default:
        return true;
    }
  });

  // Set up lead selection handler
  const handleLeadSelect = (leadId: string) => {
    const selectedLead = leads.find((lead: any) => lead.id.toString() === leadId);
    if (selectedLead) {
      form.setValue("participantName", selectedLead.name);
      form.setValue("participantEmail", selectedLead.email);
      form.setValue("participantPhone", selectedLead.phone);
      form.setValue("corporateLeadId", null);
    }
  };

  // Set up corporate lead selection handler
  const handleCorporateLeadSelect = (corporateLeadId: string) => {
    const selectedLead = corporateLeads.find((lead: any) => lead.id.toString() === corporateLeadId);
    if (selectedLead) {
      form.setValue("participantName", selectedLead.contactPerson);
      form.setValue("participantEmail", selectedLead.email);
      form.setValue("participantPhone", selectedLead.phone);
      form.setValue("leadId", null);
    }
  };

  // Get lead or corporate lead name for display
  const getParticipantSource = (meeting: any) => {
    if (meeting.leadId) {
      const lead = leads.find((l: any) => l.id === meeting.leadId);
      return lead ? `Lead: ${lead.name}` : "Unknown Lead";
    } else if (meeting.corporateLeadId) {
      const corporateLead = corporateLeads.find((cl: any) => cl.id === meeting.corporateLeadId);
      return corporateLead ? `Corporate: ${corporateLead.companyName}` : "Unknown Company";
    }
    return meeting.participantName;
  };

  // Get assigned user name
  const getAssignedUserName = (userId: number) => {
    const assignedUser = users.find((u: any) => u.id === userId);
    return assignedUser ? assignedUser.username : "Unassigned";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <h3 className="font-semibold">Error loading meetings</h3>
        <p>{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">CRM Meetings</h1>
          <p className="text-muted-foreground">Manage meetings with leads and corporate clients</p>
        </div>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
        </Button>
      </div>

      {/* Tab navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="upcoming">
            Upcoming
            <Badge className="ml-2 bg-primary/10 text-primary">{meetings.filter((m: any) => new Date(m.meetingDate) >= new Date() && m.status !== "cancelled" && m.status !== "completed").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="past">
            Past
            <Badge className="ml-2 bg-muted text-muted-foreground">{meetings.filter((m: any) => new Date(m.meetingDate) < new Date() || m.status === "completed").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled
            <Badge className="ml-2 bg-destructive/10 text-destructive">{meetings.filter((m: any) => m.status === "cancelled").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="my">
            My Meetings
            <Badge className="ml-2 bg-blue-500/10 text-blue-500">{meetings.filter((m: any) => m.assignedTo === user?.id).length}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Meetings list */}
      {filteredMeetings.length === 0 ? (
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No meetings found</h3>
          <p className="text-muted-foreground mt-2">
            {activeTab === "upcoming"
              ? "You don't have any upcoming meetings scheduled."
              : activeTab === "past"
              ? "No past meetings found."
              : activeTab === "cancelled"
              ? "No cancelled meetings found."
              : "No meetings assigned to you."}
          </p>
          <Button onClick={() => setOpenDialog(true)} variant="outline" className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Schedule a Meeting
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeetings.map((meeting: any) => (
            <Card key={meeting.id} className="overflow-hidden">
              <CardHeader className="pb-2 relative">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="pr-6 line-clamp-1">{meeting.title}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      {getParticipantSource(meeting)}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute top-3 right-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Meeting Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditMeeting(meeting)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Meeting
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => sendReminderMutation.mutate(meeting.id)}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Send Reminder
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this meeting?")) {
                            deleteMeetingMutation.mutate(meeting.id);
                          }
                        }}
                        className="text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {format(new Date(meeting.meetingDate), "MMM d, yyyy")}
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    {format(new Date(meeting.meetingDate), "h:mm a")}
                  </div>
                </div>
                
                <div className="flex items-center text-sm mb-2">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  {getAssignedUserName(meeting.assignedTo)}
                </div>
                
                {meeting.location && (
                  <div className="flex items-center text-sm mb-2">
                    <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                    {meeting.location}
                  </div>
                )}
                
                {meeting.description && (
                  <div className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {meeting.description}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex justify-between items-center w-full">
                  <Badge
                    className={
                      meeting.status === "scheduled"
                        ? "bg-blue-500/10 text-blue-500"
                        : meeting.status === "completed"
                        ? "bg-green-500/10 text-green-500"
                        : meeting.status === "cancelled"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-yellow-500/10 text-yellow-500"
                    }
                  >
                    {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                  </Badge>
                  
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(meeting.meetingDate), { addSuffix: true })}
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Meeting Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Meeting" : "Schedule a New Meeting"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the meeting details below."
                : "Enter the details for the meeting you want to schedule."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-1 py-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meeting Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter meeting title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assignedTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assigned To</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value?.toString()}
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a user" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map((user: any) => (
                                  <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.username}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="meetingDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="meetingTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="15"
                              step="15"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Meeting location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="leadId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Individual Lead</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value?.toString() || ""}
                              onValueChange={(value) => {
                                field.onChange(value && value !== "none" ? parseInt(value) : null);
                                if (value && value !== "none") handleLeadSelect(value);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a lead (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {leads.map((lead: any) => (
                                  <SelectItem key={lead.id} value={lead.id.toString()}>
                                    {lead.name} ({lead.phone})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Select an existing lead or enter details manually below
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="corporateLeadId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Corporate Lead</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value?.toString() || ""}
                              onValueChange={(value) => {
                                field.onChange(value && value !== "none" ? parseInt(value) : null);
                                if (value && value !== "none") handleCorporateLeadSelect(value);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a company (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {corporateLeads.map((lead: any) => (
                                  <SelectItem key={lead.id} value={lead.id.toString()}>
                                    {lead.companyName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Select a corporate client or enter details manually below
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="participantName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Participant Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="participantEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Email" type="email" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="participantPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone number" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Meeting details and agenda"
                            className="min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isEditing && (
                    <FormField
                      control={form.control}
                      name="outcome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meeting Outcome</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter meeting outcome or results"
                              className="min-h-20"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Notifications</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sendNotification"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Send Notification</FormLabel>
                              <FormDescription>
                                Notify participant when meeting is scheduled
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="sendReminder"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Send Reminder</FormLabel>
                              <FormDescription>
                                Send a reminder before the meeting
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <h4 className="text-sm font-medium mb-3">Notification Method</h4>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="whatsapp"
                            checked={sendWhatsApp}
                            onCheckedChange={(checked) => {
                              setSendWhatsApp(!!checked);
                              if (checked) setSendEmail(false);
                            }}
                          />
                          <Label htmlFor="whatsapp" className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4 text-green-500" />
                            WhatsApp
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="email"
                            checked={sendEmail}
                            onCheckedChange={(checked) => {
                              setSendEmail(!!checked);
                              if (checked) setSendWhatsApp(false);
                            }}
                          />
                          <Label htmlFor="email" className="flex items-center gap-1">
                            <Mail className="h-4 w-4 text-blue-500" />
                            Email
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseDialog}
                      className="mt-4 sm:mt-0"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="mt-4 sm:mt-0"
                      disabled={createMeetingMutation.isPending || updateMeetingMutation.isPending}
                    >
                      {(createMeetingMutation.isPending || updateMeetingMutation.isPending) && (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isEditing ? "Update Meeting" : "Schedule Meeting"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}