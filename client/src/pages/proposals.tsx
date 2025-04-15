import { FC, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { 
  FilePlus, 
  Loader2, 
  Building, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Users,
  DollarSign,
  Percent,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertProposalSchema } from '@shared/schema';
import { z } from 'zod';
import { format } from 'date-fns';

// Define proposal form type
const proposalFormSchema = insertProposalSchema.extend({
  date: z.string().refine(val => {
    try {
      const date = new Date(val);
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  }, {
    message: "Please enter a valid date",
  }),
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

// Proposal component
const ProposalsPage: FC = () => {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isNewProposalOpen, setIsNewProposalOpen] = useState(false);
  
  // Fetch proposals
  const { data: proposals, isLoading } = useQuery({
    queryKey: ['/api/proposals'],
  });
  
  // New proposal form
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      courses: [],
      totalAmount: 0,
      discount: 0,
      finalAmount: 0,
      coverPage: 'Professional Training Proposal',
      content: JSON.stringify([
        { title: 'Introduction', text: 'This proposal outlines the training services offered by Orbit Institute...' },
        { title: 'Training Overview', text: 'Our training program is designed to...' },
        { title: 'Methodology', text: 'We employ interactive and hands-on training methods...' },
        { title: 'Delivery Timeline', text: 'The training will be conducted over...' },
        { title: 'Investment', text: 'The investment for this training program is...' },
      ]),
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'draft',
    },
  });
  
  // Create proposal mutation
  const createProposalMutation = useMutation({
    mutationFn: async (data: ProposalFormValues) => {
      const res = await apiRequest('POST', '/api/proposals', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });
      setIsNewProposalOpen(false);
      form.reset();
      
      toast({
        title: 'Success',
        description: 'Proposal created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create proposal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: ProposalFormValues) => {
    createProposalMutation.mutate(values);
  };
  
  // Handle new proposal button click
  const handleNewProposal = () => {
    setIsNewProposalOpen(true);
  };
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading proposals...</span>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Proposals</h1>
          <p className="text-gray-600">Create and manage training proposals for corporate clients</p>
        </div>
        <Button onClick={handleNewProposal}>
          <FilePlus className="mr-2 h-4 w-4" />
          New Proposal
        </Button>
      </div>
      
      {proposals?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setLocation(`/proposals/${proposal.id}`)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{proposal.companyName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500 mb-4">
                  <p><User className="inline h-4 w-4 mr-1" /> {proposal.contactPerson}</p>
                  <p><Calendar className="inline h-4 w-4 mr-1" /> {new Date(proposal.date).toLocaleDateString()}</p>
                  <p><DollarSign className="inline h-4 w-4 mr-1" /> AED {proposal.finalAmount.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    proposal.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    proposal.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                  </span>
                  <Button variant="outline" size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement print functionality
                          }}>
                    Print
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <FilePlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Proposals Yet</h3>
              <p className="text-gray-500 mb-6">
                You haven't created any proposals yet. Create your first proposal for a corporate client.
              </p>
              <Button onClick={handleNewProposal}>
                <FilePlus className="mr-2 h-4 w-4" />
                Create New Proposal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* New Proposal Dialog */}
      <Dialog open={isNewProposalOpen} onOpenChange={setIsNewProposalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Proposal</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-4">Client Information</h3>
                </div>
                
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
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-4">Proposal Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                              const value = parseFloat(e.target.value) || 0;
                              field.onChange(value);
                              
                              // Calculate final amount
                              const discount = form.getValues('discount') || 0;
                              form.setValue('finalAmount', value - (value * discount / 100));
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
                            {...field} 
                            onChange={(e) => {
                              let value = parseFloat(e.target.value) || 0;
                              
                              // Limit discount to 20%
                              if (value > 20) {
                                value = 20;
                                toast({
                                  title: "Discount limited",
                                  description: "Maximum discount allowed is 20%",
                                  variant: "destructive"
                                });
                              }
                              
                              field.onChange(value);
                              
                              // Calculate final amount
                              const totalAmount = form.getValues('totalAmount') || 0;
                              form.setValue('finalAmount', totalAmount - (totalAmount * value / 100));
                            }}
                            max={20}
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
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewProposalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createProposalMutation.isPending}
                >
                  {createProposalMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Proposal'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ProposalsPage;