import React, { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Mail, Search, Send, Plus, RefreshCw, Eye, Edit, Trash, Paperclip, X, FileText, File, Download } from "lucide-react";
import { Tabs as TabsComponent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

export default function EmailsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("inbox");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [newEmail, setNewEmail] = useState({
    recipientEmail: "",
    subject: "",
    bodyText: "",
    bodyHtml: "",
    useHtml: false,
    signature: "",
    useSignature: false,
    templateId: null,
    attachments: [] as File[],
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [composeTab, setComposeTab] = useState("text");

  // Fetch email history
  const { data: emailHistory = [], isLoading } = useQuery({
    queryKey: ["/api/email/history"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/email/history");
      const data = await res.json();
      return data;
    },
  });

  // Fetch email templates
  const { data: emailTemplates = [] } = useQuery({
    queryKey: ["/api/email/templates"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/email/templates");
      const data = await res.json();
      return data;
    },
  });

  // Fetch leads for recipient suggestions
  const { data: leads = [] } = useQuery({
    queryKey: ["/api/crm/leads"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/crm/leads");
      const data = await res.json();
      return data;
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (emailData: any) => {
      // If we have attachments, we need to use FormData
      if (emailData.attachments && emailData.attachments.length > 0) {
        const formData = new FormData();
        
        // Add email data
        formData.append('recipientEmail', emailData.recipientEmail);
        formData.append('subject', emailData.subject);
        formData.append('bodyText', emailData.bodyText);
        formData.append('bodyHtml', emailData.bodyHtml || '');
        formData.append('useHtml', String(emailData.useHtml));
        formData.append('signature', emailData.signature || '');
        formData.append('useSignature', String(emailData.useSignature));
        
        if (emailData.templateId) {
          formData.append('templateId', String(emailData.templateId));
        }
        
        // Add each attachment
        emailData.attachments.forEach((file: File, index: number) => {
          formData.append(`emailAttachment`, file);
        });
        
        // Send FormData request
        const res = await fetch('/api/email/send-with-attachments', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (!res.ok) {
          throw new Error('Failed to send email with attachments');
        }
        
        return res.json();
      } else {
        // Regular JSON request without attachments
        const res = await apiRequest("POST", "/api/email/send", emailData);
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Email sent successfully",
        description: "Your email has been sent.",
      });
      setIsComposeOpen(false);
      setNewEmail({
        recipientEmail: "",
        subject: "",
        bodyText: "",
        bodyHtml: "",
        useHtml: false,
        signature: "",
        useSignature: false,
        templateId: null,
        attachments: [],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email/history"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send email",
        description: error.message || "There was an error sending your email.",
        variant: "destructive",
      });
    },
  });

  // Apply template
  const handleApplyTemplate = (templateId: number) => {
    const template = emailTemplates.find((t: any) => t.id === templateId);
    if (template) {
      setNewEmail({
        ...newEmail,
        subject: template.subject,
        bodyText: template.bodyText,
        bodyHtml: template.bodyHtml || '',
        templateId: template.id,
      });
    }
  };
  
  // Handle file attachments
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setNewEmail({
        ...newEmail,
        attachments: [...newEmail.attachments, ...newFiles]
      });
    }
  };
  
  // Remove an attachment
  const handleRemoveAttachment = (index: number) => {
    const updatedAttachments = [...newEmail.attachments];
    updatedAttachments.splice(index, 1);
    setNewEmail({
      ...newEmail,
      attachments: updatedAttachments
    });
  };
  
  // Toggle HTML editor
  const handleToggleHtml = (checked: boolean) => {
    setNewEmail({
      ...newEmail,
      useHtml: checked,
      // If switching to HTML for the first time, convert plain text to HTML
      bodyHtml: checked && !newEmail.bodyHtml ? newEmail.bodyText.replace(/\n/g, "<br />") : newEmail.bodyHtml
    });
  };
  
  // Toggle signature
  const handleToggleSignature = (checked: boolean) => {
    setNewEmail({
      ...newEmail,
      useSignature: checked
    });
  };

  // Filter emails based on tab and search query
  const filteredEmails = React.useMemo(() => {
    let filtered = [...emailHistory];
    
    // Filter by tab
    if (activeTab === "sent") {
      filtered = filtered.filter((email: any) => email.status === "sent");
    } else if (activeTab === "drafts") {
      filtered = filtered.filter((email: any) => email.status === "draft");
    } else if (activeTab === "failed") {
      filtered = filtered.filter((email: any) => email.status === "failed");
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (email: any) =>
          email.subject?.toLowerCase().includes(query) ||
          email.recipientEmail?.toLowerCase().includes(query) ||
          email.bodyText?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [emailHistory, activeTab, searchQuery]);

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
  const paginatedEmails = filteredEmails.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleSendEmail = () => {
    sendEmailMutation.mutate(newEmail);
  };

  const handleViewEmail = (email: any) => {
    setSelectedEmail(email);
    setIsViewOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Email Management</h1>
        <Button onClick={() => setIsComposeOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Compose Email
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="inbox">All</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-[400px]">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : paginatedEmails.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-[400px] text-center">
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium">No emails found</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchQuery
                      ? "Try adjusting your search query."
                      : "Your email history will appear here."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEmails.map((email: any) => (
                      <TableRow key={email.id}>
                        <TableCell className="font-medium">
                          {email.recipientEmail}
                        </TableCell>
                        <TableCell>{email.subject}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              email.status === "sent"
                                ? "bg-green-100 text-green-800"
                                : email.status === "draft"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {email.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(email.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewEmail(email)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            {totalPages > 1 && (
              <CardFooter className="flex justify-center py-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => (p > 1 ? p - 1 : p))}
                        className={page === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          isActive={page === p}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                        className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compose Email Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compose New Email</DialogTitle>
            <DialogDescription>
              Create and send a new email to leads or students.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <Label htmlFor="recipient" className="text-right pt-2">
                Recipient:
              </Label>
              <Input
                id="recipient"
                className="col-span-3"
                placeholder="Email address"
                value={newEmail.recipientEmail}
                onChange={(e) =>
                  setNewEmail({ ...newEmail, recipientEmail: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Label htmlFor="template" className="text-right pt-2">
                Template:
              </Label>
              <Select
                onValueChange={(value) => handleApplyTemplate(Number(value))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {emailTemplates.map((template: any) => (
                    <SelectItem key={template.id} value={String(template.id)}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Label htmlFor="subject" className="text-right pt-2">
                Subject:
              </Label>
              <Input
                id="subject"
                className="col-span-3"
                placeholder="Email subject"
                value={newEmail.subject}
                onChange={(e) =>
                  setNewEmail({ ...newEmail, subject: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="text-right pt-2 flex items-center justify-end gap-2">
                <Label htmlFor="useHtml">HTML</Label>
                <Switch 
                  id="useHtml" 
                  checked={newEmail.useHtml}
                  onCheckedChange={handleToggleHtml}
                />
              </div>
              <div className="col-span-3 flex items-center gap-4">
                <TabsComponent value={composeTab} onValueChange={setComposeTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">Text</TabsTrigger>
                    <TabsTrigger value="html" disabled={!newEmail.useHtml}>HTML</TabsTrigger>
                  </TabsList>
                  <TabsContent value="text" className="mt-2">
                    <Textarea
                      id="message"
                      className="w-full"
                      placeholder="Write your message here"
                      rows={8}
                      value={newEmail.bodyText}
                      onChange={(e) =>
                        setNewEmail({ ...newEmail, bodyText: e.target.value })
                      }
                    />
                  </TabsContent>
                  <TabsContent value="html" className="mt-2">
                    <Textarea
                      id="html-message"
                      className="w-full font-mono text-sm"
                      placeholder="<p>Write your HTML message here</p>"
                      rows={8}
                      value={newEmail.bodyHtml}
                      onChange={(e) =>
                        setNewEmail({ ...newEmail, bodyHtml: e.target.value })
                      }
                    />
                  </TabsContent>
                </TabsComponent>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="text-right pt-2 flex items-center justify-end gap-2">
                <Label htmlFor="useSignature">Signature</Label>
                <Switch 
                  id="useSignature" 
                  checked={newEmail.useSignature}
                  onCheckedChange={handleToggleSignature}
                />
              </div>
              <div className="col-span-3">
                {newEmail.useSignature && (
                  <Textarea
                    id="signature"
                    className="w-full"
                    placeholder="Add your signature here"
                    rows={3}
                    value={newEmail.signature}
                    onChange={(e) =>
                      setNewEmail({ ...newEmail, signature: e.target.value })
                    }
                  />
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right pt-2">
                Attachments:
              </Label>
              <div className="col-span-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Paperclip className="h-4 w-4" />
                      Add Attachment
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleAttachmentChange}
                      multiple
                    />
                    <span className="text-sm text-muted-foreground">
                      Max file size: 15MB
                    </span>
                  </div>
                  
                  {newEmail.attachments.length > 0 && (
                    <div className="border rounded-md p-3 mt-2">
                      <h4 className="text-sm font-medium mb-2">Attached Files ({newEmail.attachments.length})</h4>
                      <ul className="space-y-2">
                        {newEmail.attachments.map((file, index) => (
                          <li key={index} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="truncate max-w-[200px]">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({Math.round(file.size / 1024)} KB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAttachment(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={sendEmailMutation.isPending || !newEmail.recipientEmail || !newEmail.subject}
            >
              {sendEmailMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Email Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Details</DialogTitle>
          </DialogHeader>

          {selectedEmail && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-sm font-medium text-right">Recipient:</div>
                <div className="col-span-3">{selectedEmail.recipientEmail}</div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="text-sm font-medium text-right">Subject:</div>
                <div className="col-span-3">{selectedEmail.subject}</div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="text-sm font-medium text-right">Status:</div>
                <div className="col-span-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedEmail.status === "sent"
                        ? "bg-green-100 text-green-800"
                        : selectedEmail.status === "draft"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedEmail.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="text-sm font-medium text-right">Date:</div>
                <div className="col-span-3">
                  {format(new Date(selectedEmail.createdAt), "PPpp")}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="text-sm font-medium text-right">Message:</div>
                <div className="col-span-3 border rounded-md p-4">
                  {selectedEmail.bodyHtml ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                      className="prose prose-sm max-w-none"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap">{selectedEmail.bodyText}</div>
                  )}
                </div>
              </div>

              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-sm font-medium text-right">Attachments:</div>
                  <div className="col-span-3">
                    <div className="border rounded-md p-3">
                      <ul className="space-y-2">
                        {selectedEmail.attachments.map((attachment: any, index: number) => {
                          // Handle both string paths and object format
                          const isObject = typeof attachment === 'object';
                          const filename = isObject ? attachment.filename : `Attachment ${index + 1}`;
                          const path = isObject ? attachment.path : attachment;
                          
                          return (
                            <li key={index} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="truncate max-w-[200px]">{filename}</span>
                                {isObject && attachment.size && (
                                  <span className="text-xs text-muted-foreground">
                                    ({Math.round(attachment.size / 1024)} KB)
                                  </span>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/uploads/emails/${path}`, '_blank')}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}