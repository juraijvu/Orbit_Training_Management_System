import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Loader2, 
  Mail, 
  Save, 
  Plus, 
  Trash2, 
  Send, 
  Globe, 
  Download, 
  Upload, 
  Settings,
  Inbox,
  Check
} from "lucide-react";

export default function EmailSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("account-config");
  
  const [formData, setFormData] = useState({
    // Email account information
    accountName: "",
    senderName: "",
    senderEmail: "",
    emailPassword: "",
    replyToEmail: "",
    
    // Incoming server settings (IMAP)
    imapServer: "",
    imapPort: 993,
    imapSecurity: "ssl",
    imapUsername: "",
    imapPassword: "",
    
    // Outgoing server settings (SMTP)
    smtpServer: "",
    smtpPort: 587,
    smtpSecurity: "tls",
    smtpUsername: "",
    smtpPassword: "",
    smtpAuthRequired: true,
    
    // API settings
    apiKey: "",
    apiSecret: "",
    
    // Advanced settings
    connectionTimeout: 30,
    enabled: false,
    useApi: true
  });

  const [templateForm, setTemplateForm] = useState({
    name: "",
    subject: "",
    bodyText: "",
    bodyHtml: "",
    category: "general",
    variables: [],
    isDefault: false
  });

  const [newVariable, setNewVariable] = useState("");

  // Fetch Email Settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/email/settings"],
    queryFn: async () => {
      const res = await fetch("/api/email/settings");
      if (!res.ok) throw new Error("Failed to fetch email settings");
      return res.json();
    }
  });

  // Fetch Email Templates
  const { data: emailTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/email/templates"],
    queryFn: async () => {
      const res = await fetch("/api/email/templates");
      if (!res.ok) throw new Error("Failed to fetch email templates");
      return res.json();
    }
  });

  // Save Email Settings Mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data) => {
      return apiRequest("POST", "/api/email/settings", data);
    },
    onSuccess: () => {
      toast({
        title: "Settings saved successfully",
        description: "Your email configuration has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create Email Template Mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data) => {
      return apiRequest("POST", "/api/email/templates", data);
    },
    onSuccess: () => {
      toast({
        title: "Template created",
        description: "Your email template has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email/templates"] });
      setTemplateDialogOpen(false);
      setTemplateForm({
        name: "",
        subject: "",
        bodyText: "",
        bodyHtml: "",
        category: "general",
        variables: [],
        isDefault: false
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create template",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete Email Template Mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id) => {
      return apiRequest("DELETE", `/api/email/templates/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Template deleted",
        description: "The email template has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email/templates"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete template",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Test Connection Mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (data) => {
      return apiRequest("POST", "/api/email/test-connection", data);
    },
    onSuccess: () => {
      toast({
        title: "Connection successful",
        description: "Successfully connected to the email server.",
      });
    },
    onError: (error) => {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        // Email account information
        accountName: settings.accountName || "",
        senderName: settings.senderName || "",
        senderEmail: settings.senderEmail || "",
        emailPassword: settings.emailPassword || "",
        replyToEmail: settings.replyToEmail || "",
        
        // Incoming server settings (IMAP)
        imapServer: settings.imapServer || "",
        imapPort: settings.imapPort || 993,
        imapSecurity: settings.imapSecurity || "ssl",
        imapUsername: settings.imapUsername || "",
        imapPassword: settings.imapPassword || "",
        
        // Outgoing server settings (SMTP)
        smtpServer: settings.smtpServer || "",
        smtpPort: settings.smtpPort || 587,
        smtpSecurity: settings.smtpSecurity || "tls",
        smtpUsername: settings.smtpUsername || "",
        smtpPassword: settings.smtpPassword || "",
        smtpAuthRequired: settings.smtpAuthRequired !== undefined ? settings.smtpAuthRequired : true,
        
        // API settings
        apiKey: settings.apiKey || "",
        apiSecret: settings.apiSecret || "",
        
        // Advanced settings
        connectionTimeout: settings.connectionTimeout || 30,
        enabled: settings.enabled || false,
        useApi: settings.useApi !== undefined ? settings.useApi : true
      });
    }
  }, [settings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleTemplateChange = (e) => {
    const { name, value } = e.target;
    setTemplateForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBooleanChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDefaultChange = (checked) => {
    setTemplateForm(prev => ({ ...prev, isDefault: checked }));
  };

  const handleCategoryChange = (value) => {
    setTemplateForm(prev => ({ ...prev, category: value }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveSettingsMutation.mutate(formData);
  };

  const handleTestConnection = () => {
    testConnectionMutation.mutate(formData);
  };

  const handleCreateTemplate = (e) => {
    e.preventDefault();
    createTemplateMutation.mutate({
      ...templateForm,
      createdBy: user?.id
    });
  };

  const handleDeleteTemplate = (id) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      deleteTemplateMutation.mutate(id);
    }
  };

  const addVariable = () => {
    if (newVariable && !templateForm.variables.includes(newVariable)) {
      setTemplateForm(prev => ({
        ...prev,
        variables: [...prev.variables, newVariable]
      }));
      setNewVariable("");
    }
  };

  const removeVariable = (index) => {
    setTemplateForm(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Email Configuration</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="account-config">Account Setup</TabsTrigger>
          <TabsTrigger value="server-config">Server Settings</TabsTrigger>
          <TabsTrigger value="api-config">API Configuration</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
        </TabsList>

        {/* Account Configuration Tab */}
        <TabsContent value="account-config">
          <Card>
            <CardHeader>
              <CardTitle>Email Account Information</CardTitle>
              <CardDescription>
                Configure your email account details for sending and receiving emails.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input 
                      id="accountName"
                      name="accountName"
                      value={formData.accountName || ""}
                      placeholder="Main Office Account"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="senderEmail">Email Address</Label>
                    <Input 
                      id="senderEmail"
                      name="senderEmail"
                      value={formData.senderEmail || ""}
                      placeholder="info@orbitinstitute.com"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="senderName">Your Name</Label>
                    <Input 
                      id="senderName"
                      name="senderName"
                      value={formData.senderName || ""}
                      placeholder="Orbit Institute"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailPassword">Email Password</Label>
                    <Input 
                      id="emailPassword"
                      name="emailPassword"
                      type="password"
                      value={formData.emailPassword || ""}
                      placeholder="••••••••••••"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="replyToEmail">Reply-To Email Address</Label>
                  <Input 
                    id="replyToEmail"
                    name="replyToEmail"
                    value={formData.replyToEmail || ""}
                    placeholder="support@orbitinstitute.com"
                    onChange={handleInputChange}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Leave empty to use your email address as the reply-to address.
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-4">
                  <Switch 
                    id="enabled"
                    checked={formData.enabled || false}
                    onCheckedChange={(checked) => handleBooleanChange('enabled', checked)}
                  />
                  <Label htmlFor="enabled">Enable Email Integration</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Server Configuration Tab */}
        <TabsContent value="server-config">
          <Card>
            <CardHeader>
              <CardTitle>Email Server Configuration</CardTitle>
              <CardDescription>
                Configure your IMAP and SMTP server settings for receiving and sending emails.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-6">
                <Switch 
                  id="useApi"
                  checked={formData.useApi || false}
                  onCheckedChange={(checked) => handleBooleanChange('useApi', checked)}
                />
                <Label htmlFor="useApi">Use Titan API instead of IMAP/SMTP</Label>
                <p className="text-sm text-muted-foreground ml-2">
                  If enabled, the system will use Titan API for sending emails instead of SMTP.
                </p>
              </div>

              <div className={formData.useApi ? "opacity-50 pointer-events-none" : ""}>
                <Accordion type="single" collapsible defaultValue="incoming">
                  {/* Incoming Mail Server (IMAP) Configuration */}
                  <AccordionItem value="incoming">
                    <AccordionTrigger className="text-lg font-semibold">
                      <div className="flex items-center">
                        <Inbox className="h-5 w-5 mr-2" />
                        Incoming Mail Server (IMAP)
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="imapServer">IMAP Server</Label>
                            <Input 
                              id="imapServer"
                              name="imapServer"
                              value={formData.imapServer || ""}
                              placeholder="mail.titan.email"
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label htmlFor="imapPort">Port</Label>
                            <Input 
                              id="imapPort"
                              name="imapPort"
                              type="number"
                              value={formData.imapPort || ""}
                              placeholder="993"
                              onChange={handleNumberInputChange}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="imapSecurity">Security Type</Label>
                          <Select
                            value={formData.imapSecurity}
                            onValueChange={(value) => handleSelectChange('imapSecurity', value)}
                          >
                            <SelectTrigger id="imapSecurity">
                              <SelectValue placeholder="Select security type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="ssl">SSL/TLS</SelectItem>
                              <SelectItem value="tls">STARTTLS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="imapUsername">Username</Label>
                            <Input 
                              id="imapUsername"
                              name="imapUsername"
                              value={formData.imapUsername || ""}
                              placeholder="info@orbitinstitute.com"
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label htmlFor="imapPassword">Password</Label>
                            <Input 
                              id="imapPassword"
                              name="imapPassword"
                              type="password"
                              value={formData.imapPassword || ""}
                              placeholder="••••••••••••"
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Outgoing Mail Server (SMTP) Configuration */}
                  <AccordionItem value="outgoing">
                    <AccordionTrigger className="text-lg font-semibold">
                      <div className="flex items-center">
                        <Send className="h-5 w-5 mr-2" />
                        Outgoing Mail Server (SMTP)
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="smtpServer">SMTP Server</Label>
                            <Input 
                              id="smtpServer"
                              name="smtpServer"
                              value={formData.smtpServer || ""}
                              placeholder="smtp.titan.email"
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label htmlFor="smtpPort">Port</Label>
                            <Input 
                              id="smtpPort"
                              name="smtpPort"
                              type="number"
                              value={formData.smtpPort || ""}
                              placeholder="587"
                              onChange={handleNumberInputChange}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="smtpSecurity">Security Type</Label>
                          <Select
                            value={formData.smtpSecurity}
                            onValueChange={(value) => handleSelectChange('smtpSecurity', value)}
                          >
                            <SelectTrigger id="smtpSecurity">
                              <SelectValue placeholder="Select security type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="ssl">SSL/TLS</SelectItem>
                              <SelectItem value="tls">STARTTLS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2 mb-4">
                          <Switch 
                            id="smtpAuthRequired"
                            checked={formData.smtpAuthRequired}
                            onCheckedChange={(checked) => handleBooleanChange('smtpAuthRequired', checked)}
                          />
                          <Label htmlFor="smtpAuthRequired">Server requires authentication</Label>
                        </div>

                        <div className={formData.smtpAuthRequired ? "" : "opacity-50 pointer-events-none"}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="smtpUsername">Username</Label>
                              <Input 
                                id="smtpUsername"
                                name="smtpUsername"
                                value={formData.smtpUsername || ""}
                                placeholder="info@orbitinstitute.com"
                                onChange={handleInputChange}
                              />
                            </div>
                            <div>
                              <Label htmlFor="smtpPassword">Password</Label>
                              <Input 
                                id="smtpPassword"
                                name="smtpPassword"
                                type="password"
                                value={formData.smtpPassword || ""}
                                placeholder="••••••••••••"
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Advanced Settings */}
                  <AccordionItem value="advanced">
                    <AccordionTrigger className="text-lg font-semibold">
                      <div className="flex items-center">
                        <Settings className="h-5 w-5 mr-2" />
                        Advanced Settings
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div>
                          <Label htmlFor="connectionTimeout">Connection Timeout (seconds)</Label>
                          <Input 
                            id="connectionTimeout"
                            name="connectionTimeout"
                            type="number"
                            value={formData.connectionTimeout || ""}
                            placeholder="30"
                            onChange={handleNumberInputChange}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={formData.useApi}
              >
                <Check className="mr-2 h-4 w-4" />
                Test Connection
              </Button>
              <Button onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* API Configuration Tab */}
        <TabsContent value="api-config">
          <Card>
            <CardHeader>
              <CardTitle>Titan Email API Configuration</CardTitle>
              <CardDescription>
                Configure your Titan Email API credentials for sending emails via the API.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={!formData.useApi ? "opacity-50 pointer-events-none" : ""}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input 
                        id="apiKey"
                        name="apiKey"
                        value={formData.apiKey || ""}
                        type="password"
                        placeholder="Enter your Titan Email API Key"
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="apiSecret">API Secret</Label>
                      <Input 
                        id="apiSecret"
                        name="apiSecret"
                        value={formData.apiSecret || ""}
                        type="password"
                        placeholder="Enter your Titan Email API Secret"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      How to get your Titan Email API credentials
                    </h3>
                    <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
                      <li>Login to your Titan Email admin panel</li>
                      <li>Navigate to the API section in account settings</li>
                      <li>Generate a new API key and secret</li>
                      <li>Copy and paste the credentials here</li>
                    </ol>
                  </div>
                </div>
              </div>

              {!formData.useApi && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-amber-800 flex items-center">
                    <Check className="h-4 w-4 mr-2 text-amber-600" />
                    You are currently using direct SMTP/IMAP configuration. To use Titan API, enable it in the Server Settings tab.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (formData.useApi) {
                    toast({
                      title: "API Connection Test",
                      description: "Testing API connection functionality will be implemented in a future update.",
                    });
                  } else {
                    toast({
                      title: "API Not Enabled",
                      description: "Please enable API usage in the Server Settings tab first.",
                      variant: "warning",
                    });
                  }
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Test API Connection
              </Button>
              <Button onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Email Templates Tab */}
        <TabsContent value="templates">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Email Templates</h2>
            <Button onClick={() => setTemplateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>

          {templatesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(emailTemplates) && emailTemplates.map((template) => (
                <Card key={template.id} className="flex flex-col h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="truncate">{template.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <CardDescription>
                      Category: {template.category}
                      {template.isDefault && (
                        <span className="ml-2 px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs">
                          Default
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="mb-2">
                      <Label>Subject</Label>
                      <p className="text-sm truncate">{template.subject}</p>
                    </div>
                    <div>
                      <Label>Body Preview</Label>
                      <p className="text-sm line-clamp-3">{template.bodyText}</p>
                    </div>
                    {template.variables && template.variables.length > 0 && (
                      <div className="mt-2">
                        <Label>Variables</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.variables.map((variable, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                            >
                              {variable}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        // Implement preview functionality 
                        toast({
                          title: "Preview not available",
                          description: "Email template preview will be implemented in a future update.",
                        });
                      }}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Preview Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
            <DialogDescription>
              Create a new email template for automated communications.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTemplate}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name-input">Template Name</Label>
                  <Input 
                    id="name-input"
                    name="name"
                    value={templateForm.name}
                    onChange={handleTemplateChange}
                    placeholder="Welcome Email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category-input">Category</Label>
                  <Select
                    defaultValue={templateForm.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger id="category-input">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="lead_follow_up">Lead Follow-up</SelectItem>
                      <SelectItem value="course_info">Course Information</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject-input">Subject</Label>
                <Input 
                  id="subject-input"
                  name="subject"
                  value={templateForm.subject}
                  onChange={handleTemplateChange}
                  placeholder="Welcome to Orbit Institute"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bodyText-input">Plain Text Content</Label>
                <Textarea 
                  id="bodyText-input"
                  name="bodyText"
                  value={templateForm.bodyText}
                  onChange={handleTemplateChange}
                  placeholder="Enter the plain text version of your email"
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="bodyHtml-input">HTML Content</Label>
                <Textarea 
                  id="bodyHtml-input"
                  name="bodyHtml"
                  value={templateForm.bodyHtml}
                  onChange={handleTemplateChange}
                  placeholder="Enter the HTML version of your email"
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label>Template Variables</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={newVariable}
                    onChange={(e) => setNewVariable(e.target.value)}
                    placeholder="{{variable_name}}"
                  />
                  <Button type="button" variant="outline" onClick={addVariable}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {templateForm.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {templateForm.variables.map((variable, idx) => (
                      <div 
                        key={idx}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs flex items-center"
                      >
                        {variable}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1"
                          onClick={() => removeVariable(idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="isDefault"
                  checked={templateForm.isDefault}
                  onCheckedChange={handleDefaultChange}
                />
                <Label htmlFor="isDefault">Set as Default Template</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}