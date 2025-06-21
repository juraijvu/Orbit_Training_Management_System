import React, { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save } from "lucide-react";

// Form validation schema
const proposalEditSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  courseIds: z.string().min(1, "Course selection is required"),
  trainerId: z.union([z.number(), z.string().transform(val => val ? parseInt(val) : undefined)]).optional(),
  totalAmount: z.string().min(1, "Total amount is required"),
  discount: z.string().default("0"),
  finalAmount: z.string().min(1, "Final amount is required"),
  coverPage: z.string().min(1, "Cover page title is required"),
  content: z.string().optional(),
  status: z.string().default("draft"),
  date: z.string().default(format(new Date(), 'yyyy-MM-dd')),
});

type ProposalEditFormValues = z.infer<typeof proposalEditSchema>;

export default function ProposalEditPage() {
  const [match, params] = useRoute('/proposals/:id/edit');
  const id = params?.id;
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch proposal data
  const {
    data: proposal,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/proposals/${id}`],
    enabled: !!id,
  });

  // Fetch courses
  const { data: courses } = useQuery({
    queryKey: ['/api/courses'],
  });

  // Fetch trainers
  const { data: trainers } = useQuery({
    queryKey: ['/api/trainers'],
  });

  // Define form
  const form = useForm<ProposalEditFormValues>({
    resolver: zodResolver(proposalEditSchema),
    defaultValues: {
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      courseIds: '',
      totalAmount: '',
      discount: '0',
      finalAmount: '',
      coverPage: 'Professional Training Proposal',
      content: JSON.stringify([
        { title: 'Introduction', text: 'This proposal outlines the training services offered by Orbit Institute...' },
        { title: 'Training Overview', text: 'Our training program is designed to...' },
        { title: 'Methodology', text: 'We employ interactive and hands-on training methods...' },
        { title: 'Delivery Timeline', text: 'The training will be conducted over...' },
        { title: 'Investment', text: 'The investment for this training program is...' }
      ]),
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'draft',
    }
  });

  // Update form when proposal data is loaded
  useEffect(() => {
    if (proposal) {
      form.reset({
        companyName: proposal.companyName || '',
        contactPerson: proposal.contactPerson || '',
        email: proposal.email || '',
        phone: proposal.phone || '',
        courseIds: proposal.courseIds || '',
        trainerId: proposal.trainerId || undefined,
        totalAmount: proposal.totalAmount || '',
        discount: proposal.discount || '0',
        finalAmount: proposal.finalAmount || '',
        coverPage: proposal.coverPage || 'Professional Training Proposal',
        content: proposal.content || JSON.stringify([
          { title: 'Introduction', text: 'This proposal outlines the training services offered by Orbit Institute...' },
          { title: 'Training Overview', text: 'Our training program is designed to...' },
          { title: 'Methodology', text: 'We employ interactive and hands-on training methods...' },
          { title: 'Delivery Timeline', text: 'The training will be conducted over...' },
          { title: 'Investment', text: 'The investment for this training program is...' }
        ]),
        date: proposal.date ? format(new Date(proposal.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        status: proposal.status || 'draft',
      });
    }
  }, [proposal, form]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ProposalEditFormValues) => {
      const response = await apiRequest(`/api/proposals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Proposal updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/proposals/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });
      navigate(`/proposals/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update proposal',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = async (values: ProposalEditFormValues) => {
    // Format data before submission
    const formattedValues = {
      ...values,
      trainerId: values.trainerId || null,
      totalAmount: String(values.totalAmount || 0),
      discount: String(values.discount || 0),
      finalAmount: String(values.finalAmount || 0),
    };

    updateMutation.mutate(formattedValues);
  };

  // Handle loading states
  if (!match || !id) {
    return (
      <AppLayout>
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid URL</h3>
          <p className="text-gray-500 mb-6">The proposal edit URL is not valid.</p>
          <Button onClick={() => navigate('/proposals')}>
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

  if (error || !proposal) {
    return (
      <AppLayout>
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Proposal Not Found</h3>
          <p className="text-gray-500 mb-6">The proposal you're trying to edit doesn't exist.</p>
          <Button onClick={() => navigate('/proposals')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Proposals
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/proposals/${id}`)} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Edit Proposal</h1>
            <p className="text-gray-600">Proposal #{proposal.proposalNumber}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proposal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="courseIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses?.map((course: any) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              {course.name}
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
                  name="trainerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trainer</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a trainer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {trainers?.map((trainer: any) => (
                            <SelectItem key={trainer.id} value={trainer.id.toString()}>
                              {trainer.fullName} - {trainer.specialization || 'WEB DEVELOPMENT , DIGITAL MARKETING'}
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
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount (AED)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            // Auto-calculate final amount
                            const total = parseFloat(e.target.value) || 0;
                            const discount = parseFloat(form.getValues('discount') || '0');
                            const final = total - (total * discount / 100);
                            form.setValue('finalAmount', String(final));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          max={20}
                          {...field}
                          onChange={(e) => {
                            let value = parseFloat(e.target.value) || 0;
                            if (value > 20) {
                              value = 20;
                              toast({
                                title: "Discount limited",
                                description: "Maximum discount allowed is 20%",
                                variant: "destructive"
                              });
                            }
                            field.onChange(String(value));
                            // Auto-calculate final amount
                            const total = parseFloat(form.getValues('totalAmount') || '0');
                            const final = total - (total * value / 100);
                            form.setValue('finalAmount', String(final));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="finalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final Amount (AED)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} readOnly />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="coverPage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Page Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
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

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/proposals/${id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Proposal
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}