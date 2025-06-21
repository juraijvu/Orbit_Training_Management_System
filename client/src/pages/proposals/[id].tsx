import { FC, useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { generateProposalPdf } from '@/lib/pdf-templates';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';
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
  ExternalLink,
  FileText,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Define the white logo filter CSS
const whiteLogoFilter = "brightness(0) invert(1)";

const ProposalDetailPage: FC = () => {
  const [match, params] = useRoute('/proposals/:id');
  const id = params?.id;
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [showSendDialog, setShowSendDialog] = useState<boolean>(false);
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch proposal details
  const { 
    data: proposal, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/proposals', id],
    queryFn: async () => {
      if (!id) throw new Error('No proposal ID provided');
      const res = await apiRequest('GET', `/api/proposals/${id}`);
      if (!res.ok) throw new Error('Proposal not found');
      return await res.json();
    },
    enabled: !!id
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
  
  // Fetch trainer data if trainerId is available
  const { data: trainer } = useQuery({
    queryKey: ['/api/trainers', proposal?.trainerId],
    queryFn: async () => {
      if (!proposal?.trainerId) return null;
      const res = await apiRequest('GET', `/api/trainers/${proposal.trainerId}`);
      return await res.json();
    },
    enabled: !!proposal?.trainerId
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
  
  // Upload company profile mutation
  const uploadCompanyProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`/api/proposals/${id}/upload-company-profile`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to upload company profile');
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/proposals', id] });
      toast({
        title: 'Company Profile Uploaded',
        description: 'The company profile has been uploaded successfully.',
      });
      setIsUploading(false);
    },
    onError: (error) => {
      setIsUploading(false);
      toast({
        title: 'Upload Failed',
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
  const handleDownload = async () => {
    toast({
      title: 'Generating PDF',
      description: 'Your proposal PDF is being generated...',
    });
    
    try {
      // Prepare trainer data for PDF
      const trainerData = trainer ? {
        id: trainer.id,
        fullName: trainer.fullName,
        specialization: trainer.specialization,
        email: trainer.email,
        phone: trainer.phone,
        profilePdf: trainer.profilePdf
      } : undefined;
      
      // Create PDF data object - IMPORTANT: Don't include company profile here anymore
      // as we'll handle it separately and attach it as the last page
      const pdfData = {
        proposalNumber: proposal.proposalNumber,
        companyName: proposal.companyName,
        contactPerson: proposal.contactPerson,
        email: proposal.email,
        phone: proposal.phone,
        courses: course ? [course.name] : ['Training Course'],
        totalAmount: proposal.totalAmount,
        discount: proposal.discount,
        finalAmount: proposal.finalAmount,
        coverPage: proposal.coverPage,
        presenterName: proposal.presenterName,
        presenterDetails: proposal.presenterDetails,
        courseFormat: proposal.courseFormat,
        trainingDuration: proposal.trainingDuration,
        trainingLocation: proposal.trainingLocation,
        content: course?.content ? JSON.parse(course.content) : {},
        date: new Date(proposal.date).toLocaleDateString(),
        logo: proposal.logoUrl,
        applyWhiteFilter: proposal.applyWhiteFilter,
        trainer: trainerData,
        // Don't include company profile in the main HTML generation
      };
      
      // Generate the HTML content
      const htmlContent = generateProposalPdf(pdfData);
      
      // Create PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add HTML content to PDF
      await new Promise<void>((resolve) => {
        pdf.html(htmlContent, {
          callback: function() {
            resolve();
          },
          x: 0,
          y: 0,
          width: 210, // A4 width in mm
          windowWidth: 800
        });
      });
      
      // Get the binary data from the jsPDF document
      const mainPdfBytes = pdf.output('arraybuffer');
      
      // Now, if there's a company profile, merge it as the last page using pdf-lib
      if (proposal.companyProfile) {
        try {
          // Add a transition page indicating company profile
          pdf.addPage();
          pdf.setFontSize(18);
          pdf.setFont("helvetica", "bold");
          pdf.text("Company Profile", 105, 20, { align: "center" });
          
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "normal");
          pdf.text("The company profile document follows on the next pages.", 105, 40, { align: "center" });
          pdf.text("It provides a comprehensive overview of our organization,", 105, 50, { align: "center" });
          pdf.text("our history, values, and commitment to excellence.", 105, 60, { align: "center" });
          
          // Get the updated binary data with the transition page
          const mainPdfBytesWithTransition = pdf.output('arraybuffer');
          
          // Fetch the company profile PDF
          const response = await fetch(proposal.companyProfile);
          const profilePdfArrayBuffer = await response.arrayBuffer();
          
          // Load both PDFs using pdf-lib
          const mergedPdf = await PDFDocument.create();
          const mainPdfDoc = await PDFDocument.load(mainPdfBytesWithTransition);
          const profilePdfDoc = await PDFDocument.load(profilePdfArrayBuffer);
          
          // Copy all pages from main PDF
          const mainPdfPages = await mergedPdf.copyPages(mainPdfDoc, mainPdfDoc.getPageIndices());
          for (const page of mainPdfPages) {
            mergedPdf.addPage(page);
          }
          
          // Copy all pages from profile PDF
          const profilePdfPages = await mergedPdf.copyPages(profilePdfDoc, profilePdfDoc.getPageIndices());
          for (const page of profilePdfPages) {
            mergedPdf.addPage(page);
          }
          
          // Save the merged PDF
          const mergedPdfBytes = await mergedPdf.save();
          const mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
          saveAs(mergedPdfBlob, `Proposal_${proposal.proposalNumber}_${proposal.companyName}.pdf`);
          
          toast({
            title: 'PDF Generated',
            description: 'Your proposal PDF has been generated successfully with company profile attached.',
          });
          
          return; // Exit early since we've already saved the PDF
        } catch (err) {
          console.error("Error merging company profile PDF:", err);
          // Continue with saving the main PDF if merging fails
        }
      }
      
      // If no company profile or if merging failed, save just the main PDF
      pdf.save(`Proposal_${proposal.proposalNumber}_${proposal.companyName}.pdf`);
          
      toast({
        title: 'PDF Generated',
        description: 'Your proposal PDF has been generated successfully.',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'PDF Generation Failed',
        description: 'There was an error generating the PDF. Please try again.',
        variant: 'destructive',
      });
    }
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
  
  // Handle file input click
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is a PDF
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a PDF file for the company profile.',
        variant: 'destructive',
      });
      return;
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: 'File Too Large',
        description: 'Company profile must be less than 10MB.',
        variant: 'destructive',
      });
      return;
    }
    
    // Create form data and upload
    const formData = new FormData();
    formData.append('companyProfileFile', file);
    
    setIsUploading(true);
    uploadCompanyProfileMutation.mutate(formData);
  };
  
  // Render loading state
  if (!match || !id) {
    return (
      <AppLayout>
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Proposal URL</h3>
          <p className="text-gray-500 mb-6">The proposal URL is not valid.</p>
          <Button onClick={() => setLocation('/proposals')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Proposals
          </Button>
        </div>
      </AppLayout>
    );
  }

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
          <Button onClick={() => setLocation('/proposals')}>
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
                    
                    <Separator className="my-6" />
                    
                    {/* Trainer Profile Section */}
                    {trainer && (
                      <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Trainer Profile</h2>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="flex items-start">
                            <div className="flex-grow">
                              <h3 className="font-bold text-lg mb-1">{trainer.fullName}</h3>
                              <p className="text-sm text-gray-600 mb-3">{trainer.specialization}</p>
                              <div className="space-y-1 text-sm">
                                <p><Mail className="inline h-4 w-4 mr-1" /> {trainer.email}</p>
                                <p><Phone className="inline h-4 w-4 mr-1" /> {trainer.phone}</p>
                              </div>
                              {trainer.profilePdf && (
                                <div className="mt-4">
                                  <p className="text-sm text-gray-700 mb-1">Profile Document:</p>
                                  <a 
                                    href={trainer.profilePdf} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center"
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download Trainer Profile
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Separator className="my-6" />
                    
                    {/* Company Profile Section */}
                    <div className="mt-8">
                      <h2 className="text-xl font-semibold mb-4">Company Profile</h2>
                      {proposal.companyProfile ? (
                        <div className="p-4 border rounded-md bg-gray-50 flex flex-col items-center justify-center">
                          <FileText className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="mb-4 text-center">Company Profile PDF attached to this proposal as the last page</p>
                          <div className="flex gap-4">
                            <a 
                              href={proposal.companyProfile} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-primary hover:underline"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              View Company Profile PDF
                            </a>
                            
                            {/* Replace option - only show for draft proposals */}
                            {proposal.status === 'draft' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={handleFileInputClick}
                                disabled={isUploading}
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>Replace PDF</>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        // No company profile uploaded yet
                        <div className="p-6 border rounded-md bg-gray-50 flex flex-col items-center justify-center">
                          <FileText className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="mb-4 text-center">No company profile has been uploaded</p>
                          <p className="text-sm text-gray-500 mb-4 text-center">
                            The company profile will appear as the last page of your proposal PDF
                          </p>
                          
                          {proposal.status === 'draft' && (
                            <Button 
                              onClick={handleFileInputClick}
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>Upload Company Profile</>
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {/* Hidden file input */}
                      <input 
                        ref={fileInputRef} 
                        type="file" 
                        accept="application/pdf" 
                        onChange={handleFileChange} 
                        hidden 
                      />
                    </div>
                    {/* End Company Profile Section */}
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
                
                {/* Trainer Profile section moved to Content tab */}
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
                
                {trainer && (
                  <div>
                    <p className="text-sm text-gray-500">Trainer</p>
                    <p className="font-medium">{trainer.fullName}</p>
                    <p className="text-sm text-gray-600">{trainer.specialization}</p>
                  </div>
                )}
                
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