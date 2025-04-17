import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, FileText, Download, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  ReportType,
  downloadMockReport,
  generateCoursePerformanceReport,
  generateTrainerPerformanceReport,
  generateStudentPerformanceReport,
  generateFinancialSummaryReport,
  generateLeadConversionReport,
  generateCampaignPerformanceReport
} from "@/lib/report-utils";

interface PerformanceReportDialogProps {
  triggerButton?: React.ReactNode;
  defaultReportType?: ReportType;
  entityId?: number;
  entityType?: 'student' | 'trainer' | 'course' | 'campaign';
}

export default function PerformanceReportDialog({
  triggerButton,
  defaultReportType = 'financial-summary',
  entityId,
  entityType
}: PerformanceReportDialogProps) {
  const { toast } = useToast();
  
  // State for report parameters
  const [reportType, setReportType] = useState<ReportType>(
    entityType ? 
      entityType === 'student' ? 'student-performance' :
      entityType === 'trainer' ? 'trainer-performance' :
      entityType === 'course' ? 'course-performance' :
      entityType === 'campaign' ? 'campaign-performance' :
      defaultReportType
    : defaultReportType
  );
  
  const [from, setFrom] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default to 30 days ago
    return date;
  });
  
  const [to, setTo] = useState<Date>(new Date());
  const [selectedEntity, setSelectedEntity] = useState<number | undefined>(entityId);
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Lists for select dropdowns
  const [students, setStudents] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  
  // Load data when dialog opens
  const loadEntityData = async () => {
    try {
      if (reportType === 'student-performance' && students.length === 0) {
        const res = await fetch('/api/students');
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        }
      } else if (reportType === 'trainer-performance' && trainers.length === 0) {
        const res = await fetch('/api/trainers');
        if (res.ok) {
          const data = await res.json();
          setTrainers(data);
        }
      } else if (reportType === 'course-performance' && courses.length === 0) {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } else if (reportType === 'campaign-performance' && campaigns.length === 0) {
        const res = await fetch('/api/crm/campaigns');
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data);
        }
      }
    } catch (error) {
      console.error('Error loading entity data:', error);
    }
  };
  
  // Generate report
  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      const dateRange = { from, to };

      switch (reportType) {
        case 'student-performance':
          if (selectedEntity) {
            await generateStudentPerformanceReport(selectedEntity, dateRange);
          } else {
            toast({
              title: "Missing Information",
              description: "Please select a student to generate the report.",
              variant: "destructive"
            });
            setGenerating(false);
            return;
          }
          break;
        
        case 'trainer-performance':
          if (selectedEntity) {
            await generateTrainerPerformanceReport(selectedEntity, dateRange);
          } else {
            toast({
              title: "Missing Information",
              description: "Please select a trainer to generate the report.",
              variant: "destructive"
            });
            setGenerating(false);
            return;
          }
          break;
        
        case 'course-performance':
          if (selectedEntity) {
            await generateCoursePerformanceReport(selectedEntity, dateRange);
          } else {
            toast({
              title: "Missing Information",
              description: "Please select a course to generate the report.",
              variant: "destructive"
            });
            setGenerating(false);
            return;
          }
          break;
        
        case 'campaign-performance':
          if (selectedEntity) {
            await generateCampaignPerformanceReport(selectedEntity, dateRange);
          } else {
            toast({
              title: "Missing Information",
              description: "Please select a campaign to generate the report.",
              variant: "destructive"
            });
            setGenerating(false);
            return;
          }
          break;
        
        case 'financial-summary':
          await generateFinancialSummaryReport(dateRange);
          break;
        
        case 'lead-conversion':
          await generateLeadConversionReport(dateRange);
          break;
        
        default:
          // Use demo reports if actual API endpoints aren't available yet
          downloadMockReport(reportType);
          break;
      }
      
      toast({
        title: "Report Generated",
        description: "Your report has been successfully generated and downloaded.",
      });
      
      setDialogOpen(false);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error Generating Report",
        description: "There was an error generating your report. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setDialogOpen(true);
              loadEntityData();
            }}
          >
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Performance Report</DialogTitle>
          <DialogDescription>
            Create customized reports to analyze performance metrics across various aspects of the institute.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="report-type" className="text-right">
              Report Type
            </Label>
            <Select
              value={reportType}
              onValueChange={(value) => {
                setReportType(value as ReportType);
                setSelectedEntity(undefined);
                loadEntityData();
              }}
            >
              <SelectTrigger id="report-type" className="col-span-3">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student-performance">Student Performance</SelectItem>
                <SelectItem value="trainer-performance">Trainer Performance</SelectItem>
                <SelectItem value="course-performance">Course Performance</SelectItem>
                <SelectItem value="financial-summary">Financial Summary</SelectItem>
                <SelectItem value="lead-conversion">Lead Conversion</SelectItem>
                <SelectItem value="campaign-performance">Campaign Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Entity selection for reports that need it */}
          {(reportType === 'student-performance' ||
            reportType === 'trainer-performance' ||
            reportType === 'course-performance' ||
            reportType === 'campaign-performance') && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="entity" className="text-right">
                {reportType === 'student-performance' ? 'Student' :
                 reportType === 'trainer-performance' ? 'Trainer' :
                 reportType === 'course-performance' ? 'Course' :
                 'Campaign'}
              </Label>
              <Select
                value={selectedEntity?.toString()}
                onValueChange={(value) => setSelectedEntity(parseInt(value))}
              >
                <SelectTrigger id="entity" className="col-span-3">
                  <SelectValue placeholder={`Select ${
                    reportType === 'student-performance' ? 'student' :
                    reportType === 'trainer-performance' ? 'trainer' :
                    reportType === 'course-performance' ? 'course' :
                    'campaign'
                  }`} />
                </SelectTrigger>
                <SelectContent>
                  {reportType === 'student-performance' && students.map(student => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.fullName} ({student.studentId})
                    </SelectItem>
                  ))}
                  {reportType === 'trainer-performance' && trainers.map(trainer => (
                    <SelectItem key={trainer.id} value={trainer.id.toString()}>
                      {trainer.fullName}
                    </SelectItem>
                  ))}
                  {reportType === 'course-performance' && courses.map(course => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name}
                    </SelectItem>
                  ))}
                  {reportType === 'campaign-performance' && campaigns.map(campaign => (
                    <SelectItem key={campaign.id} value={campaign.id.toString()}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Date range selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date-from" className="text-right">
              Date From
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-from"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {from ? format(from, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={from}
                    onSelect={(date) => date && setFrom(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date-to" className="text-right">
              Date To
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-to"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {to ? format(to, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={to}
                    onSelect={(date) => date && setTo(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleGenerateReport}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}