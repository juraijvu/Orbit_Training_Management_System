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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, MessageSquare, Save, Plus, Trash2, Send } from "lucide-react";

export default function WhatsappSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("api-config");
  
  const [formData, setFormData] = useState({
    apiKey: "",
    phoneNumberId: "",
    businessAccountId: "",
    accessToken: "",
    webhookVerifyToken: "",
    isActive: true
  });

  const [templateForm, setTemplateForm] = useState({
    name: "",
    content: "",
    type: "welcome",
    variables: "",
    isActive: true
  });

  // Fetch WhatsApp settings
  const { 
    data: whatsappSettings,
    isLoading: isLoadingSettings
  } = useQuery({
    queryKey: ['/api/whatsapp/settings'],
    enabled: user?.role === "superadmin" || user?.role === "admin"
  });

  // Fetch WhatsApp templates
  const {
    data: whatsappTemplates = [],
    isLoading: isLoadingTemplates
  } = useQuery({
    queryKey: ['/api/whatsapp/templates'],
    enabled: user?.role === "superadmin" || user?.role === "admin"
  });

  // Create or update API settings
  const saveMutation = useMutation({
    mutationFn: async (settings: any) => {
      const res = await apiRequest(
        "POST", 
        "/api/whatsapp/settings", 
        settings
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "WhatsApp API settings have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/settings'] });
      setApiDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create template
  const createTemplateMutation = useMutation({
    mutationFn: async (template) => {
      const res = await apiRequest(
        "POST", 
        "/api/whatsapp/templates", 
        template
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Template Saved",
        description: "Message template has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/templates'] });
      setTemplateDialogOpen(false);
      setTemplateForm({
        name: "",
        content: "",
        type: "welcome",
        variables: "",
        isActive: true
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete template
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(
        "DELETE", 
        `/api/whatsapp/templates/${id}`
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Template Deleted",
        description: "Message template has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/templates'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Load settings when available
  useEffect(() => {
    if (whatsappSettings) {
      setFormData({
        apiKey: whatsappSettings.apiKey || "",
        phoneNumberId: whatsappSettings.phoneNumberId || "",
        businessAccountId: whatsappSettings.businessAccountId || "",
        accessToken: whatsappSettings.accessToken || "",
        webhookVerifyToken: whatsappSettings.webhookVerifyToken || "",
        isActive: whatsappSettings.isActive
      });
    }
  }, [whatsappSettings]);

  // Input change handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTemplateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTemplateForm({ ...templateForm, [name]: value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({ ...formData, isActive: checked });
  };

  const handleTemplateSwitchChange = (checked: boolean) => {
    setTemplateForm({ ...templateForm, isActive: checked });
  };

  const handleSelectChange = (value: string) => {
    setTemplateForm({ ...templateForm, type: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTemplateMutation.mutate({
      ...templateForm,
      variables: templateForm.variables.split(",").map(v => v.trim())
    });
  };

  const handleDeleteTemplate = (id: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplateMutation.mutate(id);
    }
  };

  if (user?.role !== "superadmin" && user?.role !== "admin") {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view WhatsApp settings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">WhatsApp Integration</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="api-config">API Configuration</TabsTrigger>
          <TabsTrigger value="message-templates">Message Templates</TabsTrigger>
        </TabsList>

        {/* API Configuration */}
        <TabsContent value="api-config">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business API Settings</CardTitle>
              <CardDescription>
                Configure your WhatsApp Business API for sending messages to leads and students.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSettings ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {whatsappSettings ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>API Key</Label>
                          <div className="p-2 border rounded-md bg-muted">
                            ••••••••{whatsappSettings.apiKey?.substring(whatsappSettings.apiKey.length - 4)}
                          </div>
                        </div>
                        <div>
                          <Label>Phone Number ID</Label>
                          <div className="p-2 border rounded-md bg-muted">
                            {whatsappSettings.phoneNumberId}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Business Account ID</Label>
                          <div className="p-2 border rounded-md bg-muted">
                            {whatsappSettings.businessAccountId}
                          </div>
                        </div>
                        <div>
                          <Label>Webhook Verify Token</Label>
                          <div className="p-2 border rounded-md bg-muted">
                            ••••••••{whatsappSettings.webhookVerifyToken?.substring(whatsappSettings.webhookVerifyToken.length - 4)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label>API Status:</Label>
                        <span className={`px-2 py-1 text-xs rounded-full ${whatsappSettings.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {whatsappSettings.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={() => setApiDialogOpen(true)}>
                          Edit Settings
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium">No API configuration found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Configure the WhatsApp Business API to start sending messages.
                      </p>
                      <Button onClick={() => setApiDialogOpen(true)}>
                        Configure API
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Message Templates */}
        <TabsContent value="message-templates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Message Templates</CardTitle>
                <CardDescription>
                  Create and manage templates for automated WhatsApp messages.
                </CardDescription>
              </div>
              <Button onClick={() => setTemplateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Template
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoadingTemplates ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {whatsappTemplates.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium">No templates found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create message templates to send to leads and students.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {whatsappTemplates.map((template) => (
                        <Card key={template.id} className="border border-border">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base font-semibold">{template.name}</CardTitle>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteTemplate(template.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground space-x-2">
                              <span className="capitalize">{template.type}</span>
                              <span>•</span>
                              <span className={template.isActive ? 'text-green-600' : 'text-red-600'}>
                                {template.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{template.content}</p>
                            {template.variables && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-muted-foreground">Variables:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {template.variables.split(',').map((variable, index) => (
                                    <span key={index} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                                      {variable.trim()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="pt-0">
                            <Button variant="secondary" size="sm" className="ml-auto">
                              <Send className="h-3 w-3 mr-1" /> Send Test
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Settings Dialog */}
      <Dialog open={apiDialogOpen} onOpenChange={setApiDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {whatsappSettings ? "Edit WhatsApp API Settings" : "Configure WhatsApp API"}
            </DialogTitle>
            <DialogDescription>
              Enter your WhatsApp Business API credentials to enable messaging.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                <Input
                  id="phoneNumberId"
                  name="phoneNumberId"
                  value={formData.phoneNumberId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="businessAccountId">Business Account ID</Label>
                <Input
                  id="businessAccountId"
                  name="businessAccountId"
                  value={formData.businessAccountId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <Input
                  id="accessToken"
                  name="accessToken"
                  value={formData.accessToken}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="webhookVerifyToken">Webhook Verify Token</Label>
                <Input
                  id="webhookVerifyToken"
                  name="webhookVerifyToken"
                  value={formData.webhookVerifyToken}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="isActive">API Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={saveMutation.isPending}
                className="w-full"
              >
                {saveMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Settings
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Message Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Message Template</DialogTitle>
            <DialogDescription>
              Create a new template for automated WhatsApp messages.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTemplateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={templateForm.name}
                  onChange={handleTemplateInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Template Type</Label>
                <Select 
                  value={templateForm.type} 
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="course_info">Course Information</SelectItem>
                    <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                    <SelectItem value="registration">Registration</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Template Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={templateForm.content}
                  onChange={handleTemplateInputChange}
                  rows={5}
                  placeholder="Enter message content. Use {{variable}} format for placeholders."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="variables">Variables (comma-separated)</Label>
                <Input
                  id="variables"
                  name="variables"
                  value={templateForm.variables}
                  onChange={handleTemplateInputChange}
                  placeholder="name, course, date"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="templateIsActive"
                  checked={templateForm.isActive}
                  onCheckedChange={handleTemplateSwitchChange}
                />
                <Label htmlFor="templateIsActive">Template Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={createTemplateMutation.isPending}
                className="w-full"
              >
                {createTemplateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Template
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}