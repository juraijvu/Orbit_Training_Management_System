import { FC, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Plus,
  Pencil,
  Trash2,
  Filter,
  DollarSign,
  Tags,
  BookmarkCheck,
  CreditCard,
  Building,
  Mail,
  Tag,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

// Configuration types
interface ConfigItem {
  id: number;
  name: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
  isActive: boolean;
}

// Form schemas
const configItemSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  color: z.string().optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type ConfigItemFormValues = z.infer<typeof configItemSchema>;

const CRMSettingsPage: FC = () => {
  const [activeTab, setActiveTab] = useState('expense-categories');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ConfigItem | null>(null);
  const { toast } = useToast();

  // Forms setup
  const addForm = useForm<ConfigItemFormValues>({
    resolver: zodResolver(configItemSchema),
    defaultValues: {
      name: "",
      description: "",
      isDefault: false,
      isActive: true,
    },
  });

  const editForm = useForm<ConfigItemFormValues>({
    resolver: zodResolver(configItemSchema),
    defaultValues: {
      name: "",
      description: "",
      isDefault: false,
      isActive: true,
    },
  });

  // Fetch configuration data
  const { data: expenseCategories, isLoading: isCategoriesLoading } = useQuery<ConfigItem[]>({
    queryKey: ['/api/settings/crm/expense-categories'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        { id: 1, name: 'Marketing', description: 'Marketing and advertising expenses', color: '#4CAF50', isDefault: true, isActive: true },
        { id: 2, name: 'Office Supplies', description: 'Office supplies and equipment', color: '#2196F3', isDefault: false, isActive: true },
        { id: 3, name: 'Rent', description: 'Office rent and utilities', color: '#9C27B0', isDefault: false, isActive: true },
        { id: 4, name: 'Utilities', description: 'Electricity, water, internet', color: '#FF9800', isDefault: false, isActive: true },
        { id: 5, name: 'Travel', description: 'Business travel expenses', color: '#795548', isDefault: false, isActive: true },
        { id: 6, name: 'Training', description: 'Staff training and development', color: '#607D8B', isDefault: false, isActive: true },
        { id: 7, name: 'Miscellaneous', description: 'Other uncategorized expenses', color: '#9E9E9E', isDefault: false, isActive: true },
      ];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const { data: expenseStatuses, isLoading: isStatusesLoading } = useQuery<ConfigItem[]>({
    queryKey: ['/api/settings/crm/expense-statuses'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        { id: 1, name: 'Pending', description: 'Waiting for approval', color: '#FFC107', isDefault: true, isActive: true },
        { id: 2, name: 'Approved', description: 'Expense approved', color: '#4CAF50', isDefault: false, isActive: true },
        { id: 3, name: 'Rejected', description: 'Expense rejected', color: '#F44336', isDefault: false, isActive: true },
        { id: 4, name: 'Paid', description: 'Expense has been paid', color: '#2196F3', isDefault: false, isActive: true },
      ];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const { data: paymentMethods, isLoading: isPaymentMethodsLoading } = useQuery<ConfigItem[]>({
    queryKey: ['/api/settings/crm/payment-methods'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        { id: 1, name: 'Cash', description: 'Cash payment', color: '#4CAF50', isDefault: true, isActive: true },
        { id: 2, name: 'Credit Card', description: 'Credit card payment', color: '#2196F3', isDefault: false, isActive: true },
        { id: 3, name: 'Corporate Card', description: 'Company credit card', color: '#9C27B0', isDefault: false, isActive: true },
        { id: 4, name: 'Bank Transfer', description: 'Direct bank transfer', color: '#FF9800', isDefault: false, isActive: true },
        { id: 5, name: 'Direct Debit', description: 'Automatic bank debit', color: '#795548', isDefault: false, isActive: true },
        { id: 6, name: 'Cheque', description: 'Payment by cheque', color: '#607D8B', isDefault: false, isActive: true },
        { id: 7, name: 'Tabby', description: 'Pay in installments via Tabby', color: '#3F51B5', isDefault: false, isActive: true },
        { id: 8, name: 'Tamara', description: 'Pay in installments via Tamara', color: '#673AB7', isDefault: false, isActive: true },
      ];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const { data: leadSources, isLoading: isLeadSourcesLoading } = useQuery<ConfigItem[]>({
    queryKey: ['/api/settings/crm/lead-sources'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        { id: 1, name: 'Website', description: 'Lead from company website', color: '#4CAF50', isDefault: true, isActive: true },
        { id: 2, name: 'Referral', description: 'Referred by existing customer', color: '#2196F3', isDefault: false, isActive: true },
        { id: 3, name: 'Social Media', description: 'Lead from social media', color: '#9C27B0', isDefault: false, isActive: true },
        { id: 4, name: 'Email Campaign', description: 'Lead from email marketing', color: '#FF9800', isDefault: false, isActive: true },
        { id: 5, name: 'Event', description: 'Lead from event or exhibition', color: '#795548', isDefault: false, isActive: true },
        { id: 6, name: 'Phone Inquiry', description: 'Called directly', color: '#607D8B', isDefault: false, isActive: true },
      ];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const { data: leadStatuses, isLoading: isLeadStatusesLoading } = useQuery<ConfigItem[]>({
    queryKey: ['/api/settings/crm/lead-statuses'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        { id: 1, name: 'New', description: 'New lead', color: '#4CAF50', isDefault: true, isActive: true },
        { id: 2, name: 'Contacted', description: 'Initial contact made', color: '#2196F3', isDefault: false, isActive: true },
        { id: 3, name: 'Qualified', description: 'Lead qualified', color: '#9C27B0', isDefault: false, isActive: true },
        { id: 4, name: 'Proposal Sent', description: 'Proposal or quote sent', color: '#FF9800', isDefault: false, isActive: true },
        { id: 5, name: 'Negotiation', description: 'In negotiation', color: '#795548', isDefault: false, isActive: true },
        { id: 6, name: 'Won', description: 'Lead converted to customer', color: '#4CAF50', isDefault: false, isActive: true },
        { id: 7, name: 'Lost', description: 'Lead lost', color: '#F44336', isDefault: false, isActive: true },
      ];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Create config item mutation
  const createConfigItemMutation = useMutation({
    mutationFn: async ({ type, values }: { type: string, values: ConfigItemFormValues }) => {
      console.log('Creating config item for type:', type, 'with values:', values);
      // Replace with actual API call
      return await apiRequest('POST', `/api/settings/crm/${type}`, values);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Item created",
        description: "The new configuration item has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/settings/crm/${variables.type}`] });
      setShowAddDialog(false);
      addForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create item",
        description: error.message || "An error occurred while creating the configuration item.",
        variant: "destructive",
      });
    }
  });

  // Update config item mutation
  const updateConfigItemMutation = useMutation({
    mutationFn: async ({ type, id, values }: { type: string, id: number, values: ConfigItemFormValues }) => {
      console.log('Updating config item for type:', type, 'with id:', id, 'and values:', values);
      // Replace with actual API call
      return await apiRequest('PUT', `/api/settings/crm/${type}/${id}`, values);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Item updated",
        description: "The configuration item has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/settings/crm/${variables.type}`] });
      setShowEditDialog(false);
      setSelectedItem(null);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update item",
        description: error.message || "An error occurred while updating the configuration item.",
        variant: "destructive",
      });
    }
  });

  // Delete config item mutation
  const deleteConfigItemMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string, id: number }) => {
      console.log('Deleting config item for type:', type, 'with id:', id);
      // Replace with actual API call
      return await apiRequest('DELETE', `/api/settings/crm/${type}/${id}`);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Item deleted",
        description: "The configuration item has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/settings/crm/${variables.type}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete item",
        description: error.message || "An error occurred while deleting the configuration item.",
        variant: "destructive",
      });
    }
  });

  // Handle form submissions
  const onAddSubmit = (values: ConfigItemFormValues) => {
    createConfigItemMutation.mutate({ type: activeTab, values });
  };

  const onEditSubmit = (values: ConfigItemFormValues) => {
    if (selectedItem) {
      updateConfigItemMutation.mutate({ 
        type: activeTab, 
        id: selectedItem.id, 
        values 
      });
    }
  };

  // Handle item selection for editing
  const handleEditItem = (item: ConfigItem) => {
    setSelectedItem(item);
    editForm.reset({
      name: item.name,
      description: item.description || '',
      color: item.color || '',
      isDefault: item.isDefault || false,
      isActive: item.isActive,
    });
    setShowEditDialog(true);
  };

  // Handle item deletion
  const handleDeleteItem = (item: ConfigItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteConfigItemMutation.mutate({ type: activeTab, id: item.id });
    }
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'expense-categories':
        return { data: expenseCategories, isLoading: isCategoriesLoading };
      case 'expense-statuses':
        return { data: expenseStatuses, isLoading: isStatusesLoading };
      case 'payment-methods':
        return { data: paymentMethods, isLoading: isPaymentMethodsLoading };
      case 'lead-sources':
        return { data: leadSources, isLoading: isLeadSourcesLoading };
      case 'lead-statuses':
        return { data: leadStatuses, isLoading: isLeadStatusesLoading };
      default:
        return { data: [], isLoading: false };
    }
  };

  // Get icon for current tab
  const getTabIcon = () => {
    switch (activeTab) {
      case 'expense-categories':
        return <Tags className="h-5 w-5" />;
      case 'expense-statuses':
        return <BookmarkCheck className="h-5 w-5" />;
      case 'payment-methods':
        return <CreditCard className="h-5 w-5" />;
      case 'lead-sources':
        return <Building className="h-5 w-5" />;
      case 'lead-statuses':
        return <Tag className="h-5 w-5" />;
      default:
        return <Filter className="h-5 w-5" />;
    }
  };

  // Get title for current tab
  const getTabTitle = () => {
    switch (activeTab) {
      case 'expense-categories':
        return 'Expense Categories';
      case 'expense-statuses':
        return 'Expense Statuses';
      case 'payment-methods':
        return 'Payment Methods';
      case 'lead-sources':
        return 'Lead Sources';
      case 'lead-statuses':
        return 'Lead Statuses';
      default:
        return 'Configuration';
    }
  };

  // Get description for current tab
  const getTabDescription = () => {
    switch (activeTab) {
      case 'expense-categories':
        return 'Manage categories for company expenses';
      case 'expense-statuses':
        return 'Configure status options for expense approvals';
      case 'payment-methods':
        return 'Manage available payment methods for invoices and expenses';
      case 'lead-sources':
        return 'Configure lead source options for tracking lead origins';
      case 'lead-statuses':
        return 'Manage status options for lead tracking';
      default:
        return 'Configure CRM settings';
    }
  };

  const { data, isLoading } = getCurrentData();

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">CRM Settings</h1>
          <p className="text-muted-foreground">
            Configure CRM module settings and options
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/settings">
              Back to Settings
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Configuration Categories</h3>
                <nav className="flex flex-col space-y-1">
                  <Button
                    variant={activeTab === 'expense-categories' ? 'secondary' : 'ghost'}
                    className="justify-start"
                    onClick={() => setActiveTab('expense-categories')}
                  >
                    <Tags className="h-4 w-4 mr-2" />
                    Expense Categories
                  </Button>
                  <Button
                    variant={activeTab === 'expense-statuses' ? 'secondary' : 'ghost'}
                    className="justify-start"
                    onClick={() => setActiveTab('expense-statuses')}
                  >
                    <BookmarkCheck className="h-4 w-4 mr-2" />
                    Expense Statuses
                  </Button>
                  <Button
                    variant={activeTab === 'payment-methods' ? 'secondary' : 'ghost'}
                    className="justify-start"
                    onClick={() => setActiveTab('payment-methods')}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment Methods
                  </Button>
                  <Button
                    variant={activeTab === 'lead-sources' ? 'secondary' : 'ghost'}
                    className="justify-start"
                    onClick={() => setActiveTab('lead-sources')}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Lead Sources
                  </Button>
                  <Button
                    variant={activeTab === 'lead-statuses' ? 'secondary' : 'ghost'}
                    className="justify-start"
                    onClick={() => setActiveTab('lead-statuses')}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Lead Statuses
                  </Button>
                </nav>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Other Settings</h3>
                <nav className="flex flex-col space-y-1">
                  <Button
                    variant="ghost"
                    className="justify-start"
                    asChild
                  >
                    <Link href="/settings/crm/email-templates">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Templates
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    asChild
                  >
                    <Link href="/settings/crm/payment-gateway">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Payment Gateway
                    </Link>
                  </Button>
                </nav>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  {getTabIcon()}
                  <span className="ml-2">{getTabTitle()}</span>
                </CardTitle>
                <CardDescription>{getTabDescription()}</CardDescription>
              </div>
              <Button onClick={() => {
                addForm.reset();
                setShowAddDialog(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading configuration data...</div>
              ) : data && data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => (
                      <ContextMenu key={item.id}>
                        <ContextMenuTrigger asChild>
                          <TableRow className="cursor-pointer">
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                {item.color && (
                                  <div 
                                    className="w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: item.color }}
                                  />
                                )}
                                <span>{item.name}</span>
                                {item.isDefault && (
                                  <Badge variant="outline" className="ml-2">
                                    Default
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{item.description || '—'}</TableCell>
                            <TableCell>
                              {item.isActive ? (
                                <Badge variant="default">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditItem(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(item)}
                                disabled={item.isDefault}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => handleEditItem(item)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </ContextMenuItem>
                          <ContextMenuItem 
                            onClick={() => handleDeleteItem(item)}
                            disabled={item.isDefault}
                            className={item.isDefault ? 'text-muted-foreground cursor-not-allowed' : 'text-red-500'}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No configuration items found. Click "Add New" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New {getTabTitle().slice(0, -1)}</DialogTitle>
            <DialogDescription>
              Create a new configuration item for {getTabDescription().toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-6">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormDescription>
                      The display name for this configuration item.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional description for this item.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color (optional)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="color" 
                          {...field} 
                          value={field.value || '#4CAF50'} 
                          className="w-14 h-10 p-1"
                        />
                        <Input 
                          type="text" 
                          {...field} 
                          value={field.value || ''} 
                          placeholder="#4CAF50"
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Choose a color for visual identification.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-4">
                <FormField
                  control={addForm.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Default Option</FormLabel>
                        <FormDescription>
                          Set as the default option for this category.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="mr-2 h-4 w-4"
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Make this option available for selection.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="mr-2 h-4 w-4"
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createConfigItemMutation.isPending}>
                  {createConfigItemMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {getTabTitle().slice(0, -1)}</DialogTitle>
            <DialogDescription>
              Update configuration item for {getTabDescription().toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" {...field} />
                      </FormControl>
                      <FormDescription>
                        The display name for this configuration item.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter description" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional description for this item.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color (optional)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="color" 
                            {...field} 
                            value={field.value || '#4CAF50'} 
                            className="w-14 h-10 p-1"
                          />
                          <Input 
                            type="text" 
                            {...field} 
                            value={field.value || ''} 
                            placeholder="#4CAF50"
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Choose a color for visual identification.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-4">
                  <FormField
                    control={editForm.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Default Option</FormLabel>
                          <FormDescription>
                            Set as the default option for this category.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <div>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mr-2 h-4 w-4"
                              disabled={selectedItem.isDefault}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Make this option available for selection.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <div>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mr-2 h-4 w-4"
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateConfigItemMutation.isPending}>
                    {updateConfigItemMutation.isPending ? "Updating..." : "Update"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMSettingsPage;