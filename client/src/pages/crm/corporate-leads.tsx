import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, MoreHorizontal, Building, Phone, Mail, User, Calendar, RefreshCw, Edit, Trash, FileText, MessageSquare } from "lucide-react";
import { format, parseISO } from "date-fns";
import { insertCorporateLeadSchema, InsertCorporateLead } from "@shared/schema";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Enhanced schema with validations
const corporateLeadFormSchema = z.object({
  companyName: z.string().min(1, { message: "Company name is required" }),
  industry: z.string().optional(),
  website: z.string().optional(),
  employeeCount: z.number().nullable().optional(),
  annualRevenue: z.string().optional(),
  address: z.string().optional(),
  primaryContactName: z.string().min(1, { message: "Contact person name is required" }),
  primaryContactTitle: z.string().optional(),
  primaryContactEmail: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  primaryContactPhone: z.string().min(5, { message: "Valid phone number is required" }),
  leadSource: z.string().optional(),
  leadStatus: z.string().default("new"),
  priority: z.string().default("medium"),
  assignedTo: z.number().min(1, { message: "Please assign to a user" }),
  notes: z.string().optional(),
});

type CorporateLeadFormValues = z.infer<typeof corporateLeadFormSchema>;

export default function CorporateLeads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch corporate leads data
  const {
    data: corporateLeads = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/crm/corporate-leads"],
    queryFn: async () => {
      const response = await fetch("/api/crm/corporate-leads");
      if (!response.ok) {
        throw new Error("Failed to fetch corporate leads");
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

  // Create corporate lead mutation
  const createCorporateLeadMutation = useMutation({
    mutationFn: async (lead: InsertCorporateLead) => {
      console.log("Sending corporate lead data to API:", lead);
      const res = await apiRequest("POST", "/api/crm/corporate-leads", lead);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    },
    onSuccess: (data) => {
      console.log("Corporate lead created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/crm/corporate-leads"] });
      toast({
        title: "Corporate Lead Created",
        description: "The corporate lead has been added successfully.",
      });
      setOpenDialog(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Corporate lead creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create corporate lead",
        variant: "destructive",
      });
    },
  });

  // Update corporate lead mutation
  const updateCorporateLeadMutation = useMutation({
    mutationFn: async ({ id, lead }: { id: number; lead: Partial<InsertCorporateLead> }) => {
      const res = await apiRequest("PATCH", `/api/crm/corporate-leads/${id}`, lead);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/corporate-leads"] });
      toast({
        title: "Corporate Lead Updated",
        description: "The corporate lead has been updated successfully.",
      });
      setOpenDialog(false);
      setIsEditing(false);
      setSelectedLead(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update corporate lead",
        variant: "destructive",
      });
    },
  });

  // Delete corporate lead mutation
  const deleteCorporateLeadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/crm/corporate-leads/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/corporate-leads"] });
      toast({
        title: "Corporate Lead Deleted",
        description: "The corporate lead has been deleted successfully.",
      });
      setSelectedLead(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete corporate lead",
        variant: "destructive",
      });
    },
  });

  // Form setup
  const form = useForm<CorporateLeadFormValues>({
    resolver: zodResolver(corporateLeadFormSchema),
    defaultValues: {
      companyName: "",
      primaryContactName: "",
      primaryContactTitle: "",
      primaryContactEmail: "",
      primaryContactPhone: "",
      address: "",
      website: "",
      industry: "",
      employeeCount: null,
      annualRevenue: "",
      leadSource: "",
      leadStatus: "new",
      priority: "medium",
      assignedTo: user?.id,
      notes: "",
    },
  });

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditing(false);
    setSelectedLead(null);
    form.reset();
  };

  // Handle form submission
  const onSubmit = (data: CorporateLeadFormValues) => {
    console.log("Form submission data:", data);
    console.log("Form errors:", form.formState.errors);
    
    try {
      // Validate required fields
      if (!data.companyName || !data.primaryContactName || !data.primaryContactPhone) {
        toast({
          title: "Validation Error",
          description: "Company name, contact name, and phone are required fields",
          variant: "destructive"
        });
        return;
      }

      // Transform data for submission
      const submitData = {
        companyName: data.companyName,
        industry: data.industry || null,
        website: data.website || null,
        employeeCount: data.employeeCount || null,
        annualRevenue: data.annualRevenue || null,
        address: data.address || null,
        city: null,
        country: null,
        primaryContactName: data.primaryContactName,
        primaryContactTitle: data.primaryContactTitle || null,
        primaryContactEmail: data.primaryContactEmail || null,
        primaryContactPhone: data.primaryContactPhone,
        secondaryContactName: null,
        secondaryContactTitle: null,
        secondaryContactEmail: null,
        secondaryContactPhone: null,
        leadSource: data.leadSource || null,
        leadStatus: data.leadStatus || "new",
        priority: data.priority || "medium",
        pipelineDealId: null,
        notes: data.notes || null,
        requirements: null,
        budget: null,
        timeframe: null,
        assignedTo: data.assignedTo || user?.id || 1,
        lastContactDate: null,
        nextFollowUpDate: null,
        tags: [],
      };

      console.log("Transformed data for submission:", submitData);

      if (isEditing && selectedLead) {
        updateCorporateLeadMutation.mutate({ id: selectedLead.id, lead: submitData });
      } else {
        createCorporateLeadMutation.mutate(submitData as InsertCorporateLead);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Submission Error",
        description: error instanceof Error ? error.message : "Failed to process form data",
        variant: "destructive"
      });
    }
  };

  // Edit lead handler
  const handleEditLead = (lead: any) => {
    setSelectedLead(lead);
    setIsEditing(true);
    form.reset({
      ...lead,
      employeeCount: lead.employeeCount || null,
      annualRevenue: lead.annualRevenue || null,
    });
    setOpenDialog(true);
  };

  // Status options
  const statusOptions = [
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "qualified", label: "Qualified" },
    { value: "proposal", label: "Proposal Sent" },
    { value: "negotiation", label: "Negotiation" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" },
    { value: "dormant", label: "Dormant" },
  ];

  // Priority options
  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  // Industry options
  const industryOptions = [
    { value: "technology", label: "Technology" },
    { value: "finance", label: "Finance & Banking" },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "retail", label: "Retail" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "energy", label: "Energy & Utilities" },
    { value: "hospitality", label: "Hospitality & Tourism" },
    { value: "construction", label: "Construction" },
    { value: "transportation", label: "Transportation & Logistics" },
    { value: "government", label: "Government" },
    { value: "nonprofit", label: "Non-profit" },
    { value: "telecommunications", label: "Telecommunications" },
    { value: "media", label: "Media & Entertainment" },
    { value: "consulting", label: "Consulting" },
    { value: "other", label: "Other" },
  ];

  // Proposal status options
  const proposalStatusOptions = [
    { value: "none", label: "None" },
    { value: "in_progress", label: "In Progress" },
    { value: "sent", label: "Sent" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "revising", label: "Revising" },
  ];

  // Filter and search leads
  const filteredLeads = corporateLeads.filter((lead: any) => {
    // Search by name, company, email, phone
    const searchMatch = searchTerm === "" || 
      lead.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by tab
    let tabMatch = true;
    if (activeTab === "my") {
      tabMatch = lead.assignedTo === user?.id;
    } else if (activeTab === "high_priority") {
      tabMatch = lead.priority === "high" || lead.priority === "urgent";
    } else if (activeTab === "proposal") {
      tabMatch = lead.proposalStatus === "sent" || lead.proposalStatus === "in_progress";
    } else if (activeTab !== "all") {
      tabMatch = lead.status === activeTab;
    }
    
    return searchMatch && tabMatch;
  });

  // Get assigned user name
  const getAssignedUserName = (userId: number) => {
    const assignedUser = users.find((u: any) => u.id === userId);
    return assignedUser ? assignedUser.username : "Unassigned";
  };

  // Status and priority badge color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-500/10 text-blue-500";
      case "contacted": return "bg-amber-500/10 text-amber-500";
      case "qualified": return "bg-purple-500/10 text-purple-500";
      case "proposal": return "bg-indigo-500/10 text-indigo-500";
      case "negotiation": return "bg-pink-500/10 text-pink-500";
      case "won": return "bg-green-500/10 text-green-500";
      case "lost": return "bg-red-500/10 text-red-500";
      case "dormant": return "bg-gray-500/10 text-gray-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-green-500/10 text-green-500";
      case "medium": return "bg-blue-500/10 text-blue-500";
      case "high": return "bg-amber-500/10 text-amber-500";
      case "urgent": return "bg-red-500/10 text-red-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  const getProposalStatusColor = (status: string) => {
    switch (status) {
      case "none": return "bg-gray-500/10 text-gray-500";
      case "in_progress": return "bg-amber-500/10 text-amber-500";
      case "sent": return "bg-blue-500/10 text-blue-500";
      case "accepted": return "bg-green-500/10 text-green-500";
      case "rejected": return "bg-red-500/10 text-red-500";
      case "revising": return "bg-purple-500/10 text-purple-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
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
        <h3 className="font-semibold">Error loading corporate leads</h3>
        <p>{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Corporate Leads</h1>
          <p className="text-muted-foreground">Manage corporate client leads and track proposals</p>
        </div>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Corporate Lead
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company, contact, or email..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-2/3">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="contacted">Contacted</TabsTrigger>
            <TabsTrigger value="qualified">Qualified</TabsTrigger>
            <TabsTrigger value="proposal">Proposal</TabsTrigger>
            <TabsTrigger value="won">Won</TabsTrigger>
            <TabsTrigger value="my">My Leads</TabsTrigger>
            <TabsTrigger value="high_priority">High Priority</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Building className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No corporate leads found</h3>
          <p className="text-muted-foreground mt-2">
            {searchTerm
              ? "No results match your search criteria."
              : "Start by adding your first corporate lead."}
          </p>
          <Button onClick={() => setOpenDialog(true)} variant="outline" className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Add Corporate Lead
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead: any) => (
            <Card key={lead.id} className="overflow-hidden">
              <CardHeader className="pb-2 relative">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="pr-6 line-clamp-1">{lead.companyName}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      {lead.industry || "Unknown Industry"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute top-3 right-3">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditLead(lead)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Lead
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        // This would navigate to create a new proposal with this lead preselected
                      }}>
                        <FileText className="mr-2 h-4 w-4" /> Create Proposal
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        // This would navigate to schedule a meeting with this lead
                      }}>
                        <Calendar className="mr-2 h-4 w-4" /> Schedule Meeting
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        // This would open the WhatsApp chat with this lead
                      }}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Send WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this corporate lead?")) {
                            deleteCorporateLeadMutation.mutate(lead.id);
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{lead.contactPerson}</span>
                    {lead.position && (
                      <span className="text-xs text-muted-foreground">{lead.position}</span>
                    )}
                  </div>
                  
                  {lead.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lead.phone}</span>
                    </div>
                  )}
                  
                  {lead.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate">{lead.email}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getAssignedUserName(lead.assignedTo).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    Assigned to {getAssignedUserName(lead.assignedTo)}
                  </span>
                </div>
                
                {lead.lastContactDate && (
                  <div className="mt-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Last contact: {format(parseISO(lead.lastContactDate), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                <Badge className={getStatusColor(lead.status)}>
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </Badge>
                
                <Badge className={getPriorityColor(lead.priority)}>
                  {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)} Priority
                </Badge>
                
                {lead.proposalStatus !== "none" && (
                  <Badge className={getProposalStatusColor(lead.proposalStatus)}>
                    Proposal: {lead.proposalStatus.replace("_", " ").charAt(0).toUpperCase() + lead.proposalStatus.replace("_", " ").slice(1)}
                  </Badge>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Corporate Lead Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Corporate Lead" : "Add New Corporate Lead"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the corporate lead details below."
                : "Enter the details of the corporate client you want to add."}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] overflow-auto">
            <div className="p-1">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  console.log("Form validation errors:", errors);
                  toast({
                    title: "Form Validation Error",
                    description: "Please check all required fields",
                    variant: "destructive"
                  });
                })} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Company Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter company name" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry</FormLabel>
                            <FormControl>
                              <Select value={field.value || ""} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select industry" />
                                </SelectTrigger>
                                <SelectContent>
                                  {industryOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
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
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="Company website" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="employeeCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employees</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Number of employees" 
                                {...field}
                                value={field.value || ""}
                                onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Company address" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Primary Contact Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="primaryContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Person *</FormLabel>
                            <FormControl>
                              <Input placeholder="Primary contact name" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="primaryContactTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position</FormLabel>
                            <FormControl>
                              <Input placeholder="Job title" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="primaryContactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Contact email" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="primaryContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone *</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone number" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry</FormLabel>
                            <FormControl>
                              <Select value={field.value || ""} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select industry" />
                                </SelectTrigger>
                                <SelectContent>
                                  {industryOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
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
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="Company website" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="employeeCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employees</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Number of employees" 
                                {...field}
                                value={field.value || ""}
                                onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Company address" 
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Contact Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactPerson"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Person</FormLabel>
                            <FormControl>
                              <Input placeholder="Name of contact person" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position</FormLabel>
                            <FormControl>
                              <Input placeholder="Job title or position" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Email address" type="email" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="primaryContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Lead Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="leadStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  {priorityOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="proposalStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Proposal Status</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select proposal status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {proposalStatusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
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
                      
                      <FormField
                        control={form.control}
                        name="leadSource"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lead Source</FormLabel>
                            <FormControl>
                              <Input placeholder="How did you find this lead?" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="annualRevenue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Revenue (in AED)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Estimated annual revenue" 
                              {...field}
                              value={field.value || ""}
                              onChange={e => field.onChange(e.target.value || "")}
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
                              placeholder="Additional information about this lead"
                              className="min-h-20"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                      disabled={createCorporateLeadMutation.isPending || updateCorporateLeadMutation.isPending}
                    >
                      {(createCorporateLeadMutation.isPending || updateCorporateLeadMutation.isPending) && (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isEditing ? "Update Lead" : "Add Lead"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}