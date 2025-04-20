import { FC, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Building,
  CalendarDays,
  Check,
  Edit,
  Home,
  Loader2,
  PenSquare,
  Plus,
  Trash2,
} from 'lucide-react';

// Sample data structures (replace with actual API data)
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

// Sample data
const classrooms: Classroom[] = [
  {
    id: 1,
    name: 'Room A101',
    capacity: 25,
    equipment: ['Projector', 'Whiteboard', 'Computers'],
    location: 'First Floor, Block A',
    status: 'available',
    lastMaintenance: '2025-03-15',
  },
  {
    id: 2,
    name: 'Room B202',
    capacity: 35,
    equipment: ['Smart Board', 'Speakers', 'Computers'],
    location: 'Second Floor, Block B',
    status: 'occupied',
    lastMaintenance: '2025-03-20',
  },
  {
    id: 3,
    name: 'Design Studio',
    capacity: 15,
    equipment: ['Drawing Tables', 'CAD Workstations', 'Scanner'],
    location: 'Ground Floor, Block C',
    status: 'available',
    lastMaintenance: '2025-04-05',
  },
  {
    id: 4,
    name: 'Conference Room',
    capacity: 20,
    equipment: ['Projector', 'Video Conferencing System', 'Whiteboard'],
    location: 'Third Floor, Block A',
    status: 'maintenance',
    lastMaintenance: '2025-04-12',
  },
];

const equipment: Equipment[] = [
  {
    id: 1,
    name: 'Dell XPS Workstation',
    type: 'Computer',
    serialNumber: 'DL-XPS-2025-001',
    purchaseDate: '2024-08-15',
    lastMaintenance: '2025-03-10',
    status: 'available',
  },
  {
    id: 2,
    name: 'Epson Projector EB-E01',
    type: 'Projector',
    serialNumber: 'EP-EB-2024-018',
    purchaseDate: '2024-06-22',
    lastMaintenance: '2025-02-15',
    status: 'in-use',
  },
  {
    id: 3,
    name: 'AutoCAD Workstation HP Z4',
    type: 'Computer',
    serialNumber: 'HP-Z4-2024-007',
    purchaseDate: '2024-05-30',
    lastMaintenance: '2025-03-05',
    status: 'maintenance',
  },
  {
    id: 4,
    name: 'Wacom Cintiq 22',
    type: 'Drawing Tablet',
    serialNumber: 'WC-22-2025-012',
    purchaseDate: '2025-01-10',
    lastMaintenance: '2025-04-01',
    status: 'available',
  },
  {
    id: 5,
    name: 'Canon Scanner LiDE 400',
    type: 'Scanner',
    serialNumber: 'CN-400-2024-031',
    purchaseDate: '2024-11-24',
    lastMaintenance: '2025-03-25',
    status: 'damaged',
  },
];

const maintenanceRecords: MaintenanceRecord[] = [
  {
    id: 1,
    facilityId: 4,
    facilityType: 'classroom',
    facilityName: 'Conference Room',
    issueDescription: 'Projector display flickering, needs repair or replacement',
    assignedTo: 'Ahmed Hasan',
    status: 'in-progress',
    reportedDate: '2025-04-12',
    completionDate: null,
  },
  {
    id: 2,
    facilityId: 3,
    facilityType: 'equipment',
    facilityName: 'AutoCAD Workstation HP Z4',
    issueDescription: 'System overheating during rendering tasks',
    assignedTo: 'Samir Khan',
    status: 'in-progress',
    reportedDate: '2025-04-05',
    completionDate: null,
  },
  {
    id: 3,
    facilityId: 5,
    facilityType: 'equipment',
    facilityName: 'Canon Scanner LiDE 400',
    issueDescription: 'Scanner glass cracked, needs replacement',
    assignedTo: 'Fatima Ali',
    status: 'pending',
    reportedDate: '2025-04-15',
    completionDate: null,
  },
  {
    id: 4,
    facilityId: 2,
    facilityType: 'classroom',
    facilityName: 'Room B202',
    issueDescription: 'Smart Board touch function not working',
    assignedTo: 'Ahmed Hasan',
    status: 'completed',
    reportedDate: '2025-03-25',
    completionDate: '2025-03-27',
  },
];

// Zod schemas for form validation
const classroomFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  equipment: z.string().min(3, "Equipment must be at least 3 characters"),
  status: z.enum(['available', 'occupied', 'maintenance']),
});

const equipmentFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  type: z.string().min(3, "Type must be at least 3 characters"),
  serialNumber: z.string().min(3, "Serial number must be at least 3 characters"),
  purchaseDate: z.string(),
  status: z.enum(['available', 'in-use', 'maintenance', 'damaged']),
});

const maintenanceFormSchema = z.object({
  facilityType: z.enum(['classroom', 'equipment']),
  facilityId: z.number().min(1, "Please select a facility"),
  issueDescription: z.string().min(10, "Please provide a detailed description"),
  assignedTo: z.string().min(3, "Please assign someone to this task"),
});

type ClassroomFormValues = z.infer<typeof classroomFormSchema>;
type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;
type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

const FacilitiesPage: FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("classrooms");
  
  const [isClassroomDialogOpen, setIsClassroomDialogOpen] = useState(false);
  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  
  // Form setup
  const classroomForm = useForm<ClassroomFormValues>({
    resolver: zodResolver(classroomFormSchema),
    defaultValues: {
      name: "",
      capacity: 0,
      location: "",
      equipment: "",
      status: "available",
    }
  });
  
  const equipmentForm = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: "",
      type: "",
      serialNumber: "",
      purchaseDate: new Date().toISOString().split('T')[0],
      status: "available",
    }
  });
  
  const maintenanceForm = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      facilityType: "classroom",
      facilityId: 0,
      issueDescription: "",
      assignedTo: "",
    }
  });
  
  // Reset forms when dialogs close
  const handleClassroomDialogChange = (open: boolean) => {
    if (!open) {
      classroomForm.reset();
      setSelectedClassroom(null);
    }
    setIsClassroomDialogOpen(open);
  };
  
  const handleEquipmentDialogChange = (open: boolean) => {
    if (!open) {
      equipmentForm.reset();
      setSelectedEquipment(null);
    }
    setIsEquipmentDialogOpen(open);
  };
  
  const handleMaintenanceDialogChange = (open: boolean) => {
    if (!open) {
      maintenanceForm.reset();
    }
    setIsMaintenanceDialogOpen(open);
  };
  
  // Handle form submissions
  const onClassroomSubmit = (values: ClassroomFormValues) => {
    console.log("Classroom form submitted:", values);
    // Here you would typically call an API to create/update a classroom
    
    toast({
      title: "Success",
      description: selectedClassroom ? "Classroom updated successfully" : "Classroom added successfully",
    });
    
    handleClassroomDialogChange(false);
  };
  
  const onEquipmentSubmit = (values: EquipmentFormValues) => {
    console.log("Equipment form submitted:", values);
    // Here you would typically call an API to create/update equipment
    
    toast({
      title: "Success",
      description: selectedEquipment ? "Equipment updated successfully" : "Equipment added successfully",
    });
    
    handleEquipmentDialogChange(false);
  };
  
  const onMaintenanceSubmit = (values: MaintenanceFormValues) => {
    console.log("Maintenance form submitted:", values);
    // Here you would typically call an API to create a maintenance record
    
    toast({
      title: "Success",
      description: "Maintenance request submitted successfully",
    });
    
    handleMaintenanceDialogChange(false);
  };
  
  // Handle edit actions
  const handleEditClassroom = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    classroomForm.reset({
      name: classroom.name,
      capacity: classroom.capacity,
      location: classroom.location,
      equipment: classroom.equipment.join(', '),
      status: classroom.status,
    });
    setIsClassroomDialogOpen(true);
  };
  
  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    equipmentForm.reset({
      name: equipment.name,
      type: equipment.type,
      serialNumber: equipment.serialNumber,
      purchaseDate: equipment.purchaseDate,
      status: equipment.status,
    });
    setIsEquipmentDialogOpen(true);
  };
  
  // Get filterable maintenance records
  const getFacilityOptions = () => {
    const facilityType = maintenanceForm.watch('facilityType');
    
    if (facilityType === 'classroom') {
      return classrooms.filter(c => c.status !== 'maintenance').map(classroom => ({
        id: classroom.id,
        name: classroom.name,
      }));
    } else {
      return equipment.filter(e => e.status !== 'maintenance' && e.status !== 'damaged').map(item => ({
        id: item.id,
        name: item.name,
      }));
    }
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Facilities Management</h1>
            <p className="text-gray-500">Manage classrooms, equipment, and maintenance</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <Button onClick={() => setIsClassroomDialogOpen(true)}>
              <Building className="h-4 w-4 mr-2" />
              Add Classroom
            </Button>
            <Button onClick={() => setIsEquipmentDialogOpen(true)}>
              <PenSquare className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
            <Button variant="outline" onClick={() => setIsMaintenanceDialogOpen(true)}>
              <CalendarDays className="h-4 w-4 mr-2" />
              Report Maintenance
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="classrooms" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="classrooms">Classrooms</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="classrooms">
            <Card>
              <CardHeader>
                <CardTitle>Classrooms</CardTitle>
                <CardDescription>View and manage all teaching spaces</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Equipment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Maintenance</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classrooms.map((classroom) => (
                        <TableRow key={classroom.id}>
                          <TableCell className="font-medium">{classroom.name}</TableCell>
                          <TableCell>{classroom.capacity}</TableCell>
                          <TableCell>{classroom.location}</TableCell>
                          <TableCell>{classroom.equipment.join(', ')}</TableCell>
                          <TableCell>
                            <Badge className={
                              classroom.status === 'available' ? 'bg-green-100 text-green-800' :
                              classroom.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {classroom.status.charAt(0).toUpperCase() + classroom.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(classroom.lastMaintenance).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditClassroom(classroom)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="equipment">
            <Card>
              <CardHeader>
                <CardTitle>Equipment</CardTitle>
                <CardDescription>View and manage all teaching equipment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Last Maintenance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipment.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>{item.serialNumber}</TableCell>
                          <TableCell>{new Date(item.purchaseDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(item.lastMaintenance).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className={
                              item.status === 'available' ? 'bg-green-100 text-green-800' :
                              item.status === 'in-use' ? 'bg-blue-100 text-blue-800' :
                              item.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditEquipment(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Records</CardTitle>
                <CardDescription>View and manage maintenance requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Facility</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Reported Date</TableHead>
                        <TableHead>Completion Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenanceRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.facilityName}</TableCell>
                          <TableCell>{record.facilityType === 'classroom' ? 'Classroom' : 'Equipment'}</TableCell>
                          <TableCell>{record.issueDescription}</TableCell>
                          <TableCell>{record.assignedTo}</TableCell>
                          <TableCell>{new Date(record.reportedDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {record.completionDate ? new Date(record.completionDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              record.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Add/Edit Classroom Dialog */}
        <Dialog open={isClassroomDialogOpen} onOpenChange={handleClassroomDialogChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedClassroom ? 'Edit Classroom' : 'Add New Classroom'}</DialogTitle>
              <DialogDescription>
                {selectedClassroom ? 'Update classroom details below' : 'Enter classroom details below'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...classroomForm}>
              <form onSubmit={classroomForm.handleSubmit(onClassroomSubmit)} className="space-y-4">
                <FormField
                  control={classroomForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Room A101" />
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
                        <Input 
                          type="number" 
                          min="1" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
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
                        <Input {...field} placeholder="First Floor, Block A" />
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
                      <FormLabel>Equipment</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Projector, Whiteboard, Computers" />
                      </FormControl>
                      <FormDescription>
                        Enter equipment items separated by commas
                      </FormDescription>
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
                            <SelectValue placeholder="Select status" />
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
                
                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleClassroomDialogChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedClassroom ? 'Update Classroom' : 'Add Classroom'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Add/Edit Equipment Dialog */}
        <Dialog open={isEquipmentDialogOpen} onOpenChange={handleEquipmentDialogChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedEquipment ? 'Edit Equipment' : 'Add New Equipment'}</DialogTitle>
              <DialogDescription>
                {selectedEquipment ? 'Update equipment details below' : 'Enter equipment details below'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...equipmentForm}>
              <form onSubmit={equipmentForm.handleSubmit(onEquipmentSubmit)} className="space-y-4">
                <FormField
                  control={equipmentForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Dell XPS Workstation" />
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
                        <Input {...field} placeholder="Computer" />
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
                        <Input {...field} placeholder="DL-XPS-2025-001" />
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
                            <SelectValue placeholder="Select status" />
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
                
                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleEquipmentDialogChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedEquipment ? 'Update Equipment' : 'Add Equipment'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Report Maintenance Dialog */}
        <Dialog open={isMaintenanceDialogOpen} onOpenChange={handleMaintenanceDialogChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Report Maintenance Issue</DialogTitle>
              <DialogDescription>
                Report a maintenance issue for a classroom or equipment
              </DialogDescription>
            </DialogHeader>
            
            <Form {...maintenanceForm}>
              <form onSubmit={maintenanceForm.handleSubmit(onMaintenanceSubmit)} className="space-y-4">
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
                        value={field.value ? field.value.toString() : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select facility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getFacilityOptions().map((option) => (
                            <SelectItem key={option.id} value={option.id.toString()}>
                              {option.name}
                            </SelectItem>
                          ))}
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
                          placeholder="Describe the issue in detail"
                          {...field}
                          rows={4}
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
                      <FormLabel>Assign To</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select staff member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Ahmed Hasan">Ahmed Hasan</SelectItem>
                          <SelectItem value="Samir Khan">Samir Khan</SelectItem>
                          <SelectItem value="Fatima Ali">Fatima Ali</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleMaintenanceDialogChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Submit Maintenance Request
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default FacilitiesPage;