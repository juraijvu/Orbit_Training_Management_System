import { FC, useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Loader2, 
  Download, 
  Building, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  Send,
  Check,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Define the white logo filter CSS
const whiteLogoFilter = "brightness(0) invert(1)";

const ProposalDetailPage: FC = () => {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [showSendDialog, setShowSendDialog] = useState<boolean>(false);
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  
  // Fetch proposal details
  const { 
    data: proposal, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/proposals', id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/proposals/${id}`);
      return await res.json();
    }
  });
  
  // Fetch related course for the proposal
  const { data: course } = useQuery({
    queryKey: ['/api/courses', proposal?.courseId],
    queryFn: async () => {
      if (!proposal?.courseId) return null;
      const res = await apiRequest('GET', `/api/courses/${proposal.courseId}`);
      return await res.json();
    },
    enabled: !!proposal?.courseId
  });

  // Update proposal status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest('PATCH', `/api/proposals/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/proposals', id] });
      toast({
        title: 'Status Updated',
        description: 'The proposal status has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Send proposal by email mutation
  const sendProposalMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest('POST', `/api/proposals/${id}/send`, { email });
      return await res.json();
    },
    onSuccess: () => {
      setShowSendDialog(false);
      toast({
        title: 'Proposal Sent',
        description: 'The proposal has been sent successfully.',
      });
      // Update status to 'sent'
      updateStatusMutation.mutate('sent');
    },
    onError: (error) => {
      toast({
        title: 'Send Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Initialize recipient email with proposal contact email
  useEffect(() => {
    if (proposal?.email) {
      setRecipientEmail(proposal.email);
    }
  }, [proposal?.email]);
  
  // Handle back button click
  const handleBack = () => {
    setLocation('/proposals');
  };
  
  // Handle download proposal
  const handleDownload = () => {
    toast({
      title: 'Generating PDF',
      description: 'Your proposal PDF is being generated...',
    });
    
    // TODO: Implement PDF generation
    // This would connect to a server endpoint that generates and returns a PDF
  };
  
  // Handle proposal status change
  const handleStatusChange = (status: string) => {
    updateStatusMutation.mutate(status);
  };
  
  // Handle send proposal
  const handleSendProposal = () => {
    setShowSendDialog(true);
  };
  
  // Submit send proposal
  const submitSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    sendProposalMutation.mutate(recipientEmail);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading proposal...</span>
        </div>
      </AppLayout>
    );
  }
  
  // Render error state
  if (error || !proposal) {
    return (
      <AppLayout>
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Proposal Not Found</h3>
          <p className="text-gray-500 mb-6">The proposal you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Proposals
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Draft</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Sent</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <AppLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={handleBack} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{proposal.companyName}</h1>
            <div className="flex items-center mt-1">
              <p className="text-gray-600 mr-3">Proposal #{proposal.proposalNumber}</p>
              {getStatusBadge(proposal.status)}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {proposal.status === 'draft' && (
            <Button onClick={handleSendProposal}>
              <Send className="mr-2 h-4 w-4" />
              Send Proposal
            </Button>
          )}
          
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          
          <Button variant="ghost" onClick={() => setLocation(`/proposals/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Proposal Preview</CardTitle>
              <CardDescription>Preview how your proposal will appear to the client</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="coverPage" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="coverPage">Cover Page</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                </TabsList>
                
                <TabsContent value="coverPage" className="border rounded-lg p-6">
                  <div className="relative aspect-[1/1.414] w-full max-w-[595px] mx-auto border shadow-sm bg-white">
                    <div className="absolute inset-0 flex">
                      {/* Left sidebar (black background) */}
                      <div className="w-2/5 bg-black p-6 flex flex-col">
                        {/* Company logo - with white filter applied */}
                        <div className="mb-10 flex justify-center">
                          {proposal.logoUrl ? (
                            <img 
                              src={proposal.logoUrl} 
                              alt="Company Logo" 
                              className="max-h-24"
                              style={{ filter: whiteLogoFilter }} // Apply white filter
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
                              <Building className="h-12 w-12 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Course Name */}
                        <div className="mb-8 text-center">
                          <h2 className="text-white text-xl font-bold mb-1">
                            {course?.name || 'Course Name'}
                          </h2>
                        </div>
                        
                        {/* Presenter Info - White text */}
                        <div className="mt-auto text-white">
                          <p className="mb-3 text-sm">{proposal.presenterName || 'Presented by: Training Coordinator'}</p>
                          <p className="text-sm">{proposal.presentedTo || `Presented to: ${proposal.companyName}`}</p>
                        </div>
                      </div>
                      
                      {/* Right content area */}
                      <div className="w-3/5 p-6 flex flex-col">
                        {/* Client Info */}
                        <div className="mb-8">
                          <h1 className="text-2xl font-bold mb-6">{proposal.companyName}</h1>
                          <h3 className="text-xl font-semibold mb-4">Training Proposal</h3>
                          <p className="text-gray-600 mb-6">{new Date(proposal.date).toLocaleDateString()}</p>
                          
                          <div className="space-y-2 mt-8">
                            <p className="font-medium">{proposal.contactPerson}</p>
                            <p className="text-gray-600">{proposal.email}</p>
                            <p className="text-gray-600">{proposal.phone}</p>
                          </div>
                        </div>
                        
                        {/* Trainer Info */}
                        <div className="mt-auto">
                          <p className="font-medium">
                            {proposal.trainerName || 'Lead Trainer: John Doe'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="content">
                  <div className="border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                      <li>Introduction</li>
                      <li>Course Overview</li>
                      <li>Training Methodology</li>
                      <li>Course Modules</li>
                      <li>Timeline & Schedule</li>
                      <li>Investment</li>
                    </ol>
                    
                    <Separator className="my-6" />
                    
                    {course ? (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Course Modules</h2>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="font-medium mb-2">Course: {course.name}</div>
                          <div className="text-sm text-gray-600 mb-2">Duration: {course.duration}</div>
                          <div className="text-sm text-gray-600">Fee: AED {course.fee}</div>
                        </div>
                        
                        {course.content && (
                          <div className="mt-4">
                            <h3 className="text-lg font-medium mb-2">Modules:</h3>
                            <div className="pl-4">
                              {/* Parse and display course modules */}
                              {(() => {
                                try {
                                  const modules = JSON.parse(course.content);
                                  return (
                                    <ul className="list-disc space-y-4">
                                      {modules.map((module: any, idx: number) => (
                                        <li key={idx} className="ml-4">
                                          <span className="font-medium">{module.name}</span>
                                          {module.subItems && module.subItems.length > 0 && (
                                            <ul className="list-circle pl-4 mt-1 space-y-1">
                                              {module.subItems.map((item: string, i: number) => (
                                                <li key={i} className="text-sm">{item}</li>
                                              ))}
                                            </ul>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  );
                                } catch {
                                  return <p className="text-red-500">Error parsing course content.</p>;
                                }
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No course selected for this proposal.
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="pricing">
                  <div className="border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Pricing & Investment</h2>
                    
                    <div className="overflow-hidden bg-white border rounded-lg mb-6">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (AED)</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {course?.name || "Training Course"} - Base Amount
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                              {proposal.totalAmount?.toLocaleString()}
                            </td>
                          </tr>
                          
                          {proposal.discount > 0 && (
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Discount ({proposal.discount}%)
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 text-right">
                                - {(proposal.totalAmount * (proposal.discount / 100)).toLocaleString()}
                              </td>
                            </tr>
                          )}
                          
                          <tr className="bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Final Amount
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                              {proposal.finalAmount?.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Payment Terms</h3>
                      <p className="text-sm text-gray-600">
                        Payment is due within 30 days of acceptance of this proposal. We accept bank transfers,
                        credit cards, and digital payment methods including Tabby and Tamara.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Proposal Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{proposal.companyName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="font-medium">{proposal.contactPerson}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{proposal.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{proposal.phone}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{new Date(proposal.date).toLocaleDateString()}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium">AED {proposal.totalAmount?.toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Discount</p>
                  <p className="font-medium">{proposal.discount}%</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Final Amount</p>
                  <p className="font-medium">AED {proposal.finalAmount?.toLocaleString()}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(proposal.status)}
                  </div>
                </div>
                
                {proposal.status === 'sent' && (
                  <div className="pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mr-2" 
                      onClick={() => handleStatusChange('accepted')}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Mark as Accepted
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-500" 
                      onClick={() => handleStatusChange('rejected')}
                    >
                      Mark as Rejected
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {proposal.status === 'accepted' && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setLocation('/quotations/new?from_proposal=' + id)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Create Quotation
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Send Proposal Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Proposal</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={submitSendProposal} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSendDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={sendProposalMutation.isPending}
              >
                {sendProposalMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Proposal'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ProposalDetailPage;