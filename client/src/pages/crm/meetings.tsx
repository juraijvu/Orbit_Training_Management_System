import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format, parseISO } from "date-fns";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Calendar as CalendarIcon, BellRing, X, Pencil, Trash2, MessageCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Form schema for creating/editing meetings
const meetingSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  meetingDate: z.date(),
  durationMinutes: z.coerce.number().min(15, { message: "Duration must be at least 15 minutes" }),
  location: z.string().optional(),
  meetingType: z.string(),
  status: z.string(),
  leadId: z.coerce.number().optional().nullable(),
  corporateLeadId: z.coerce.number().optional().nullable(),
  assignedTo: z.coerce.number(),
  priority: z.string(),
  reminderTime: z.date().optional().nullable(),
  sendNotification: z.boolean().default(false),
  notificationTemplateId: z.coerce.number().optional().nullable(),
  notes: z.string().optional(),
});

type MeetingFormValues = z.infer<typeof meetingSchema>;

// Status badge component with color coding
const StatusBadge = ({ status }: { status: string }) => {
  let variant: 
    | "default"
    | "secondary"
    | "destructive"
    | "outline" = "default";
  
  switch (status) {
    case "scheduled":
      variant = "default";
      break;
    case "completed":
      variant = "secondary";
      break;
    case "cancelled":
      variant = "destructive";
      break;
    case "rescheduled":
      variant = "outline";
      break;
    default:
      variant = "default";
  }
  
  return <Badge variant={variant}>{status}</Badge>;
};

export default function MeetingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Query to fetch all meetings
  const { data: meetings, isLoading: isLoadingMeetings } = useQuery({
    queryKey: ["/api/crm/meetings"],
    enabled: !!user
  });
  
  // Query to fetch meetings for today
  const { data: todayMeetings, isLoading: isLoadingTodayMeetings } = useQuery({
    queryKey: ["/api/crm/meetings/date", format(new Date(), "yyyy-MM-dd")],
    enabled: !!user && activeTab === "today"
  });
  
  // Query to fetch meetings assigned to current user
  const { data: myMeetings, isLoading: isLoadingMyMeetings } = useQuery({
    queryKey: ["/api/crm/meetings/assigned", user?.id],
    enabled: !!user && activeTab === "mine"
  });
  
  // Query to fetch leads for select dropdown
  const { data: leads } = useQuery({
    queryKey: ["/api/crm/leads"],
    enabled: !!user
  });
  
  // Query to fetch corporate leads for select dropdown
  const { data: corporateLeads } = useQuery({
    queryKey: ["/api/crm/corporate-leads"],
    enabled: !!user
  });
  
  // Query to fetch users for assignee dropdown
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!user
  });
  
  // Query to fetch WhatsApp templates for notification dropdown
  const { data: whatsappTemplates } = useQuery({
    queryKey: ["/api/whatsapp/templates"],
    enabled: !!user
  });
  
  // Form for creating meetings
  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: "",
      description: "",
      meetingDate: new Date(),
      durationMinutes: 30,
      location: "",
      meetingType: "in-person",
      status: "scheduled",
      leadId: null,
      corporateLeadId: null,
      assignedTo: user?.id || 0,
      priority: "medium",
      reminderTime: null,
      sendNotification: false,
      notificationTemplateId: null,
      notes: "",
    },
  });
  
  // Form for editing meetings
  const editForm = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: "",
      description: "",
      meetingDate: new Date(),
      durationMinutes: 30,
      location: "",
      meetingType: "in-person",
      status: "scheduled",
      leadId: null,
      corporateLeadId: null,
      assignedTo: user?.id || 0,
      priority: "medium",
      reminderTime: null,
      sendNotification: false,
      notificationTemplateId: null,
      notes: "",
    },
  });
  
  // Reset form when dialog is opened/closed
  useEffect(() => {
    if (!isCreateDialogOpen) {
      form.reset();
    }
  }, [isCreateDialogOpen, form]);
  
  // Set form values when editing a meeting
  useEffect(() => {
    if (selectedMeeting && isEditDialogOpen) {
      editForm.reset({
        ...selectedMeeting,
        meetingDate: parseISO(selectedMeeting.meetingDate),
        reminderTime: selectedMeeting.reminderTime ? parseISO(selectedMeeting.reminderTime) : null,
      });
    }
  }, [selectedMeeting, isEditDialogOpen, editForm]);
  
  // Mutation to create meeting
  const createMeetingMutation = useMutation({
    mutationFn: async (data: MeetingFormValues) => {
      const response = await apiRequest("POST", "/api/crm/meetings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Meeting Created",
        description: "The meeting has been scheduled successfully.",
      });
      setIsCreateDialogOpen(false);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/crm/meetings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/meetings/date", format(new Date(), "yyyy-MM-dd")] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/meetings/assigned", user?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create meeting: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutation to update meeting
  const updateMeetingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MeetingFormValues }) => {
      const response = await apiRequest("PATCH", `/api/crm/meetings/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Meeting Updated",
        description: "The meeting has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setSelectedMeeting(null);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/crm/meetings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/meetings/date", format(new Date(), "yyyy-MM-dd")] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/meetings/assigned", user?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update meeting: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutation to delete meeting
  const deleteMeetingMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/crm/meetings/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Meeting Deleted",
        description: "The meeting has been deleted successfully.",
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/crm/meetings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/meetings/date", format(new Date(), "yyyy-MM-dd")] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/meetings/assigned", user?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete meeting: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Function to handle form submission
  const onSubmit = (data: MeetingFormValues) => {
    createMeetingMutation.mutate(data);
  };
  
  // Function to handle edit form submission
  const onEditSubmit = (data: MeetingFormValues) => {
    if (selectedMeeting) {
      updateMeetingMutation.mutate({ id: selectedMeeting.id, data });
    }
  };
  
  // Function to handle meeting deletion
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this meeting?")) {
      deleteMeetingMutation.mutate(id);
    }
  };
  
  // Function to get the appropriate meeting data based on active tab
  const getMeetingData = () => {
    switch (activeTab) {
      case "today":
        return todayMeetings || [];
      case "mine":
        return myMeetings || [];
      default:
        return meetings || [];
    }
  };
  
  // Filter meetings by search query
  const filteredMeetings = getMeetingData().filter((meeting: any) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      meeting.title.toLowerCase().includes(query) ||
      (meeting.description && meeting.description.toLowerCase().includes(query)) ||
      (meeting.location && meeting.location.toLowerCase().includes(query))
    );
  });
  
  // Function to find user name by ID
  const getUserName = (userId: number) => {
    const user = users?.find((u: any) => u.id === userId);
    return user ? user.fullName : "Unknown";
  };
  
  // Function to find lead name by ID
  const getLeadName = (leadId: number) => {
    const lead = leads?.find((l: any) => l.id === leadId);
    return lead ? lead.fullName : "Unknown";
  };
  
  // Function to find corporate lead name by ID
  const getCorporateLeadName = (corporateLeadId: number) => {
    const lead = corporateLeads?.find((l: any) => l.id === corporateLeadId);
    return lead ? lead.companyName : "Unknown";
  };
  
  // Check if any data is loading
  const isLoading = isLoadingMeetings || 
    (isLoadingTodayMeetings && activeTab === "today") || 
    (isLoadingMyMeetings && activeTab === "mine");
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">CRM Meetings</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Schedule New Meeting</DialogTitle>
              <DialogDescription>
                Create a new meeting with leads or corporate clients
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title*</FormLabel>
                        <FormControl>
                          <Input placeholder="Meeting title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="meetingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meeting Type*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in-person">In Person</SelectItem>
                            <SelectItem value="virtual">Virtual</SelectItem>
                            <SelectItem value="phone">Phone Call</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="meetingDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date & Time*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP p")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className="rounded-md border"
                            />
                            <div className="p-3 border-t border-border">
                              <Input
                                type="time"
                                value={field.value ? format(field.value, "HH:mm") : ""}
                                onChange={(e) => {
                                  const [hours, minutes] = e.target.value.split(":");
                                  const newDate = new Date(field.value || new Date());
                                  newDate.setHours(parseInt(hours || "0"));
                                  newDate.setMinutes(parseInt(minutes || "0"));
                                  field.onChange(newDate);
                                }}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="durationMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)*</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={15} 
                            step={15} 
                            placeholder="30" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="leadId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Individual Lead</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            // Clear corporateLeadId if leadId is selected
                            if (value) {
                              form.setValue("corporateLeadId", null);
                            }
                            field.onChange(value ? parseInt(value) : null);
                          }}
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a lead" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {leads?.map((lead: any) => (
                              <SelectItem key={lead.id} value={lead.id.toString()}>
                                {lead.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Select
                          onValueChange={(value) => {
                            // Clear leadId if corporateLeadId is selected
                            if (value) {
                              form.setValue("leadId", null);
                            }
                            field.onChange(value ? parseInt(value) : null);
                          }}
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a corporate lead" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {corporateLeads?.map((lead: any) => (
                              <SelectItem key={lead.id} value={lead.id.toString()}>
                                {lead.companyName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned To*</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Assign to" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users?.map((user: any) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="rescheduled">Rescheduled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
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
                          placeholder="Meeting details"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <BellRing className="h-4 w-4 mr-2" />
                    Notifications
                  </h3>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="sendNotification"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Send WhatsApp notification</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("sendNotification") && (
                      <FormField
                        control={form.control}
                        name="notificationTemplateId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp Template</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                              value={field.value?.toString() || ""}
                              disabled={!form.watch("sendNotification")}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a template" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {whatsappTemplates?.map((template: any) => (
                                  <SelectItem key={template.id} value={template.id.toString()}>
                                    {template.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="reminderTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Set Reminder (optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${
                                    !field.value && "text-muted-foreground"
                                  }`}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP p")
                                  ) : (
                                    <span>Add reminder time</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                initialFocus
                                className="rounded-md border"
                              />
                              <div className="p-3 border-t border-border">
                                <Input
                                  type="time"
                                  value={field.value ? format(field.value, "HH:mm") : ""}
                                  onChange={(e) => {
                                    const [hours, minutes] = e.target.value.split(":");
                                    const newDate = new Date(field.value || new Date());
                                    newDate.setHours(parseInt(hours || "0"));
                                    newDate.setMinutes(parseInt(minutes || "0"));
                                    field.onChange(newDate);
                                  }}
                                />
                              </div>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={createMeetingMutation.isPending}>
                    {createMeetingMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Meeting
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="all">All Meetings</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="mine">My Meetings</TabsTrigger>
              </TabsList>
              
              <div className="relative">
                <Input
                  placeholder="Search meetings..."
                  className="w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </Tabs>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Meetings</CardTitle>
            <CardDescription>
              {activeTab === "all" && "All scheduled meetings"}
              {activeTab === "today" && "Meetings scheduled for today"}
              {activeTab === "mine" && "Meetings assigned to you"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No meetings found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Lead/Company</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMeetings.map((meeting: any) => (
                    <TableRow key={meeting.id}>
                      <TableCell className="font-medium">{meeting.title}</TableCell>
                      <TableCell>
                        {format(parseISO(meeting.meetingDate), "PPP")}
                        <br />
                        <span className="text-sm text-muted-foreground">
                          {format(parseISO(meeting.meetingDate), "p")}
                          {` (${meeting.durationMinutes} min)`}
                        </span>
                      </TableCell>
                      <TableCell>
                        {meeting.leadId ? (
                          <span className="text-sm rounded-full bg-blue-100 text-blue-800 px-2 py-1">
                            {getLeadName(meeting.leadId)}
                          </span>
                        ) : meeting.corporateLeadId ? (
                          <span className="text-sm rounded-full bg-purple-100 text-purple-800 px-2 py-1">
                            {getCorporateLeadName(meeting.corporateLeadId)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell>{getUserName(meeting.assignedTo)}</TableCell>
                      <TableCell>
                        <StatusBadge status={meeting.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedMeeting(meeting);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(meeting.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <a 
                              href={meeting.leadId ? 
                                `/crm/leads/${meeting.leadId}` : 
                                meeting.corporateLeadId ? 
                                  `/crm/corporate-leads/${meeting.corporateLeadId}` : 
                                  '#'
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Edit meeting dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
            <DialogDescription>
              Update meeting details
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="Meeting title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="meetingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting Type*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="in-person">In Person</SelectItem>
                          <SelectItem value="virtual">Virtual</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="meetingDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date & Time*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "PPP p")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="rounded-md border"
                          />
                          <div className="p-3 border-t border-border">
                            <Input
                              type="time"
                              value={field.value ? format(field.value, "HH:mm") : ""}
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(":");
                                const newDate = new Date(field.value || new Date());
                                newDate.setHours(parseInt(hours || "0"));
                                newDate.setMinutes(parseInt(minutes || "0"));
                                field.onChange(newDate);
                              }}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={15} 
                          step={15} 
                          placeholder="30" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned To*</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Assign to" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users?.map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
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
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="rescheduled">Rescheduled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Meeting details"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={updateMeetingMutation.isPending}>
                  {updateMeetingMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Meeting
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}