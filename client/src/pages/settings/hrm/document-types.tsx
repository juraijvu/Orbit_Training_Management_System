import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Save 
} from 'lucide-react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const documentTypeSchema = z.object({
  name: z.string().min(1, 'Document type name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  isRequired: z.boolean(),
  isActive: z.boolean(),
  validityPeriod: z.string().optional(),
});

type DocumentTypeData = z.infer<typeof documentTypeSchema>;

interface DocumentType {
  id: number;
  name: string;
  description?: string;
  category: string;
  isRequired: boolean;
  isActive: boolean;
  validityPeriod?: string;
  createdAt: string;
}

const DocumentTypesPage: FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);

  // Mock data - replace with actual API call
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([
    {
      id: 1,
      name: 'Passport',
      description: 'Employee passport document',
      category: 'Identity',
      isRequired: true,
      isActive: true,
      validityPeriod: '120', // months
      createdAt: '2024-01-01',
    },
    {
      id: 2,
      name: 'Emirates ID',
      description: 'UAE Emirates ID card',
      category: 'Identity',
      isRequired: true,
      isActive: true,
      validityPeriod: '60',
      createdAt: '2024-01-01',
    },
    {
      id: 3,
      name: 'Visa',
      description: 'Employment visa document',
      category: 'Immigration',
      isRequired: true,
      isActive: true,
      validityPeriod: '24',
      createdAt: '2024-01-01',
    },
    {
      id: 4,
      name: 'Educational Certificate',
      description: 'Degree or diploma certificate',
      category: 'Education',
      isRequired: false,
      isActive: true,
      createdAt: '2024-01-01',
    },
    {
      id: 5,
      name: 'Medical Certificate',
      description: 'Health fitness certificate',
      category: 'Medical',
      isRequired: true,
      isActive: true,
      validityPeriod: '12',
      createdAt: '2024-01-01',
    },
  ]);

  const form = useForm<DocumentTypeData>({
    resolver: zodResolver(documentTypeSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      isRequired: false,
      isActive: true,
      validityPeriod: '',
    },
  });

  const categories = [
    'Identity',
    'Immigration',
    'Education',
    'Medical',
    'Employment',
    'Financial',
    'Legal',
    'Other'
  ];

  const onSubmit = async (data: DocumentTypeData) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (selectedDocumentType) {
        // Update existing document type
        setDocumentTypes(prev => prev.map(dt => 
          dt.id === selectedDocumentType.id 
            ? { ...dt, ...data }
            : dt
        ));
        toast({
          title: 'Success',
          description: 'Document type updated successfully.',
        });
        setIsEditDialogOpen(false);
      } else {
        // Add new document type
        const newDocumentType: DocumentType = {
          id: Date.now(),
          ...data,
          createdAt: new Date().toISOString(),
        };
        setDocumentTypes(prev => [...prev, newDocumentType]);
        toast({
          title: 'Success',
          description: 'Document type created successfully.',
        });
        setIsAddDialogOpen(false);
      }
      
      form.reset();
      setSelectedDocumentType(null);
      setIsLoading(false);
    }, 1000);
  };

  const handleEdit = (documentType: DocumentType) => {
    setSelectedDocumentType(documentType);
    form.reset({
      name: documentType.name,
      description: documentType.description || '',
      category: documentType.category,
      isRequired: documentType.isRequired,
      isActive: documentType.isActive,
      validityPeriod: documentType.validityPeriod || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setDocumentTypes(prev => prev.filter(dt => dt.id !== id));
    toast({
      title: 'Success',
      description: 'Document type deleted successfully.',
    });
  };

  const handleAddNew = () => {
    setSelectedDocumentType(null);
    form.reset();
    setIsAddDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings/hrm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to HRM Settings
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Document Types
            </h1>
            <p className="text-muted-foreground">
              Manage document types required for employee records
            </p>
          </div>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Document Type
        </Button>
      </div>

      {/* Document Types Table */}
      <Card>
        <CardHeader>
          <CardTitle>Document Types</CardTitle>
          <CardDescription>
            Configure the types of documents that can be uploaded for employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Validity Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentTypes.map((documentType) => (
                <TableRow key={documentType.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{documentType.name}</div>
                      {documentType.description && (
                        <div className="text-sm text-muted-foreground">
                          {documentType.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{documentType.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {documentType.isRequired ? (
                      <Badge variant="destructive">Required</Badge>
                    ) : (
                      <Badge variant="secondary">Optional</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {documentType.validityPeriod 
                      ? `${documentType.validityPeriod} months`
                      : 'No expiry'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={documentType.isActive ? "default" : "secondary"}>
                      {documentType.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(documentType)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(documentType.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedDocumentType(null);
          form.reset();
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDocumentType ? 'Edit Document Type' : 'Add New Document Type'}
            </DialogTitle>
            <DialogDescription>
              Configure the document type settings and requirements
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Passport, Emirates ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of the document" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
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
                name="validityPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validity Period (months)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 24 for 2 years" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty if document doesn't expire
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isRequired"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Required Document</FormLabel>
                        <FormDescription>
                          Must be provided by all employees
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Available for selection
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setIsEditDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Document Type'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentTypesPage;