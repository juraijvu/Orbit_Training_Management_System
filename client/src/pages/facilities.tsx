import React, { FC, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Building, Wrench, CheckCircle, Clock, X, Edit, Trash2, Plus } from 'lucide-react';

// Interfaces for facility management
interface Classroom {
  id: number;
  name: string;
  capacity: number;
  equipment: string[];
  location: string;
  status: 'available' | 'occupied' | 'maintenance';
  lastMaintenance: string;
}

interface Equipment {
  id: number;
  name: string;
  type: string;
  serialNumber: string;
  purchaseDate: string;
  lastMaintenance: string;
  status: 'available' | 'in-use' | 'maintenance' | 'damaged';
}

interface MaintenanceRecord {
  id: number;
  facilityId: number;
  facilityType: 'classroom' | 'equipment';
  facilityName: string;
  issueDescription: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed';
  reportedDate: string;
  completionDate: string | null;
}

// Zod schemas for form validation
const classroomFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  capacity: z.coerce.number().min(1, { message: "Capacity must be at least 1." }),
  location: z.string().min(2, { message: "Location is required." }),
  equipment: z.string().optional(),
  status: z.enum(['available', 'occupied', 'maintenance']),
});

const equipmentFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  type: z.string().min(2, { message: "Type is required." }),
  serialNumber: z.string().min(2, { message: "Serial number is required." }),
  purchaseDate: z.string().min(2, { message: "Purchase date is required." }),
  status: z.enum(['available', 'in-use', 'maintenance', 'damaged']),
});

const maintenanceFormSchema = z.object({
  facilityType: z.enum(['classroom', 'equipment']),
  facilityId: z.coerce.number().min(1, { message: "Facility selection is required." }),
  issueDescription: z.string().min(5, { message: "Issue description must be at least 5 characters." }),
  assignedTo: z.string().min(2, { message: "Assigned person is required." }),
  status: z.enum(['pending', 'in-progress', 'completed']),
  completionDate: z.string().optional(),
});

// Type definitions for form values
type ClassroomFormValues = z.infer<typeof classroomFormSchema>;
type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;
type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

// Mock data (would be replaced with API calls)
const sampleClassrooms: Classroom[] = [
  {
    id: 1,
    name: 'Room A101',
    capacity: 30,
    equipment: ['Projector', 'Whiteboard', 'HDMI Connections'],
    location: 'Building A, Floor 1',
    status: 'available',
    lastMaintenance: '2025-03-15',
  },
  {
    id: 2,
    name: 'Lab B203',
    capacity: 20,
    equipment: ['Computers', 'Interactive Board', 'Video Conferencing'],
    location: 'Building B, Floor 2',
    status: 'occupied',
    lastMaintenance: '2025-02-20',
  },
  {
    id: 3,
    name: 'Conference Room C10',
    capacity: 15,
    equipment: ['Large Display', 'Sound System', 'Video Conferencing'],
    location: 'Building C, Ground Floor',
    status: 'maintenance',
    lastMaintenance: '2025-04-01',
  },
];

const sampleEquipment: Equipment[] = [
  {
    id: 1,
    name: 'Projector P2000',
    type: 'Presentation',
    serialNumber: 'PRJ20250001',
    purchaseDate: '2024-01-15',
    lastMaintenance: '2025-03-10',
    status: 'available',
  },
  {
    id: 2,
    name: 'Laptop Dell XPS',
    type: 'Computing',
    serialNumber: 'DXPS20250012',
    purchaseDate: '2024-02-20',
    lastMaintenance: '2025-02-28',
    status: 'in-use',
  },
  {
    id: 3,
    name: 'Smart Board SB500',
    type: 'Presentation',
    serialNumber: 'SB50020250005',
    purchaseDate: '2023-11-10',
    lastMaintenance: '2025-01-15',
    status: 'maintenance',
  },
];

const sampleMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 1,
    facilityId: 3,
    facilityType: 'classroom',
    facilityName: 'Conference Room C10',
    issueDescription: 'Sound system not working properly',
    assignedTo: 'Ahmed Mahmoud',
    status: 'in-progress',
    reportedDate: '2025-04-01',
    completionDate: null,
  },
  {
    id: 2,
    facilityId: 3,
    facilityType: 'equipment',
    facilityName: 'Smart Board SB500',
    issueDescription: 'Touch functionality intermittently failing',
    assignedTo: 'Sara Khan',
    status: 'pending',
    reportedDate: '2025-03-25',
    completionDate: null,
  },
];

const FacilitiesPage: FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>(sampleClassrooms);
  const [equipment, setEquipment] = useState<Equipment[]>(sampleEquipment);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(sampleMaintenanceRecords);
  
  const [isClassroomDialogOpen, setIsClassroomDialogOpen] = useState(false);
  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  
  // Form handling
  const classroomForm = useForm<ClassroomFormValues>({
    resolver: zodResolver(classroomFormSchema),
    defaultValues: {
      name: '',
      capacity: 0,
      location: '',
      equipment: '',
      status: 'available',
    },
  });
  
  const equipmentForm = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: '',
      type: '',
      serialNumber: '',
      purchaseDate: '',
      status: 'available',
    },
  });
  
  const maintenanceForm = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      facilityType: 'classroom',
      facilityId: 0,
      issueDescription: '',
      assignedTo: '',
      status: 'pending',
      completionDate: '',
    },
  });
  
  // Form submission handlers
  const onClassroomSubmit = (values: ClassroomFormValues) => {
    const equipmentArray = values.equipment ? values.equipment.split(',').map(e => e.trim()) : [];
    
    if (editingClassroom) {
      // Update existing classroom
      const updatedClassrooms = classrooms.map(c => 
        c.id === editingClassroom.id 
          ? { 
              ...c, 
              name: values.name, 
              capacity: values.capacity, 
              location: values.location,
              equipment: equipmentArray,
              status: values.status
            } 
          : c
      );
      setClassrooms(updatedClassrooms);
    } else {
      // Add new classroom
      const newClassroom: Classroom = {
        id: Math.max(0, ...classrooms.map(c => c.id)) + 1,
        name: values.name,
        capacity: values.capacity,
        location: values.location,
        equipment: equipmentArray,
        status: values.status,
        lastMaintenance: new Date().toISOString().split('T')[0]
      };
      setClassrooms([...classrooms, newClassroom]);
    }
    
    classroomForm.reset();
    setEditingClassroom(null);
    setIsClassroomDialogOpen(false);
  };
  
  const onEquipmentSubmit = (values: EquipmentFormValues) => {
    if (editingEquipment) {
      // Update existing equipment
      const updatedEquipment = equipment.map(e => 
        e.id === editingEquipment.id 
          ? { 
              ...e, 
              name: values.name, 
              type: values.type, 
              serialNumber: values.serialNumber,
              purchaseDate: values.purchaseDate,
              status: values.status
            } 
          : e
      );
      setEquipment(updatedEquipment);
    } else {
      // Add new equipment
      const newEquipment: Equipment = {
        id: Math.max(0, ...equipment.map(e => e.id)) + 1,
        name: values.name,
        type: values.type,
        serialNumber: values.serialNumber,
        purchaseDate: values.purchaseDate,
        status: values.status,
        lastMaintenance: new Date().toISOString().split('T')[0]
      };
      setEquipment([...equipment, newEquipment]);
    }
    
    equipmentForm.reset();
    setEditingEquipment(null);
    setIsEquipmentDialogOpen(false);
  };
  
  const onMaintenanceSubmit = (values: MaintenanceFormValues) => {
    let facilityName = '';
    
    if (values.facilityType === 'classroom') {
      const classroom = classrooms.find(c => c.id === values.facilityId);
      if (classroom) {
        facilityName = classroom.name;
        
        // Update classroom status
        const updatedClassrooms = classrooms.map(c => 
          c.id === values.facilityId ? { ...c, status: 'maintenance' } : c
        );
        setClassrooms(updatedClassrooms);
      }
    } else {
      const item = equipment.find(e => e.id === values.facilityId);
      if (item) {
        facilityName = item.name;
        
        // Update equipment status
        const updatedEquipment = equipment.map(e => 
          e.id === values.facilityId ? { ...e, status: 'maintenance' } : e
        );
        setEquipment(updatedEquipment);
      }
    }
    
    const newRecord: MaintenanceRecord = {
      id: Math.max(0, ...maintenanceRecords.map(r => r.id)) + 1,
      facilityId: values.facilityId,
      facilityType: values.facilityType,
      facilityName,
      issueDescription: values.issueDescription,
      assignedTo: values.assignedTo,
      status: values.status,
      reportedDate: new Date().toISOString().split('T')[0],
      completionDate: values.completionDate || null
    };
    
    setMaintenanceRecords([...maintenanceRecords, newRecord]);
    maintenanceForm.reset();
    setIsMaintenanceDialogOpen(false);
  };
  
  // Edit handlers
  const handleEditClassroom = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    classroomForm.reset({
      name: classroom.name,
      capacity: classroom.capacity,
      location: classroom.location,
      equipment: classroom.equipment.join(', '),
      status: classroom.status
    });
    setIsClassroomDialogOpen(true);
  };
  
  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    equipmentForm.reset({
      name: equipment.name,
      type: equipment.type,
      serialNumber: equipment.serialNumber,
      purchaseDate: equipment.purchaseDate,
      status: equipment.status
    });
    setIsEquipmentDialogOpen(true);
  };
  
  // Delete handlers
  const handleDeleteClassroom = (id: number) => {
    setClassrooms(classrooms.filter(c => c.id !== id));
  };
  
  const handleDeleteEquipment = (id: number) => {
    setEquipment(equipment.filter(e => e.id !== id));
  };
  
  const handleDeleteMaintenanceRecord = (id: number) => {
    setMaintenanceRecords(maintenanceRecords.filter(r => r.id !== id));
  };
  
  // Render status badge
  const renderClassroomStatusBadge = (status: Classroom['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500">Available</Badge>;
      case 'occupied':
        return <Badge className="bg-blue-500">Occupied</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-500">Maintenance</Badge>;
      default:
        return null;
    }
  };
  
  const renderEquipmentStatusBadge = (status: Equipment['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500">Available</Badge>;
      case 'in-use':
        return <Badge className="bg-blue-500">In Use</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-500">Maintenance</Badge>;
      case 'damaged':
        return <Badge className="bg-red-500">Damaged</Badge>;
      default:
        return null;
    }
  };
  
  const renderMaintenanceStatusBadge = (status: MaintenanceRecord['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Facilities Management</h1>
      </div>

      <Tabs defaultValue="classrooms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="classrooms" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Classrooms & Labs
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Equipment
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Maintenance
          </TabsTrigger>
        </TabsList>
        
        {/* Classrooms & Labs Tab */}
        <TabsContent value="classrooms">
          <div className="flex justify-end mb-4">
            <Dialog open={isClassroomDialogOpen} onOpenChange={setIsClassroomDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingClassroom(null);
                  classroomForm.reset({
                    name: '',
                    capacity: 0,
                    location: '',
                    equipment: '',
                    status: 'available',
                  });
                }}>
                  <Plus className="mr-2 h-4 w-4" /> Add Classroom
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingClassroom ? 'Edit Classroom' : 'Add New Classroom'}</DialogTitle>
                  <DialogDescription>
                    {editingClassroom 
                      ? 'Update classroom details and click save when you\'re done.' 
                      : 'Enter the classroom details and click save when you\'re done.'}
                  </DialogDescription>
                </DialogHeader>
                <Form {...classroomForm}>
                  <form onSubmit={classroomForm.handleSubmit(onClassroomSubmit)} className="space-y-4 py-2">
                    <FormField
                      control={classroomForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Room A101" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={classroomForm.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={classroomForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Building A, Floor 1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={classroomForm.control}
                      name="equipment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Equipment (comma-separated)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Projector, Whiteboard, Computers" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={classroomForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="occupied">Occupied</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">{editingClassroom ? 'Update' : 'Save'}</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Maintenance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classrooms.map((classroom) => (
                  <TableRow key={classroom.id}>
                    <TableCell className="font-medium">{classroom.name}</TableCell>
                    <TableCell>{classroom.capacity}</TableCell>
                    <TableCell>{classroom.location}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {classroom.equipment.map((item, i) => (
                          <Badge key={i} variant="outline" className="mr-1">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{renderClassroomStatusBadge(classroom.status)}</TableCell>
                    <TableCell>{classroom.lastMaintenance}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleEditClassroom(classroom)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-red-500"
                          onClick={() => handleDeleteClassroom(classroom.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* Equipment Tab */}
        <TabsContent value="equipment">
          <div className="flex justify-end mb-4">
            <Dialog open={isEquipmentDialogOpen} onOpenChange={setIsEquipmentDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingEquipment(null);
                  equipmentForm.reset({
                    name: '',
                    type: '',
                    serialNumber: '',
                    purchaseDate: '',
                    status: 'available',
                  });
                }}>
                  <Plus className="mr-2 h-4 w-4" /> Add Equipment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}</DialogTitle>
                  <DialogDescription>
                    {editingEquipment 
                      ? 'Update equipment details and click save when you\'re done.' 
                      : 'Enter the equipment details and click save when you\'re done.'}
                  </DialogDescription>
                </DialogHeader>
                <Form {...equipmentForm}>
                  <form onSubmit={equipmentForm.handleSubmit(onEquipmentSubmit)} className="space-y-4 py-2">
                    <FormField
                      control={equipmentForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Projector P2000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={equipmentForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Presentation, Computing" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={equipmentForm.control}
                      name="serialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serial Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., PRJ20250001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={equipmentForm.control}
                      name="purchaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={equipmentForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="in-use">In Use</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="damaged">Damaged</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">{editingEquipment ? 'Update' : 'Save'}</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Last Maintenance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.serialNumber}</TableCell>
                    <TableCell>{item.purchaseDate}</TableCell>
                    <TableCell>{item.lastMaintenance}</TableCell>
                    <TableCell>{renderEquipmentStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleEditEquipment(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-red-500"
                          onClick={() => handleDeleteEquipment(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* Maintenance Tab */}
        <TabsContent value="maintenance">
          <div className="flex justify-end mb-4">
            <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Log Maintenance Request
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Log Maintenance Request</DialogTitle>
                  <DialogDescription>
                    Enter maintenance request details and click submit.
                  </DialogDescription>
                </DialogHeader>
                <Form {...maintenanceForm}>
                  <form onSubmit={maintenanceForm.handleSubmit(onMaintenanceSubmit)} className="space-y-4 py-2">
                    <FormField
                      control={maintenanceForm.control}
                      name="facilityType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facility Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select facility type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="classroom">Classroom</SelectItem>
                              <SelectItem value="equipment">Equipment</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={maintenanceForm.control}
                      name="facilityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facility</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            value={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select facility" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {maintenanceForm.watch('facilityType') === 'classroom' ? (
                                classrooms.map(classroom => (
                                  <SelectItem key={classroom.id} value={classroom.id.toString()}>
                                    {classroom.name}
                                  </SelectItem>
                                ))
                              ) : (
                                equipment.map(item => (
                                  <SelectItem key={item.id} value={item.id.toString()}>
                                    {item.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={maintenanceForm.control}
                      name="issueDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the maintenance issue in detail" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={maintenanceForm.control}
                      name="assignedTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assigned To</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Name of person responsible" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={maintenanceForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {maintenanceForm.watch('status') === 'completed' && (
                      <FormField
                        control={maintenanceForm.control}
                        name="completionDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Completion Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <DialogFooter>
                      <Button type="submit">Submit Request</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facility</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.facilityName}</TableCell>
                    <TableCell>
                      {record.facilityType === 'classroom' ? 'Classroom' : 'Equipment'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{record.issueDescription}</TableCell>
                    <TableCell>{record.assignedTo}</TableCell>
                    <TableCell>{record.reportedDate}</TableCell>
                    <TableCell>{renderMaintenanceStatusBadge(record.status)}</TableCell>
                    <TableCell>{record.completionDate || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleDeleteMaintenanceRecord(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FacilitiesPage;