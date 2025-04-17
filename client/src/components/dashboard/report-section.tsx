import { ReportType } from "@/lib/report-utils";
import PerformanceReportDialog from "@/components/reports/performance-report-dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarRange, FileText, BarChart, Users, School, TrendingUp, LineChart, Megaphone } from "lucide-react";

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  reportType: ReportType;
  entityType?: 'student' | 'trainer' | 'course' | 'campaign'; 
  entityId?: number;
}

const ReportCard = ({ title, description, icon, reportType, entityType, entityId }: ReportCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md">{title}</CardTitle>
          <div className="p-1 bg-primary/10 rounded-full text-primary">{icon}</div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-24 flex items-center justify-center">
          <div className="w-full bg-muted p-4 rounded-lg text-center text-sm text-muted-foreground">
            Quickly generate performance analytics and insights
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <PerformanceReportDialog 
          defaultReportType={reportType}
          entityType={entityType}
          entityId={entityId}
          triggerButton={
            <Button className="w-full gap-2">
              <FileText className="h-4 w-4" />
              Generate Report
            </Button>
          }
        />
      </CardFooter>
    </Card>
  );
};

export const DashboardReportSection = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Reports</h2>
        <PerformanceReportDialog />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ReportCard
          title="Financial Summary"
          description="Financial performance overview with revenue and cost metrics."
          icon={<BarChart className="h-5 w-5" />}
          reportType="financial-summary"
        />
        
        <ReportCard
          title="Student Performance"
          description="Detailed metrics on student attendance, assessments, and outcomes."
          icon={<Users className="h-5 w-5" />}
          reportType="student-performance"
          entityType="student"
        />
        
        <ReportCard
          title="Course Performance"
          description="Enrollment, completion, and success metrics by course."
          icon={<School className="h-5 w-5" />}
          reportType="course-performance"
          entityType="course"
        />
        
        <ReportCard
          title="Lead Conversion"
          description="Lead generation and conversion rates analysis."
          icon={<TrendingUp className="h-5 w-5" />}
          reportType="lead-conversion"
        />
        
        <ReportCard
          title="Trainer Performance"
          description="Detailed metrics on trainer effectiveness and student feedback."
          icon={<LineChart className="h-5 w-5" />}
          reportType="trainer-performance"
          entityType="trainer"
        />
        
        <ReportCard
          title="Campaign Performance"
          description="Marketing campaign metrics, leads, and conversion analysis."
          icon={<Megaphone className="h-5 w-5" />}
          reportType="campaign-performance"
          entityType="campaign"
        />
      </div>
    </div>
  );
};

export const CrmReportSection = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">CRM Reports</h2>
        <PerformanceReportDialog defaultReportType="lead-conversion" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReportCard
          title="Lead Conversion"
          description="Lead generation and conversion rates analysis."
          icon={<TrendingUp className="h-5 w-5" />}
          reportType="lead-conversion"
        />
        
        <ReportCard
          title="Campaign Performance"
          description="Marketing campaign metrics, leads, and conversion analysis."
          icon={<Megaphone className="h-5 w-5" />}
          reportType="campaign-performance"
          entityType="campaign"
        />
      </div>
    </div>
  );
};

export default DashboardReportSection;