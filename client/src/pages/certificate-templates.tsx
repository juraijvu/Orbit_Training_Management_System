import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Download, Save, Upload, Eye } from "lucide-react";
import certificateTemplateSvg from "@/assets/certificates/certificate-template.svg";
import { svgToDataUrl, CertificateData, generateCertificateSvg } from "@/lib/certificate-utils";

interface TemplateField {
  id: string;
  name: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
}

interface CertificateTemplate {
  id: number;
  name: string;
  svgContent: string;
  fields: TemplateField[];
}

interface PreviewData {
  studentName: string;
  courseName: string;
  startDate: string;
  finishDate: string;
  certificateNumber: string;
}

const defaultFields: TemplateField[] = [
  {
    id: "studentName",
    name: "Student Name",
    x: 528,
    y: 340,
    fontSize: 36,
    fontFamily: "Times New Roman, serif",
    bold: false,
    italic: true,
  },
  {
    id: "courseName",
    name: "Course Name",
    x: 528,
    y: 460,
    fontSize: 32,
    fontFamily: "Times New Roman, serif",
    bold: true,
    italic: false,
  },
  {
    id: "startDate",
    name: "Start Date",
    x: 458,
    y: 610,
    fontSize: 20,
    fontFamily: "Arial, sans-serif",
    bold: false,
    italic: false,
  },
  {
    id: "finishDate",
    name: "Finish Date",
    x: 598,
    y: 610,
    fontSize: 20,
    fontFamily: "Arial, sans-serif",
    bold: false,
    italic: false,
  },
  {
    id: "certificateNumber",
    name: "Certificate Number",
    x: 258,
    y: 700,
    fontSize: 14,
    fontFamily: "Arial, sans-serif",
    bold: false,
    italic: false,
  },
];

const fontFamilies = [
  "Arial, sans-serif",
  "Times New Roman, serif",
  "Courier New, monospace",
  "Georgia, serif",
  "Verdana, sans-serif",
];

export default function CertificateTemplates() {
  const { toast } = useToast();
  const [templateSvg, setTemplateSvg] = useState<string>("");
  const [fields, setFields] = useState<TemplateField[]>(defaultFields);
  const [selectedField, setSelectedField] = useState<string>(defaultFields[0].id);
  const [previewData, setPreviewData] = useState<PreviewData>({
    studentName: "John Doe",
    courseName: "Web Development Masterclass",
    startDate: "10 Jan 2023",
    finishDate: "10 Apr 2023",
    certificateNumber: "CERT-2023-001",
  });
  const [previewSvg, setPreviewSvg] = useState<string>("");
  const [showEditor, setShowEditor] = useState<boolean>(true);

  // Load the initial SVG template
  useEffect(() => {
    fetch(certificateTemplateSvg)
      .then((response) => response.text())
      .then((svg) => {
        setTemplateSvg(svg);
        generatePreview(svg, fields, previewData);
      })
      .catch((error) => {
        console.error("Error loading certificate template:", error);
        toast({
          title: "Error",
          description: "Failed to load certificate template",
          variant: "destructive",
        });
      });
  }, []);

  // Generate a preview of the certificate
  const generatePreview = (
    svg: string,
    fieldsList: TemplateField[],
    data: PreviewData
  ) => {
    // Create a working copy of the SVG
    let modifiedSvg = svg;

    // Remove any existing text elements with our field IDs
    fieldsList.forEach((field) => {
      const regex = new RegExp(
        `<text[^>]*id="${field.id}"[^>]*>.*?<\/text>`,
        "g"
      );
      modifiedSvg = modifiedSvg.replace(regex, "");
    });

    // Add our text elements with updated positions
    fieldsList.forEach((field) => {
      let fieldValue = "";
      switch (field.id) {
        case "studentName":
          fieldValue = data.studentName;
          break;
        case "courseName":
          fieldValue = data.courseName;
          break;
        case "startDate":
          fieldValue = data.startDate;
          break;
        case "finishDate":
          fieldValue = data.finishDate;
          break;
        case "certificateNumber":
          fieldValue = data.certificateNumber;
          break;
      }

      const fontWeight = field.bold ? "font-weight='bold'" : "";
      const fontStyle = field.italic ? "font-style='italic'" : "";

      const textElement = `<text id="${field.id}" x="${field.x}" y="${
        field.y
      }" font-family="${field.fontFamily}" font-size="${
        field.fontSize
      }" text-anchor="middle" fill="#333" ${fontWeight} ${fontStyle}>${fieldValue}</text>`;

      // Insert the text element before the closing SVG tag
      modifiedSvg = modifiedSvg.replace("</svg>", textElement + "</svg>");
    });

    setPreviewSvg(modifiedSvg);
  };

  // Find the selected field in our list
  const getSelectedField = () => {
    return fields.find((field) => field.id === selectedField);
  };

  // Update a field property
  const updateField = (property: string, value: any) => {
    const updatedFields = fields.map((field) => {
      if (field.id === selectedField) {
        return { ...field, [property]: value };
      }
      return field;
    });
    setFields(updatedFields);
    generatePreview(templateSvg, updatedFields, previewData);
  };

  // Update preview data
  const updatePreviewData = (field: string, value: string) => {
    const updatedData = { ...previewData, [field]: value };
    setPreviewData(updatedData);
    generatePreview(templateSvg, fields, updatedData);
  };

  // Save the template
  const saveTemplate = async () => {
    try {
      // Generate the final SVG
      let finalSvg = templateSvg;

      // Remove any existing text elements with our field IDs
      fields.forEach((field) => {
        const regex = new RegExp(
          `<text[^>]*id="${field.id}"[^>]*>.*?<\/text>`,
          "g"
        );
        finalSvg = finalSvg.replace(regex, "");
      });

      // Add placeholders for our dynamic fields
      fields.forEach((field) => {
        const fontWeight = field.bold ? "font-weight='bold'" : "";
        const fontStyle = field.italic ? "font-style='italic'" : "";

        let placeholder = "";
        switch (field.id) {
          case "studentName":
            placeholder = "{{studentName}}";
            break;
          case "courseName":
            placeholder = "{{courseName}}";
            break;
          case "startDate":
            placeholder = "{{startDate}}";
            break;
          case "finishDate":
            placeholder = "{{finishDate}}";
            break;
          case "certificateNumber":
            placeholder = "{{certificateNumber}}";
            break;
        }

        const textElement = `<text id="${field.id}" x="${field.x}" y="${
          field.y
        }" font-family="${field.fontFamily}" font-size="${
          field.fontSize
        }" text-anchor="middle" fill="#333" ${fontWeight} ${fontStyle}>${placeholder}</text>`;

        finalSvg = finalSvg.replace("</svg>", textElement + "</svg>");
      });

      // In a real application, you would save this to the server
      // For now, we'll just download it
      const blob = new Blob([finalSvg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "certificate-template.svg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Certificate template saved successfully",
      });
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save certificate template",
        variant: "destructive",
      });
    }
  };

  // Upload a custom SVG template
  const uploadTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const svg = e.target?.result as string;
      setTemplateSvg(svg);
      generatePreview(svg, fields, previewData);
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Certificate Template Editor</h1>

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
                  {showEditor ? (
                    <Eye className="h-4 w-4 mr-2" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  {showEditor ? "Show Preview" : "Show Editor"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showEditor ? (
                <div>
                  <div className="flex justify-between mb-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ".svg";
                        input.onchange = (e) =>
                          uploadTemplate(
                            e as unknown as React.ChangeEvent<HTMLInputElement>
                          );
                        input.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Template
                    </Button>
                    <Button onClick={saveTemplate}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Template
                    </Button>
                  </div>

                  <Tabs
                    defaultValue={selectedField}
                    onValueChange={setSelectedField}
                  >
                    <TabsList className="w-full">
                      {fields.map((field) => (
                        <TabsTrigger key={field.id} value={field.id}>
                          {field.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {fields.map((field) => (
                      <TabsContent key={field.id} value={field.id}>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="x-position">X Position</Label>
                            <div className="flex items-center gap-2">
                              <Slider
                                id="x-position"
                                min={0}
                                max={1056}
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
                            <Label htmlFor="y-position">Y Position</Label>
                            <div className="flex items-center gap-2">
                              <Slider
                                id="y-position"
                                min={0}
                                max={816}
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

                          <div>
                            <Label htmlFor="font-size">Font Size</Label>
                            <div className="flex items-center gap-2">
                              <Slider
                                id="font-size"
                                min={8}
                                max={72}
                                step={1}
                                value={[field.fontSize]}
                                onValueChange={(values) =>
                                  updateField("fontSize", values[0])
                                }
                              />
                              <Input
                                className="w-20"
                                value={field.fontSize}
                                onChange={(e) =>
                                  updateField(
                                    "fontSize",
                                    parseInt(e.target.value) || 12
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
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
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Preview Data</h3>

                    <div>
                      <Label htmlFor="preview-student-name">Student Name</Label>
                      <Input
                        id="preview-student-name"
                        value={previewData.studentName}
                        onChange={(e) =>
                          updatePreviewData("studentName", e.target.value)
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="preview-start-date">Start Date</Label>
                        <Input
                          id="preview-start-date"
                          value={previewData.startDate}
                          onChange={(e) =>
                            updatePreviewData("startDate", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="preview-finish-date">Finish Date</Label>
                        <Input
                          id="preview-finish-date"
                          value={previewData.finishDate}
                          onChange={(e) =>
                            updatePreviewData("finishDate", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="preview-certificate-number">
                        Certificate Number
                      </Label>
                      <Input
                        id="preview-certificate-number"
                        value={previewData.certificateNumber}
                        onChange={(e) =>
                          updatePreviewData("certificateNumber", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div
                    className="w-full border rounded p-4 overflow-auto max-h-[800px]"
                    dangerouslySetInnerHTML={{ __html: previewSvg }}
                  />
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      const blob = new Blob([previewSvg], {
                        type: "image/svg+xml",
                      });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = "certificate-preview.svg";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Preview
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
              <CardTitle>Certificate Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="w-full border rounded p-4 overflow-auto max-h-[800px]"
                dangerouslySetInnerHTML={{ __html: previewSvg }}
              />
              
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  const blob = new Blob([previewSvg], {
                    type: "image/svg+xml",
                  });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "certificate-preview.svg";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Preview
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}