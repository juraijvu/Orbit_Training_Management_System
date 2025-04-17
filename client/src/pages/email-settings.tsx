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
import { Loader2, Mail, Save, Plus, Trash2, Send } from "lucide-react";

export default function EmailSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  // API Dialog no longer needed as settings are directly on the page
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("api-config");
  
  const [formData, setFormData] = useState({
    apiKey: "",
    apiSecret: "",
    senderName: "",
    senderEmail: "",
    replyToEmail: "",
    enabled: false
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
        description: "Your Titan Email API settings have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email/settings"] });
      // API dialog management removed
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

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        apiKey: settings.apiKey || "",
        apiSecret: settings.apiSecret || "",
        senderName: settings.senderName || "",
        senderEmail: settings.senderEmail || "",
        replyToEmail: settings.replyToEmail || "",
        enabled: settings.enabled || false
      });
    }
  }, [settings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = (e) => {
    const { name, value } = e.target;
    setTemplateForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEnabledChange = (checked) => {
    setFormData(prev => ({ ...prev, enabled: checked }));
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
        <h1 className="text-3xl font-bold">Titan Email Integration</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="api-config">API Configuration</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="api-config">
          <Card>
            <CardHeader>
              <CardTitle>Titan Email API Configuration</CardTitle>
              <CardDescription>
                Configure your Titan Email API credentials to enable email communication.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="senderName">Sender Name</Label>
                    <Input 
                      id="senderName"
                      name="senderName"
                      value={formData.senderName || ""}
                      placeholder="Orbit Institute"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="senderEmail">Sender Email</Label>
                    <Input 
                      id="senderEmail"
                      name="senderEmail"
                      value={formData.senderEmail || ""}
                      placeholder="info@orbitinstitute.com"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="replyToEmail">Reply To Email</Label>
                  <Input 
                    id="replyToEmail"
                    name="replyToEmail"
                    value={formData.replyToEmail || ""}
                    placeholder="support@orbitinstitute.com"
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="enabled"
                    checked={formData.enabled || false}
                    onCheckedChange={handleEnabledChange}
                  />
                  <Label htmlFor="enabled">Enable Titan Email Integration</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="default" onClick={() => {
                toast({
                  title: "Connection Test",
                  description: "Testing connection functionality will be implemented in a future update.",
                });
              }}>
                <Mail className="mr-2 h-4 w-4" />
                Test Connection
              </Button>
              <Button onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

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

      {/* API Settings Dialog removed as settings are now directly on the main page */}

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
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="subject-input">Email Subject</Label>
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
                <Label htmlFor="bodyText-input">Email Body (Text)</Label>
                <Textarea 
                  id="bodyText-input"
                  name="bodyText"
                  value={templateForm.bodyText}
                  onChange={handleTemplateChange}
                  placeholder="Enter the plain text version of your email"
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="bodyHtml-input">Email Body (HTML)</Label>
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
                <div className="flex mt-1 mb-2">
                  <Input 
                    value={newVariable}
                    onChange={(e) => setNewVariable(e.target.value)}
                    placeholder="Add a variable (e.g., {{name}})"
                    className="rounded-r-none"
                  />
                  <Button 
                    type="button"
                    onClick={addVariable}
                    className="rounded-l-none"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {templateForm.variables.map((variable, index) => (
                    <div 
                      key={index}
                      className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                    >
                      <span className="text-sm mr-2">{variable}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => removeVariable(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="isDefault-input"
                  checked={templateForm.isDefault}
                  onCheckedChange={handleDefaultChange}
                />
                <Label htmlFor="isDefault-input">Set as default template for this category</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setTemplateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createTemplateMutation.isPending}
              >
                {createTemplateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Template
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}