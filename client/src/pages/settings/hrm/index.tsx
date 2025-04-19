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
  ClipboardList,
  Tag,
  Building,
  Briefcase,
  Clock,
  Calendar,
  AlarmClock
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

const HRMSettingsPage: FC = () => {
  const [activeTab, setActiveTab] = useState('departments');
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
  const { data: departments, isLoading: isDepartmentsLoading } = useQuery<ConfigItem[]>({
    queryKey: ['/api/settings/hrm/departments'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        { id: 1, name: 'Administration', description: 'Admin and management staff', color: '#4CAF50', isDefault: true, isActive: true },
        { id: 2, name: 'Training', description: 'Training and education staff', color: '#2196F3', isDefault: false, isActive: true },
        { id: 3, name: 'Marketing', description: 'Marketing department', color: '#9C27B0', isDefault: false, isActive: true },
        { id: 4, name: 'Sales', description: 'Sales and business development', color: '#FF9800', isDefault: false, isActive: true },
        { id: 5, name: 'IT', description: 'Information technology', color: '#607D8B', isDefault: false, isActive: true },
        { id: 6, name: 'Finance', description: 'Finance and accounting', color: '#795548', isDefault: false, isActive: true },
      ];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const { data: positions, isLoading: isPositionsLoading } = useQuery<ConfigItem[]>({
    queryKey: ['/api/settings/hrm/positions'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        { id: 1, name: 'HR Manager', description: 'Human resources management', color: '#4CAF50', isDefault: false, isActive: true },
        { id: 2, name: 'Training Specialist', description: 'Conducts training sessions', color: '#2196F3', isDefault: false, isActive: true },
        { id: 3, name: 'Administrative Assistant', description: 'Admin support', color: '#9C27B0', isDefault: true, isActive: true },
        { id: 4, name: 'Digital Marketing Expert', description: 'Digital marketing specialist', color: '#FF9800', isDefault: false, isActive: true },
        { id: 5, name: 'Course Advisor', description: 'Academic advisory', color: '#795548', isDefault: false, isActive: true },
        { id: 6, name: 'Full Stack Developer', description: 'Software development', color: '#607D8B', isDefault: false, isActive: true },
      ];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const { data: leaveTypes, isLoading: isLeaveTypesLoading } = useQuery<ConfigItem[]>({
    queryKey: ['/api/settings/hrm/leave-types'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        { id: 1, name: 'Annual Leave', description: 'Regular vacation leave', color: '#4CAF50', isDefault: true, isActive: true },
        { id: 2, name: 'Sick Leave', description: 'Medical leave', color: '#F44336', isDefault: false, isActive: true },
        { id: 3, name: 'Personal Leave', description: 'Personal time off', color: '#2196F3', isDefault: false, isActive: true },
        { id: 4, name: 'Maternity Leave', description: 'Maternity time off', color: '#9C27B0', isDefault: false, isActive: true },
        { id: 5, name: 'Paternity Leave', description: 'Paternity time off', color: '#3F51B5', isDefault: false, isActive: true },
        { id: 6, name: 'Bereavement Leave', description: 'Family emergency leave', color: '#607D8B', isDefault: false, isActive: true },
      ];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const { data: attendanceStatuses, isLoading: isAttendanceStatusesLoading } = useQuery<ConfigItem[]>({
    queryKey: ['/api/settings/hrm/attendance-statuses'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        { id: 1, name: 'Present', description: 'Employee is present', color: '#4CAF50', isDefault: true, isActive: true },
        { id: 2, name: 'Absent', description: 'Employee is absent', color: '#F44336', isDefault: false, isActive: true },
        { id: 3, name: 'Late', description: 'Employee arrived late', color: '#FF9800', isDefault: false, isActive: true },
        { id: 4, name: 'Half Day', description: 'Employee worked half day', color: '#607D8B', isDefault: false, isActive: true },
        { id: 5, name: 'On Leave', description: 'Employee is on approved leave', color: '#2196F3', isDefault: false, isActive: true },
        { id: 6, name: 'Work From Home', description: 'Remote work', color: '#9C27B0', isDefault: false, isActive: true },
      ];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Create config item mutation
  const createConfigItemMutation = useMutation({
    mutationFn: async ({ type, values }: { type: string, values: ConfigItemFormValues }) => {
      console.log('Creating config item for type:', type, 'with values:', values);
      // Replace with actual API call
      return await apiRequest('POST', `/api/settings/hrm/${type}`, values);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Item created",
        description: "The new configuration item has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/settings/hrm/${variables.type}`] });
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
      return await apiRequest('PUT', `/api/settings/hrm/${type}/${id}`, values);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Item updated",
        description: "The configuration item has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/settings/hrm/${variables.type}`] });
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
      return await apiRequest('DELETE', `/api/settings/hrm/${type}/${id}`);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Item deleted",
        description: "The configuration item has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/settings/hrm/${variables.type}`] });
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
      case 'departments':
        return { data: departments, isLoading: isDepartmentsLoading };
      case 'positions':
        return { data: positions, isLoading: isPositionsLoading };
      case 'leave-types':
        return { data: leaveTypes, isLoading: isLeaveTypesLoading };
      case 'attendance-statuses':
        return { data: attendanceStatuses, isLoading: isAttendanceStatusesLoading };
      default:
        return { data: [], isLoading: false };
    }
  };

  // Get icon for current tab
  const getTabIcon = () => {
    switch (activeTab) {
      case 'departments':
        return <Building className="h-5 w-5" />;
      case 'positions':
        return <Briefcase className="h-5 w-5" />;
      case 'leave-types':
        return <Calendar className="h-5 w-5" />;
      case 'attendance-statuses':
        return <Clock className="h-5 w-5" />;
      default:
        return <Filter className="h-5 w-5" />;
    }
  };

  // Get title for current tab
  const getTabTitle = () => {
    switch (activeTab) {
      case 'departments':
        return 'Departments';
      case 'positions':
        return 'Job Positions';
      case 'leave-types':
        return 'Leave Types';
      case 'attendance-statuses':
        return 'Attendance Statuses';
      default:
        return 'Configuration';
    }
  };

  // Get description for current tab
  const getTabDescription = () => {
    switch (activeTab) {
      case 'departments':
        return 'Manage departments for organization structure';
      case 'positions':
        return 'Configure job positions for employee roles';
      case 'leave-types':
        return 'Manage leave types for employee time off';
      case 'attendance-statuses':
        return 'Configure attendance status options';
      default:
        return 'Configure HRM settings';
    }
  };

  const { data, isLoading } = getCurrentData();

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">HRM Settings</h1>
          <p className="text-muted-foreground">
            Configure HR module settings and options
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
                    variant={activeTab === 'departments' ? 'secondary' : 'ghost'}
                    className="justify-start"
                    onClick={() => setActiveTab('departments')}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Departments
                  </Button>
                  <Button
                    variant={activeTab === 'positions' ? 'secondary' : 'ghost'}
                    className="justify-start"
                    onClick={() => setActiveTab('positions')}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Job Positions
                  </Button>
                  <Button
                    variant={activeTab === 'leave-types' ? 'secondary' : 'ghost'}
                    className="justify-start"
                    onClick={() => setActiveTab('leave-types')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Leave Types
                  </Button>
                  <Button
                    variant={activeTab === 'attendance-statuses' ? 'secondary' : 'ghost'}
                    className="justify-start"
                    onClick={() => setActiveTab('attendance-statuses')}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Attendance Statuses
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
                    <Link href="/settings/hrm/working-hours">
                      <AlarmClock className="h-4 w-4 mr-2" />
                      Working Hours
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    asChild
                  >
                    <Link href="/settings/hrm/document-types">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Document Types
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

export default HRMSettingsPage;