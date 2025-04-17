import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Save, 
  Upload, 
  Eye, 
  Plus, 
  Trash,
  MoveHorizontal,
  MoveVertical,
  ArrowRight,
  CheckCircle2,
  Loader2
} from "lucide-react";

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
  courseName: string;
  presenterName: string;
  presentedTo: string;
  proposalDate: string;
  logoUrl: string;
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
  const [previewData, setPreviewData] = useState<PreviewData>({
    companyName: "ABC Corporation",
    courseName: "Advanced Web Development",
    presenterName: "Presented by: John Smith",
    presentedTo: "Presented to: XYZ Company",
    proposalDate: "April 15, 2023",
    logoUrl: "https://via.placeholder.com/120"
  });
  const [showEditor, setShowEditor] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("cover");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [moduleDisplayFormat, setModuleDisplayFormat] = useState<string>("list");
  const [includeDuration, setIncludeDuration] = useState<boolean>(true);
  const [includeFees, setIncludeFees] = useState<boolean>(true);
  
  // Fetch courses from API
  const { data: courses, isLoading: isCoursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
    queryFn: getQueryFn()
  });

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

  // Save template
  const saveTemplate = () => {
    try {
      const templateData = {
        coverFields
      };
      
      // Convert to JSON and save (in a real app, you'd save this to the database)
      const json = JSON.stringify(templateData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'proposal-template.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Proposal template saved successfully"
      });
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save proposal template",
        variant: "destructive"
      });
    }
  };

  // Generate PDF preview
  const generatePdfPreview = () => {
    toast({
      title: "Coming Soon",
      description: "PDF generation will be implemented soon",
    });
  };

  // Upload a JSON template
  const uploadTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.coverFields && Array.isArray(json.coverFields)) {
          setCoverFields(json.coverFields);
          setSelectedFieldId(json.coverFields[0].id);
          toast({
            title: "Success",
            description: "Template loaded successfully"
          });
        } else {
          throw new Error("Invalid template format");
        }
      } catch (error) {
        console.error("Error parsing template:", error);
        toast({
          title: "Error",
          description: "Failed to parse template file",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };
  
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
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Proposal Template Editor</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="cover">Cover Page</TabsTrigger>
          <TabsTrigger value="content">Content Pages</TabsTrigger>
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
                      <div className="flex justify-between mb-4">
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = ".json";
                              input.onchange = (e) =>
                                uploadTemplate(
                                  e as unknown as React.ChangeEvent<HTMLInputElement>
                                );
                              input.click();
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Import
                          </Button>
                          <Button variant="outline" onClick={addField}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Field
                          </Button>
                        </div>
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
                        <div className="relative w-[595px] h-[842px] mx-auto border border-gray-300 shadow-md bg-white">
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
                        <Download className="h-4 w-4 mr-2" />
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
                  <div className="w-full border rounded p-4 overflow-auto max-h-[800px]">
                    <div className="relative w-[595px] h-[842px] mx-auto border border-gray-300 shadow-md bg-white">
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
                    variant="outline"
                    className="mt-4"
                    onClick={generatePdfPreview}
                  >
                    <Download className="h-4 w-4 mr-2" />
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
              <CardTitle>Content Pages Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4 h-full">
                  <div className="flex flex-col h-full">
                    <div>
                      <h4 className="font-medium text-lg mb-2">Company Introduction</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        Upload company profile PDF or create content
                      </p>
                    </div>
                    
                    <Tabs defaultValue="upload" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">PDF Upload</TabsTrigger>
                        <TabsTrigger value="text">Text Editor</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="upload" className="space-y-4 pt-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 mb-2">
                            Drag & drop your company profile PDF here
                          </p>
                          <p className="text-xs text-gray-400 mb-4">
                            Max. file size: 10MB
                          </p>
                          <Button variant="outline" size="sm">
                            Browse Files
                          </Button>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-gray-100 rounded flex-1 p-2 flex items-center">
                            <div className="text-xs text-gray-600 overflow-hidden overflow-ellipsis">
                              No file selected
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="text" className="space-y-4 pt-4">
                        <div>
                          <Label htmlFor="intro-title">Section Title</Label>
                          <Input id="intro-title" defaultValue="Company Introduction" className="mb-2" />
                        </div>
                        <div>
                          <Label htmlFor="intro-content">Content</Label>
                          <Textarea 
                            id="intro-content" 
                            rows={6} 
                            placeholder="Enter your company introduction text here..."
                            className="resize-none"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </Card>
                
                <Card className="p-4 h-full">
                  <div className="flex flex-col h-full">
                    <div>
                      <h4 className="font-medium text-lg mb-2">Course Modules</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        Select course to display its modules
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="course-select">Select Course</Label>
                        {isCoursesLoading ? (
                          <div className="flex items-center space-x-2 h-10 p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Loading courses...</span>
                          </div>
                        ) : (
                          <select
                            id="course-select"
                            className="w-full border border-gray-300 rounded p-2"
                            value={selectedCourseId}
                            onChange={(e) => {
                              setSelectedCourseId(e.target.value);
                              const course = courses?.find(c => c.id.toString() === e.target.value);
                              if (course) {
                                updatePreviewData("courseName", course.name);
                              }
                            }}
                          >
                            <option value="">Select a course...</option>
                            {courses?.map((course) => (
                              <option key={course.id} value={course.id.toString()}>
                                {course.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="modules-display">Module Display Format</Label>
                        <select
                          id="modules-display"
                          className="w-full border border-gray-300 rounded p-2"
                          value={moduleDisplayFormat}
                          onChange={(e) => setModuleDisplayFormat(e.target.value)}
                        >
                          <option value="list">Bulleted List</option>
                          <option value="table">Table Format</option>
                          <option value="cards">Cards</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="include-duration" 
                          checked={includeDuration}
                          onChange={(e) => setIncludeDuration(e.target.checked)}
                        />
                        <Label htmlFor="include-duration" className="text-sm">Include Duration</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="include-fees" 
                          checked={includeFees}
                          onChange={(e) => setIncludeFees(e.target.checked)}
                        />
                        <Label htmlFor="include-fees" className="text-sm">Include Fees</Label>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="text-sm font-medium">Preview:</div>
                        <div className="text-xs mt-1">
                          {getSelectedCourse() && (
                            <>
                              {includeDuration && (
                                <div className="mb-1 font-medium">
                                  Duration: {getSelectedCourse()?.duration}
                                </div>
                              )}
                              {includeFees && (
                                <div className="mb-2 font-medium">
                                  Fee: AED {getSelectedCourse()?.fee}
                                </div>
                              )}
                            </>
                          )}
                          <div className={getSelectedCourse() ? "" : "text-gray-500"}>
                            {renderModules()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 h-full">
                  <div className="flex flex-col h-full">
                    <div>
                      <h4 className="font-medium text-lg mb-2">Pricing & Timeline</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        Set pricing and delivery timeline
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="pricing-type">Pricing Type</Label>
                        <select
                          id="pricing-type"
                          className="w-full border border-gray-300 rounded p-2"
                        >
                          <option value="fixed">Fixed Price</option>
                          <option value="participant">Per Participant</option>
                          <option value="tiered">Tiered Pricing</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="base-price">Base Price (AED)</Label>
                          <Input id="base-price" type="number" placeholder="0.00" />
                        </div>
                        <div>
                          <Label htmlFor="discount">Discount (%)</Label>
                          <Input id="discount" type="number" max="20" placeholder="0" />
                          <p className="text-xs text-gray-500 mt-1">Maximum 20% discount</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="timeline-weeks">Course Duration (Weeks)</Label>
                        <Input id="timeline-weeks" type="number" placeholder="4" />
                      </div>
                      
                      <div>
                        <Label htmlFor="timeline-hours">Hours Per Week</Label>
                        <Input id="timeline-hours" type="number" placeholder="10" />
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="text-sm font-medium">Total:</div>
                        <div className="text-md mt-1">
                          AED 0.00
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="flex flex-col items-center justify-center pt-4">
                <h4 className="font-medium text-lg mb-2">Page Ordering</h4>
                <p className="text-sm text-gray-500 mb-4 text-center">
                  Arrange and customize the order of your proposal pages
                </p>
                
                <div className="w-full max-w-md border rounded-md p-4">
                  <div className="space-y-2">
                    <div className="flex items-center p-2 bg-gray-50 rounded border cursor-move">
                      <span className="flex-1">1. Cover Page</span>
                    </div>
                    <div className="flex items-center p-2 bg-gray-50 rounded border cursor-move">
                      <span className="flex-1">2. Company Introduction</span>
                    </div>
                    <div className="flex items-center p-2 bg-gray-50 rounded border cursor-move">
                      <span className="flex-1">3. Course Modules</span>
                    </div>
                    <div className="flex items-center p-2 bg-gray-50 rounded border cursor-move">
                      <span className="flex-1">4. Pricing & Timeline</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center pt-4">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}