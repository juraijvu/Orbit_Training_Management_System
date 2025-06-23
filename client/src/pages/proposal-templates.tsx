import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

import { useDropzone } from "react-dropzone";
import { 
  Save, 
  Eye, 
  Plus, 
  Trash,
  MoveHorizontal,
  MoveVertical,
  Loader2,
  Image,
  FileImage
} from "lucide-react";

// Define the filter for making logos appear white on dark backgrounds
const whiteLogoFilter = "brightness(0) invert(1)";

interface CoverPageField {
  id: string;
  type: 'text' | 'image' | 'rectangle';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
  placeholder?: string;
  value?: string;
}

interface PreviewData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  courseName: string;
  presenterName: string;
  presentedTo: string;
  proposalDate: string;
  logoUrl: string;
  trainerName: string;
}

const defaultCoverFields: CoverPageField[] = [
  {
    id: "blackBackground",
    type: "rectangle",
    name: "Black Background",
    x: 0,
    y: 0,
    width: 250,
    height: 842,
    backgroundColor: "#000000"
  },
  {
    id: "contactPerson",
    type: "text",
    name: "Contact Person",
    x: 400,
    y: 350,
    width: 300,
    height: 30,
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
    color: "#333333",
    bold: false,
    italic: false,
    placeholder: "{{contactPerson}}"
  },
  {
    id: "email",
    type: "text",
    name: "Email",
    x: 400,
    y: 380,
    width: 300,
    height: 30,
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
    color: "#666666",
    bold: false,
    italic: false,
    placeholder: "{{email}}"
  },
  {
    id: "phone",
    type: "text",
    name: "Phone",
    x: 400,
    y: 410,
    width: 300,
    height: 30,
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
    color: "#666666",
    bold: false,
    italic: false,
    placeholder: "{{phone}}"
  },
  {
    id: "trainerName",
    type: "text",
    name: "Trainer Name",
    x: 400,
    y: 470,
    width: 300,
    height: 30,
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
    color: "#333333",
    bold: true,
    italic: false,
    placeholder: "{{trainerName}}"
  },
  {
    id: "courseName",
    type: "text",
    name: "Course Name",
    x: 125,
    y: 300,
    width: 200,
    height: 50,
    fontSize: 18,
    fontFamily: "Arial, sans-serif",
    color: "#ffffff",
    bold: true,
    italic: false,
    placeholder: "{{courseName}}"
  },
  {
    id: "logoPlaceholder",
    type: "image",
    name: "Company Logo",
    x: 125,
    y: 150,
    width: 120,
    height: 120,
    placeholder: "{{logoUrl}}"
  },
  {
    id: "presenterName",
    type: "text",
    name: "Presenter Name",
    x: 125,
    y: 500,
    width: 200,
    height: 50,
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
    color: "#ffffff",
    bold: false,
    italic: false,
    placeholder: "{{presenterName}}"
  },
  {
    id: "presentedTo",
    type: "text",
    name: "Presented To",
    x: 125,
    y: 550,
    width: 200,
    height: 50,
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
    color: "#ffffff",
    bold: false,
    italic: false,
    placeholder: "{{presentedTo}}"
  },
  {
    id: "companyName",
    type: "text",
    name: "Company Name",
    x: 400,
    y: 150,
    width: 300,
    height: 50,
    fontSize: 32,
    fontFamily: "Arial, sans-serif",
    color: "#000000",
    bold: true,
    italic: false,
    placeholder: "{{companyName}}"
  },
  {
    id: "proposalTitle",
    type: "text",
    name: "Proposal Title",
    x: 400,
    y: 220,
    width: 300,
    height: 50,
    fontSize: 24,
    fontFamily: "Arial, sans-serif",
    color: "#333333",
    bold: true,
    italic: false,
    value: "Training Proposal"
  },
  {
    id: "proposalDate",
    type: "text",
    name: "Proposal Date",
    x: 400,
    y: 280,
    width: 300,
    height: 50,
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
    color: "#666666",
    bold: false,
    italic: false,
    placeholder: "{{proposalDate}}"
  }
];

const fontFamilies = [
  "Arial, sans-serif",
  "Times New Roman, serif",
  "Courier New, monospace",
  "Georgia, serif",
  "Verdana, sans-serif",
];

interface Course {
  id: number;
  name: string;
  description: string;
  duration: string;
  fee: number;
  content?: string;
  active: boolean;
  createdAt: string;
}

interface CourseModule {
  id: string;
  name: string;
  subItems: string[];
}

export default function ProposalTemplates() {
  const { toast } = useToast();
  const [coverFields, setCoverFields] = useState<CoverPageField[]>(defaultCoverFields);
  const [selectedFieldId, setSelectedFieldId] = useState<string>(defaultCoverFields[0].id);
  const [coverPageImage, setCoverPageImage] = useState<string>("");
  const [templateName, setTemplateName] = useState<string>("Default Template");
  const [templateDescription, setTemplateDescription] = useState<string>("");
  const [previewData, setPreviewData] = useState<PreviewData>({
    companyName: "ABC Corporation",
    contactPerson: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "+971 50 123 4567",
    courseName: "Advanced Web Development",
    presenterName: "Presented by: John Smith",
    presentedTo: "Presented to: XYZ Company",
    proposalDate: "April 15, 2023",
    logoUrl: "https://via.placeholder.com/120",
    trainerName: "Alex Johnson"
  });
  const [showEditor, setShowEditor] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("cover");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [moduleDisplayFormat, setModuleDisplayFormat] = useState<string>("list");
  const [includeDuration, setIncludeDuration] = useState<boolean>(true);
  const [includeFees, setIncludeFees] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  // Page content states for pages 2-5 and last 3 pages
  const [page2Content, setPage2Content] = useState({
    title: "About Our Company",
    content: "",
    backgroundImage: null as string | null,
    pdfFile: null as File | null
  });
  const [page3Content, setPage3Content] = useState({
    title: "Our Training Services", 
    content: "",
    backgroundImage: null as string | null,
    pdfFile: null as File | null
  });
  const [page4Content, setPage4Content] = useState({
    title: "Why Choose Orbit Institute",
    content: "",
    backgroundImage: null as string | null,
    pdfFile: null as File | null
  });
  const [page5Content, setPage5Content] = useState({
    title: "Training Program Details",
    content: "",
    backgroundImage: null as string | null,
    pdfFile: null as File | null
  });
  
  // Last 3 pages content
  const [lastPage1Content, setLastPage1Content] = useState({
    title: "Terms & Conditions",
    content: "",
    backgroundImage: null as string | null,
    pdfFile: null as File | null
  });
  const [lastPage2Content, setLastPage2Content] = useState({
    title: "Our Credentials & Certifications",
    content: "",
    backgroundImage: null as string | null,
    pdfFile: null as File | null
  });
  const [lastPage3Content, setLastPage3Content] = useState({
    title: "Contact Us",
    content: "",
    backgroundImage: null as string | null,
    pdfFile: null as File | null
  });
  
  // Fetch courses from API
  const { data: courses, isLoading: isCoursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
    queryFn: getQueryFn({ on401: "throw" })
  });

  // Handle PDF file upload for pages
  const handlePdfUpload = (pageType: string, file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a PDF file.',
        variant: 'destructive',
      });
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: 'File Too Large',
        description: 'PDF file must be less than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      switch (pageType) {
        case 'page2':
          setPage2Content(prev => ({ ...prev, pdfFile: file, backgroundImage: result }));
          break;
        case 'page3':
          setPage3Content(prev => ({ ...prev, pdfFile: file, backgroundImage: result }));
          break;
        case 'page4':
          setPage4Content(prev => ({ ...prev, pdfFile: file, backgroundImage: result }));
          break;
        case 'page5':
          setPage5Content(prev => ({ ...prev, pdfFile: file, backgroundImage: result }));
          break;
        case 'last1':
          setLastPage1Content(prev => ({ ...prev, pdfFile: file, backgroundImage: result }));
          break;
        case 'last2':
          setLastPage2Content(prev => ({ ...prev, pdfFile: file, backgroundImage: result }));
          break;
        case 'last3':
          setLastPage3Content(prev => ({ ...prev, pdfFile: file, backgroundImage: result }));
          break;
      }
      
      toast({
        title: "Success",
        description: "PDF uploaded successfully!",
      });
    };
    reader.readAsDataURL(file);
  };

  // Find the selected field in our list
  const getSelectedField = (): CoverPageField | undefined => {
    return coverFields.find((field) => field.id === selectedFieldId);
  };

  // Update a field property
  const updateField = (property: string, value: any) => {
    const updatedFields = coverFields.map((field) => {
      if (field.id === selectedFieldId) {
        return { ...field, [property]: value };
      }
      return field;
    });
    setCoverFields(updatedFields);
  };

  // Add a new field
  const addField = () => {
    const newId = `field_${Date.now()}`;
    const newField: CoverPageField = {
      id: newId,
      type: 'text',
      name: `New Field ${coverFields.length + 1}`,
      x: 300,
      y: 300,
      width: 200,
      height: 50,
      fontSize: 16,
      fontFamily: "Arial, sans-serif",
      color: "#000000",
      backgroundColor: "",
      bold: false,
      italic: false,
      value: "New Field"
    };
    
    setCoverFields([...coverFields, newField]);
    setSelectedFieldId(newId);
  };

  // Delete the selected field
  const deleteField = () => {
    if (coverFields.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one field in the template",
        variant: "destructive"
      });
      return;
    }
    
    const updatedFields = coverFields.filter(field => field.id !== selectedFieldId);
    setCoverFields(updatedFields);
    setSelectedFieldId(updatedFields[0].id);
  };

  // Update preview data
  const updatePreviewData = (field: keyof PreviewData, value: string) => {
    setPreviewData({
      ...previewData,
      [field]: value
    });
  };

  // Save the complete template
  const saveCompleteTemplate = async () => {
    try {
      const templateData = {
        name: templateName,
        description: templateDescription,
        coverPageImage: coverPageImage,
        coverPageFields: JSON.stringify(coverFields),
        page2Template: JSON.stringify(page2Content),
        page3Template: JSON.stringify(page3Content),
        page4Template: JSON.stringify(page4Content),
        page5Template: JSON.stringify(page5Content),
        lastPage1Content: JSON.stringify(lastPage1Content),
        lastPage2Content: JSON.stringify(lastPage2Content),
        lastPage3Content: JSON.stringify(lastPage3Content),
        isActive: true
      };

      await apiRequest('/api/proposal-templates', {
        method: 'POST',
        body: JSON.stringify(templateData)
      });

      toast({
        title: "Template Saved",
        description: "Your complete proposal template has been saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Save template 
  const saveTemplate = () => {
    if (!coverPageImage) {
      toast({
        title: "Background Required",
        description: "Please upload a background image first",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success", 
      description: "Template with background image saved successfully"
    });
  };



  // Generate PDF preview
  const generatePdfPreview = () => {
    toast({
      title: "Coming Soon",
      description: "PDF generation will be implemented soon",
    });
  };

  // Handle cover page image upload
  const onCoverImageDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate PNG format
    if (!file.type.includes('png')) {
      toast({
        title: "Invalid Format",
        description: "Please upload a PNG file only",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setCoverPageImage(reader.result as string);
      setIsUploading(false);
      toast({
        title: "Success",
        description: "Cover page image uploaded successfully"
      });
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast({
        title: "Error",
        description: "Failed to upload cover page image",
        variant: "destructive"
      });
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const { getRootProps: getCoverImageRootProps, getInputProps: getCoverImageInputProps, isDragActive: isCoverImageDragActive } = useDropzone({
    onDrop: onCoverImageDrop,
    accept: {
      'image/png': ['.png']
    },
    maxFiles: 1
  });


  
  // Parse course content JSON to extract modules
  const parseModules = (content: string | undefined): CourseModule[] => {
    if (!content) return [];
    
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (error) {
      console.error("Error parsing course modules:", error);
      return [];
    }
  };
  
  // Get selected course
  const getSelectedCourse = (): Course | undefined => {
    if (!selectedCourseId || !courses) return undefined;
    return courses.find(course => course.id.toString() === selectedCourseId);
  };
  
  // Render modules based on selected format
  const renderModules = (): React.ReactNode => {
    const course = getSelectedCourse();
    if (!course) return "(Select a course to preview modules)";
    
    const modules = parseModules(course.content);
    if (!modules.length) return "No modules found for this course";
    
    switch (moduleDisplayFormat) {
      case 'list':
        return (
          <ul className="list-disc pl-5 space-y-2">
            {modules.map((module, idx) => (
              <li key={idx} className="text-sm">
                <strong>{module.name}</strong>
                {module.subItems && module.subItems.length > 0 && (
                  <ul className="list-circle pl-5 mt-1 space-y-1">
                    {module.subItems.map((item, i) => (
                      <li key={i} className="text-xs">{item}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        );
      
      case 'table':
        return (
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-100 p-1">Module</th>
                <th className="border border-gray-300 bg-gray-100 p-1">Sub-Topics</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((module, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 p-1 font-medium">{module.name}</td>
                  <td className="border border-gray-300 p-1">
                    {module.subItems && module.subItems.length > 0 ? (
                      <ul className="list-disc pl-4 space-y-1">
                        {module.subItems.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    ) : "None"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      
      case 'cards':
        return (
          <div className="grid grid-cols-1 gap-2">
            {modules.map((module, idx) => (
              <div key={idx} className="border rounded p-2 bg-white">
                <div className="font-medium text-sm border-b pb-1 mb-1">{module.name}</div>
                {module.subItems && module.subItems.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-xs">
                    {module.subItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : <div className="text-xs text-gray-500">No sub-topics</div>}
              </div>
            ))}
          </div>
        );
      
      default:
        return "(Select a display format)";
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Proposal Templates</h1>
          <p className="text-gray-600">Create and manage proposal templates for your corporate clients</p>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <Label htmlFor="template-description">Description</Label>
              <Input
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Brief description of this template"
              />
            </div>
          </div>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="cover">Cover Page</TabsTrigger>
          <TabsTrigger value="content">Content Pages</TabsTrigger>
          <TabsTrigger value="closing">Last 3 Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="cover">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Editor or Preview */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{showEditor ? "Editor" : "Preview"}</span>
                    <Button
                      variant="outline"
                      onClick={() => setShowEditor(!showEditor)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showEditor ? "Show Preview" : "Show Editor"}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {showEditor ? (
                    <div>
                      {/* Cover Page Background Upload */}
                      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                        <Label className="text-sm font-medium mb-3 block">Upload Background Image (A4 Size PNG)</Label>
                        <div
                          {...getCoverImageRootProps()}
                          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                            isCoverImageDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input {...getCoverImageInputProps()} />
                          {isUploading ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="h-8 w-8 animate-spin" />
                              <span className="ml-2">Uploading...</span>
                            </div>
                          ) : coverPageImage ? (
                            <div className="space-y-2">
                              <FileImage className="h-8 w-8 mx-auto text-green-600" />
                              <p className="text-sm text-green-600">Background image uploaded successfully</p>
                              <p className="text-xs text-gray-500">PNG background image ready</p>
                              <Button variant="outline" size="sm" onClick={() => setCoverPageImage("")}>
                                Remove Background
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Image className="h-8 w-8 mx-auto text-gray-400" />
                              <p className="text-sm text-gray-600">
                                {isCoverImageDragActive ? "Drop PNG background here..." : "Drag & drop PNG background or click to browse"}
                              </p>
                              <p className="text-xs text-gray-500">PNG format only • A4 size (595x842px)</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between mb-4">
                        <Button variant="outline" onClick={addField}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Field
                        </Button>
                        <Button onClick={saveTemplate}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Template
                        </Button>
                      </div>

                      <Tabs
                        defaultValue={selectedFieldId}
                        onValueChange={setSelectedFieldId}
                      >
                        <TabsList className="w-full flex-wrap">
                          {coverFields.map((field) => (
                            <TabsTrigger key={field.id} value={field.id}>
                              {field.name}
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        {coverFields.map((field) => (
                          <TabsContent key={field.id} value={field.id}>
                            <div className="space-y-4">
                              <div className="flex justify-between">
                                <div>
                                  <Label htmlFor="field-name">Field Name</Label>
                                  <Input
                                    id="field-name"
                                    value={field.name}
                                    onChange={(e) =>
                                      updateField("name", e.target.value)
                                    }
                                  />
                                </div>
                                {field.id !== "blackBackground" && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={deleteField}
                                  >
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete
                                  </Button>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="field-type">Field Type</Label>
                                  <select
                                    id="field-type"
                                    className="w-full border border-gray-300 rounded p-2"
                                    value={field.type}
                                    onChange={(e) =>
                                      updateField("type", e.target.value)
                                    }
                                  >
                                    <option value="text">Text</option>
                                    <option value="image">Image</option>
                                    <option value="rectangle">Rectangle</option>
                                  </select>
                                </div>
                                
                                {field.type === "text" && (
                                  <div>
                                    <Label htmlFor="font-family">Font Family</Label>
                                    <select
                                      id="font-family"
                                      className="w-full border border-gray-300 rounded p-2"
                                      value={field.fontFamily}
                                      onChange={(e) =>
                                        updateField("fontFamily", e.target.value)
                                      }
                                    >
                                      {fontFamilies.map((font) => (
                                        <option key={font} value={font}>
                                          {font.split(",")[0]}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>
                                    <MoveHorizontal className="h-4 w-4 inline mr-1" />
                                    X Position
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <Slider
                                      min={0}
                                      max={595}
                                      step={1}
                                      value={[field.x]}
                                      onValueChange={(values) =>
                                        updateField("x", values[0])
                                      }
                                    />
                                    <Input
                                      className="w-20"
                                      value={field.x}
                                      onChange={(e) =>
                                        updateField("x", parseInt(e.target.value) || 0)
                                      }
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label>
                                    <MoveVertical className="h-4 w-4 inline mr-1" />
                                    Y Position
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <Slider
                                      min={0}
                                      max={842}
                                      step={1}
                                      value={[field.y]}
                                      onValueChange={(values) =>
                                        updateField("y", values[0])
                                      }
                                    />
                                    <Input
                                      className="w-20"
                                      value={field.y}
                                      onChange={(e) =>
                                        updateField("y", parseInt(e.target.value) || 0)
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Width</Label>
                                  <div className="flex items-center gap-2">
                                    <Slider
                                      min={10}
                                      max={595}
                                      step={1}
                                      value={[field.width]}
                                      onValueChange={(values) =>
                                        updateField("width", values[0])
                                      }
                                    />
                                    <Input
                                      className="w-20"
                                      value={field.width}
                                      onChange={(e) =>
                                        updateField("width", parseInt(e.target.value) || 10)
                                      }
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label>Height</Label>
                                  <div className="flex items-center gap-2">
                                    <Slider
                                      min={10}
                                      max={842}
                                      step={1}
                                      value={[field.height]}
                                      onValueChange={(values) =>
                                        updateField("height", values[0])
                                      }
                                    />
                                    <Input
                                      className="w-20"
                                      value={field.height}
                                      onChange={(e) =>
                                        updateField("height", parseInt(e.target.value) || 10)
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

                              {field.type === "text" && (
                                <>
                                  <div>
                                    <Label>Font Size</Label>
                                    <div className="flex items-center gap-2">
                                      <Slider
                                        min={8}
                                        max={72}
                                        step={1}
                                        value={[field.fontSize || 16]}
                                        onValueChange={(values) =>
                                          updateField("fontSize", values[0])
                                        }
                                      />
                                      <Input
                                        className="w-20"
                                        value={field.fontSize}
                                        onChange={(e) =>
                                          updateField("fontSize", parseInt(e.target.value) || 16)
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="text-color">Text Color</Label>
                                      <div className="flex items-center gap-2">
                                        <Input
                                          id="text-color"
                                          type="color"
                                          className="w-12 h-10"
                                          value={field.color}
                                          onChange={(e) =>
                                            updateField("color", e.target.value)
                                          }
                                        />
                                        <Input
                                          value={field.color}
                                          onChange={(e) =>
                                            updateField("color", e.target.value)
                                          }
                                        />
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-4 mt-8">
                                      <div className="flex items-center">
                                        <input
                                          type="checkbox"
                                          id="bold"
                                          checked={field.bold}
                                          onChange={(e) =>
                                            updateField("bold", e.target.checked)
                                          }
                                          className="mr-2"
                                        />
                                        <Label htmlFor="bold">Bold</Label>
                                      </div>

                                      <div className="flex items-center">
                                        <input
                                          type="checkbox"
                                          id="italic"
                                          checked={field.italic}
                                          onChange={(e) =>
                                            updateField("italic", e.target.checked)
                                          }
                                          className="mr-2"
                                        />
                                        <Label htmlFor="italic">Italic</Label>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor="text-value">Text Value</Label>
                                    <Textarea
                                      id="text-value"
                                      value={field.value || field.placeholder || ""}
                                      onChange={(e) =>
                                        updateField("value", e.target.value)
                                      }
                                      placeholder="Enter text or use {{placeholder}}"
                                    />
                                  </div>
                                </>
                              )}

                              {field.type === "rectangle" && (
                                <div>
                                  <Label htmlFor="bg-color">Background Color</Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      id="bg-color"
                                      type="color"
                                      className="w-12 h-10"
                                      value={field.backgroundColor}
                                      onChange={(e) =>
                                        updateField("backgroundColor", e.target.value)
                                      }
                                    />
                                    <Input
                                      value={field.backgroundColor}
                                      onChange={(e) =>
                                        updateField("backgroundColor", e.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                              )}

                              {field.type === "image" && (
                                <div>
                                  <Label htmlFor="image-placeholder">Image Placeholder</Label>
                                  <Input
                                    id="image-placeholder"
                                    value={field.placeholder || ""}
                                    onChange={(e) =>
                                      updateField("placeholder", e.target.value)
                                    }
                                    placeholder="Enter placeholder like {{logoUrl}}"
                                  />
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>

                      <Separator className="my-6" />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Preview Data</h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="preview-company-name">Company Name</Label>
                            <Input
                              id="preview-company-name"
                              value={previewData.companyName}
                              onChange={(e) =>
                                updatePreviewData("companyName", e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <Label htmlFor="preview-course-name">Course Name</Label>
                            <Input
                              id="preview-course-name"
                              value={previewData.courseName}
                              onChange={(e) =>
                                updatePreviewData("courseName", e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <Label htmlFor="preview-presenter-name">Presenter Name</Label>
                            <Input
                              id="preview-presenter-name"
                              value={previewData.presenterName}
                              onChange={(e) =>
                                updatePreviewData("presenterName", e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <Label htmlFor="preview-presented-to">Presented To</Label>
                            <Input
                              id="preview-presented-to"
                              value={previewData.presentedTo}
                              onChange={(e) =>
                                updatePreviewData("presentedTo", e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <Label htmlFor="preview-proposal-date">Proposal Date</Label>
                            <Input
                              id="preview-proposal-date"
                              value={previewData.proposalDate}
                              onChange={(e) =>
                                updatePreviewData("proposalDate", e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <Label htmlFor="preview-logo-url">Logo URL</Label>
                            <Input
                              id="preview-logo-url"
                              value={previewData.logoUrl}
                              onChange={(e) =>
                                updatePreviewData("logoUrl", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-full border rounded p-4 overflow-auto max-h-[800px]">
                        {/* Debug info */}
                        {coverPageImage && (
                          <div className="mb-2 text-sm text-green-600 text-center">
                            Background image loaded successfully
                          </div>
                        )}
                        {!coverPageImage && (
                          <div className="mb-2 text-sm text-gray-500 text-center">
                            No background image uploaded
                          </div>
                        )}
                        
                        <div 
                          className="relative w-[595px] h-[842px] mx-auto border border-gray-300 shadow-md"
                          style={{
                            backgroundColor: coverPageImage ? 'transparent' : 'white',
                            backgroundImage: coverPageImage ? `url(${coverPageImage})` : 'none',
                            backgroundSize: coverPageImage ? 'cover' : 'auto',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                          }}
                        >
                          {/* Render all fields from the cover template */}
                          {coverFields.map((field) => {
                            if (field.type === "rectangle") {
                              return (
                                <div
                                  key={field.id}
                                  style={{
                                    position: "absolute",
                                    left: `${field.x}px`,
                                    top: `${field.y}px`,
                                    width: `${field.width}px`,
                                    height: `${field.height}px`,
                                    backgroundColor: field.backgroundColor || "transparent",
                                  }}
                                />
                              );
                            } else if (field.type === "text") {
                              // Replace placeholders with preview data
                              let textValue = field.value || field.placeholder || "";
                              if (textValue.includes("{{companyName}}")) {
                                textValue = textValue.replace("{{companyName}}", previewData.companyName);
                              }
                              if (textValue.includes("{{courseName}}")) {
                                textValue = textValue.replace("{{courseName}}", previewData.courseName);
                              }
                              if (textValue.includes("{{presenterName}}")) {
                                textValue = textValue.replace("{{presenterName}}", previewData.presenterName);
                              }
                              if (textValue.includes("{{presentedTo}}")) {
                                textValue = textValue.replace("{{presentedTo}}", previewData.presentedTo);
                              }
                              if (textValue.includes("{{proposalDate}}")) {
                                textValue = textValue.replace("{{proposalDate}}", previewData.proposalDate);
                              }

                              return (
                                <div
                                  key={field.id}
                                  style={{
                                    position: "absolute",
                                    left: `${field.x}px`,
                                    top: `${field.y}px`,
                                    width: `${field.width}px`,
                                    height: `${field.height}px`,
                                    fontFamily: field.fontFamily,
                                    fontSize: `${field.fontSize}px`,
                                    fontWeight: field.bold ? "bold" : "normal",
                                    fontStyle: field.italic ? "italic" : "normal",
                                    color: field.color,
                                    textAlign: "center",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                  }}
                                >
                                  {textValue}
                                </div>
                              );
                            } else if (field.type === "image") {
                              // Replace image placeholder with preview data
                              let imageUrl = previewData.logoUrl;
                              
                              return (
                                <div
                                  key={field.id}
                                  style={{
                                    position: "absolute",
                                    left: `${field.x}px`,
                                    top: `${field.y}px`,
                                    width: `${field.width}px`,
                                    height: `${field.height}px`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <img
                                    src={imageUrl}
                                    alt="Logo"
                                    style={{
                                      maxWidth: "100%",
                                      maxHeight: "100%",
                                      objectFit: "contain",
                                    }}
                                  />
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                      
                      <Button
                        className="mt-4"
                        onClick={generatePdfPreview}
                      >
                        Generate PDF Preview
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right side - Always shows the preview */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Cover Page Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Debug info for right panel */}
                  {coverPageImage && (
                    <div className="mb-2 text-sm text-green-600 text-center">
                      Background image active
                    </div>
                  )}
                  {!coverPageImage && (
                    <div className="mb-2 text-sm text-gray-500 text-center">
                      Upload background image to preview
                    </div>
                  )}
                  
                  <div className="w-full border rounded p-4 overflow-auto max-h-[800px]">
                    <div 
                      className="relative w-[595px] h-[842px] mx-auto border border-gray-300 shadow-md"
                      style={{
                        backgroundColor: coverPageImage ? 'transparent' : 'white',
                        backgroundImage: coverPageImage ? `url(${coverPageImage})` : 'none',
                        backgroundSize: coverPageImage ? 'cover' : 'auto',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      {/* Render all fields from the cover template */}
                      {coverFields.map((field) => {
                        if (field.type === "rectangle") {
                          return (
                            <div
                              key={field.id}
                              style={{
                                position: "absolute",
                                left: `${field.x}px`,
                                top: `${field.y}px`,
                                width: `${field.width}px`,
                                height: `${field.height}px`,
                                backgroundColor: field.backgroundColor || "transparent",
                              }}
                            />
                          );
                        } else if (field.type === "text") {
                          // Replace placeholders with preview data
                          let textValue = field.value || field.placeholder || "";
                          if (textValue.includes("{{companyName}}")) {
                            textValue = textValue.replace("{{companyName}}", previewData.companyName);
                          }
                          if (textValue.includes("{{contactPerson}}")) {
                            textValue = textValue.replace("{{contactPerson}}", previewData.contactPerson);
                          }
                          if (textValue.includes("{{email}}")) {
                            textValue = textValue.replace("{{email}}", previewData.email);
                          }
                          if (textValue.includes("{{phone}}")) {
                            textValue = textValue.replace("{{phone}}", previewData.phone);
                          }
                          if (textValue.includes("{{courseName}}")) {
                            textValue = textValue.replace("{{courseName}}", previewData.courseName);
                          }
                          if (textValue.includes("{{presenterName}}")) {
                            textValue = textValue.replace("{{presenterName}}", previewData.presenterName);
                          }
                          if (textValue.includes("{{presentedTo}}")) {
                            textValue = textValue.replace("{{presentedTo}}", previewData.presentedTo);
                          }
                          if (textValue.includes("{{proposalDate}}")) {
                            textValue = textValue.replace("{{proposalDate}}", previewData.proposalDate);
                          }
                          if (textValue.includes("{{trainerName}}")) {
                            textValue = textValue.replace("{{trainerName}}", previewData.trainerName);
                          }

                          return (
                            <div
                              key={field.id}
                              style={{
                                position: "absolute",
                                left: `${field.x}px`,
                                top: `${field.y}px`,
                                width: `${field.width}px`,
                                height: `${field.height}px`,
                                fontFamily: field.fontFamily,
                                fontSize: `${field.fontSize}px`,
                                fontWeight: field.bold ? "bold" : "normal",
                                fontStyle: field.italic ? "italic" : "normal",
                                color: field.color,
                                textAlign: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                              }}
                            >
                              {textValue}
                            </div>
                          );
                        } else if (field.type === "image") {
                          // Replace image placeholder with preview data
                          let imageUrl = previewData.logoUrl;
                          
                          // Check if logo is on the black background and needs to be white
                          const isOnBlackBackground = field.x < 250; // Assuming left side has the black background
                          
                          return (
                            <div
                              key={field.id}
                              style={{
                                position: "absolute",
                                left: `${field.x}px`,
                                top: `${field.y}px`,
                                width: `${field.width}px`,
                                height: `${field.height}px`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <img
                                src={imageUrl}
                                alt="Logo"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  objectFit: "contain",
                                  filter: isOnBlackBackground ? whiteLogoFilter : "none" // Apply white filter when on black
                                }}
                              />
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={generatePdfPreview}
                  >
                    Generate PDF Preview
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Page Template Configuration</CardTitle>
              <p className="text-sm text-gray-600">Configure pages 2-5 of your proposal template</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="page2" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="page2">Page 2</TabsTrigger>
                  <TabsTrigger value="page3">Page 3</TabsTrigger>
                  <TabsTrigger value="page4">Page 4</TabsTrigger>
                  <TabsTrigger value="page5">Page 5</TabsTrigger>
                </TabsList>

                <TabsContent value="page2" className="space-y-4 pt-4">
                  <Card className="p-4">
                    <h4 className="font-medium text-lg mb-4">Page 2: Company Introduction</h4>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Page Title</Label>
                        <Input 
                          placeholder="About Our Company" 
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Content Type</Label>
                        <Tabs defaultValue="text" className="w-full mt-2">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text">Rich Text</TabsTrigger>
                            <TabsTrigger value="upload">PDF Upload</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="text" className="pt-4">
                            <Textarea 
                              placeholder="Enter company introduction content..."
                              className="min-h-[200px]"
                            />
                          </TabsContent>
                          
                          <TabsContent value="upload" className="pt-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <FileImage className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500 mb-2">
                                Upload company profile PDF
                              </p>
                              <p className="text-xs text-gray-400 mb-4">Max file size: 10MB</p>
                              <Button variant="outline" size="sm">Browse Files</Button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="page3" className="space-y-4 pt-4">
                  <Card className="p-4">
                    <h4 className="font-medium text-lg mb-4">Page 3: Services Overview</h4>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Page Title</Label>
                        <Input 
                          placeholder="Our Training Services" 
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Content Type</Label>
                        <Tabs defaultValue="text" className="w-full mt-2">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text">Rich Text</TabsTrigger>
                            <TabsTrigger value="upload">PDF Upload</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="text" className="pt-4">
                            <Textarea 
                              placeholder="Describe your training services and methodology..."
                              className="min-h-[200px]"
                              value={page3Content.content}
                              onChange={(e) => setPage3Content({...page3Content, content: e.target.value})}
                            />
                          </TabsContent>
                          
                          <TabsContent value="upload" className="pt-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <FileImage className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500 mb-2">
                                Upload services PDF
                              </p>
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handlePdfUpload('page3', file);
                                }}
                                className="hidden"
                                id="page3-pdf-upload"
                              />
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => document.getElementById('page3-pdf-upload')?.click()}
                              >
                                Browse Files
                              </Button>
                              {page3Content.pdfFile && (
                                <p className="text-sm text-green-600 mt-2">
                                  {page3Content.pdfFile.name} uploaded
                                </p>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="page4" className="space-y-4 pt-4">
                  <Card className="p-4">
                    <h4 className="font-medium text-lg mb-4">Page 4: Why Choose Us</h4>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Page Title</Label>
                        <Input 
                          placeholder="Why Choose Orbit Institute" 
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Content Type</Label>
                        <Tabs defaultValue="text" className="w-full mt-2">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text">Rich Text</TabsTrigger>
                            <TabsTrigger value="upload">PDF Upload</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="text" className="pt-4">
                            <Textarea 
                              placeholder="Highlight your unique selling points and advantages..."
                              className="min-h-[200px]"
                              value={page4Content.content}
                              onChange={(e) => setPage4Content({...page4Content, content: e.target.value})}
                            />
                          </TabsContent>
                          
                          <TabsContent value="upload" className="pt-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <FileImage className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500 mb-2">
                                Upload why choose us PDF
                              </p>
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handlePdfUpload('page4', file);
                                }}
                                className="hidden"
                                id="page4-pdf-upload"
                              />
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => document.getElementById('page4-pdf-upload')?.click()}
                              >
                                Browse Files
                              </Button>
                              {page4Content.pdfFile && (
                                <p className="text-sm text-green-600 mt-2">
                                  {page4Content.pdfFile.name} uploaded
                                </p>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="page5" className="space-y-4 pt-4">
                  <Card className="p-4">
                    <h4 className="font-medium text-lg mb-4">Page 5: Course Details Intro</h4>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Page Title</Label>
                        <Input 
                          placeholder="Training Program Details" 
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Content Type</Label>
                        <Tabs defaultValue="text" className="w-full mt-2">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text">Rich Text</TabsTrigger>
                            <TabsTrigger value="upload">PDF Upload</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="text" className="pt-4">
                            <Textarea 
                              placeholder="Introduction to the training program details that will follow..."
                              className="min-h-[200px]"
                              value={page5Content.content}
                              onChange={(e) => setPage5Content({...page5Content, content: e.target.value})}
                            />
                          </TabsContent>
                          
                          <TabsContent value="upload" className="pt-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <FileImage className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500 mb-2">
                                Upload program details PDF
                              </p>
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handlePdfUpload('page5', file);
                                }}
                                className="hidden"
                                id="page5-pdf-upload"
                              />
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => document.getElementById('page5-pdf-upload')?.click()}
                              >
                                Browse Files
                              </Button>
                              {page5Content.pdfFile && (
                                <p className="text-sm text-green-600 mt-2">
                                  {page5Content.pdfFile.name} uploaded
                                </p>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                      <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                        <strong>Note:</strong> Course outline will be inserted automatically after this page based on the uploaded course outline for each proposal.
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="closing">
          <Card>
            <CardHeader>
              <CardTitle>Last 3 Pages Configuration</CardTitle>
              <p className="text-sm text-gray-600">Configure the final 3 pages that appear in every proposal</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="lastpage1" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="lastpage1">Last Page 1</TabsTrigger>
                  <TabsTrigger value="lastpage2">Last Page 2</TabsTrigger>
                  <TabsTrigger value="lastpage3">Last Page 3</TabsTrigger>
                </TabsList>

                <TabsContent value="lastpage1" className="space-y-4 pt-4">
                  <Card className="p-4">
                    <h4 className="font-medium text-lg mb-4">Terms & Conditions</h4>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Page Title</Label>
                        <Input 
                          placeholder="Terms & Conditions" 
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Content Type</Label>
                        <Tabs defaultValue="text" className="w-full mt-2">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text">Rich Text</TabsTrigger>
                            <TabsTrigger value="upload">PDF Upload</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="text" className="pt-4">
                            <Textarea 
                              placeholder="Enter terms and conditions..."
                              className="min-h-[300px]"
                              value={lastPage1Content.content}
                              onChange={(e) => setLastPage1Content({...lastPage1Content, content: e.target.value})}
                            />
                          </TabsContent>
                          
                          <TabsContent value="upload" className="pt-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <FileImage className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500 mb-2">
                                Upload terms & conditions PDF
                              </p>
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handlePdfUpload('last1', file);
                                }}
                                className="hidden"
                                id="last1-pdf-upload"
                              />
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => document.getElementById('last1-pdf-upload')?.click()}
                              >
                                Browse Files
                              </Button>
                              {lastPage1Content.pdfFile && (
                                <p className="text-sm text-green-600 mt-2">
                                  {lastPage1Content.pdfFile.name} uploaded
                                </p>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="lastpage2" className="space-y-4 pt-4">
                  <Card className="p-4">
                    <h4 className="font-medium text-lg mb-4">Company Credentials</h4>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Page Title</Label>
                        <Input 
                          placeholder="Our Credentials & Certifications" 
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Content Type</Label>
                        <Tabs defaultValue="text" className="w-full mt-2">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text">Rich Text</TabsTrigger>
                            <TabsTrigger value="upload">PDF Upload</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="text" className="pt-4">
                            <Textarea 
                              placeholder="Enter credentials and certifications..."
                              className="min-h-[300px]"
                            />
                          </TabsContent>
                          
                          <TabsContent value="upload" className="pt-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <FileImage className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500 mb-2">
                                Upload credentials PDF
                              </p>
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handlePdfUpload('last2', file);
                                }}
                                className="hidden"
                                id="last2-pdf-upload"
                              />
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => document.getElementById('last2-pdf-upload')?.click()}
                              >
                                Browse Files
                              </Button>
                              {lastPage2Content.pdfFile && (
                                <p className="text-sm text-green-600 mt-2">
                                  {lastPage2Content.pdfFile.name} uploaded
                                </p>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="lastpage3" className="space-y-4 pt-4">
                  <Card className="p-4">
                    <h4 className="font-medium text-lg mb-4">Contact Information</h4>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Page Title</Label>
                        <Input 
                          placeholder="Contact Us" 
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Content Type</Label>
                        <Tabs defaultValue="text" className="w-full mt-2">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text">Rich Text</TabsTrigger>
                            <TabsTrigger value="upload">PDF Upload</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="text" className="pt-4">
                            <Textarea 
                              placeholder="Enter contact information, office locations, and how to reach you..."
                              className="min-h-[300px]"
                              value={lastPage3Content.content}
                              onChange={(e) => setLastPage3Content({...lastPage3Content, content: e.target.value})}
                            />
                          </TabsContent>
                          
                          <TabsContent value="upload" className="pt-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <FileImage className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500 mb-2">
                                Upload contact page PDF
                              </p>
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handlePdfUpload('last3', file);
                                }}
                                className="hidden"
                                id="last3-pdf-upload"
                              />
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => document.getElementById('last3-pdf-upload')?.click()}
                              >
                                Browse Files
                              </Button>
                              {lastPage3Content.pdfFile && (
                                <p className="text-sm text-green-600 mt-2">
                                  {lastPage3Content.pdfFile.name} uploaded
                                </p>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Save Template Button */}
      <div className="flex justify-end mt-6">
        <Button onClick={saveCompleteTemplate} size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save Complete Template
        </Button>
      </div>
      </div>
    </AppLayout>
  );
}