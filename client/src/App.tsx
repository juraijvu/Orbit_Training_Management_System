import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import StudentRegistration from "@/pages/student-registration";
import StudentList from "@/pages/student-list";
import Invoices from "@/pages/invoices";
import CourseManagement from "@/pages/course-management";
import Trainers from "@/pages/trainers";
import Schedule from "@/pages/schedule";
import Certificates from "@/pages/certificates";
import CertificateTemplates from "@/pages/certificate-templates";
import Quotations from "@/pages/quotations";
import Proposals from "@/pages/proposals";
import ProposalTemplates from "@/pages/proposal-templates";
import Settings from "@/pages/settings";
import WhatsappSettings from "@/pages/whatsapp-settings";
import WhatsappChats from "@/pages/whatsapp-chats";
import EmailSettings from "@/pages/email-settings";
import ChatbotFlows from "@/pages/chatbot-flows";
import CannedResponses from "@/pages/canned-responses";
import { MainLayout } from "@/components/layout/main-layout";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/" component={Dashboard} />
        <ProtectedRoute path="/student-registration" component={StudentRegistration} />
        <ProtectedRoute path="/student-list" component={StudentList} />
        <ProtectedRoute path="/invoices" component={Invoices} />
        <ProtectedRoute path="/course-management" component={CourseManagement} />
        <ProtectedRoute path="/trainers" component={Trainers} />
        <ProtectedRoute path="/schedule" component={Schedule} />
        <ProtectedRoute path="/certificates" component={Certificates} />
        <ProtectedRoute path="/certificate-templates" component={CertificateTemplates} />
        <ProtectedRoute path="/quotations" component={Quotations} />
        <ProtectedRoute path="/proposals" component={Proposals} />
        <ProtectedRoute path="/proposals/:id" component={() => {
          const ProposalDetailPage = React.lazy(() => import("@/pages/proposals/[id]"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <ProposalDetailPage />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/proposal-templates" component={ProposalTemplates} />
        <ProtectedRoute path="/settings" component={Settings} />
        <ProtectedRoute path="/settings/crm" component={() => {
          const CRMSettingsPage = React.lazy(() => import("@/pages/settings/crm"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <CRMSettingsPage />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/settings/crm/payment-gateway" component={() => {
          const PaymentGatewaySettingsPage = React.lazy(() => import("@/pages/settings/crm/payment-gateway"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <PaymentGatewaySettingsPage />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/settings/hrm" component={() => {
          const HRMSettingsPage = React.lazy(() => import("@/pages/settings/hrm"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <HRMSettingsPage />
            </React.Suspense>
          );
        }} />
        {/* External Integrations */}
        <ProtectedRoute path="/whatsapp-settings" component={WhatsappSettings} />
        <ProtectedRoute path="/whatsapp-chats" component={WhatsappChats} />
        <ProtectedRoute path="/chatbot-flows" component={ChatbotFlows} />
        <ProtectedRoute path="/canned-responses" component={CannedResponses} />
        <ProtectedRoute path="/email-settings" component={EmailSettings} />
        {/* CRM Routes */}
        <ProtectedRoute path="/crm/dashboard" component={() => {
          const CrmDashboardPage = React.lazy(() => import("@/pages/crm/dashboard"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <CrmDashboardPage />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/crm/leads" component={() => {
          const LeadsPage = React.lazy(() => import("@/pages/crm/leads"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <LeadsPage />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/crm/campaigns" component={() => {
          const CampaignsPage = React.lazy(() => import("@/pages/crm/campaigns"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <CampaignsPage />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/crm/follow-ups" component={() => {
          const FollowUpsPage = React.lazy(() => import("@/pages/crm/follow-ups"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <FollowUpsPage />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/crm/meetings" component={() => {
          const MeetingsPage = React.lazy(() => import("@/pages/crm/meetings"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <MeetingsPage />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/crm/corporate-leads" component={() => {
          const CorporateLeadsPage = React.lazy(() => import("@/pages/crm/corporate-leads"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <CorporateLeadsPage />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/crm/posts" component={() => {
          const CrmPostsPage = React.lazy(() => import("@/pages/crm/posts"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <CrmPostsPage />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/crm/expenses" component={() => {
          const ExpensesPage = React.lazy(() => import("@/pages/crm/expenses"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <ExpensesPage />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/crm/expenses/new" component={() => {
          const NewExpensePage = React.lazy(() => import("@/pages/crm/expenses/new"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <NewExpensePage />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/crm/emails" component={() => {
          const EmailsPage = React.lazy(() => import("@/pages/crm/emails"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <EmailsPage />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/crm/payment-link-generator" component={() => {
          const PaymentLinkGeneratorPage = React.lazy(() => import("@/pages/crm/payment-link-generator"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <PaymentLinkGeneratorPage />
            </React.Suspense>
          );
        }} />

        {/* New Admin Features */}
        <ProtectedRoute path="/trainer-revenue" component={() => {
          const TrainerRevenuePage = React.lazy(() => import("@/pages/trainer-revenue"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <TrainerRevenuePage />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/expenses" component={() => {
          const ExpensesPage = React.lazy(() => import("@/pages/expenses"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <ExpensesPage />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/visa-management" component={() => {
          const VisaManagementPage = React.lazy(() => import("@/pages/visa-management"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <VisaManagementPage />
            </React.Suspense>
          );
        }} />

        {/* HRM Module Routes */}
        <ProtectedRoute path="/hrm" component={() => {
          const HRMDashboard = React.lazy(() => import("@/pages/hrm"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <HRMDashboard />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/hrm/employees" component={() => {
          const EmployeeManagement = React.lazy(() => import("@/pages/hrm/employees"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <EmployeeManagement />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/hrm/employees/new" component={() => {
          const EmployeeManagement = React.lazy(() => import("@/pages/hrm/employees"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <EmployeeManagement showAddDialog={true} />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/hrm/payroll" component={() => {
          const PayrollManagement = React.lazy(() => import("@/pages/hrm/payroll"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <PayrollManagement />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/hrm/payroll/new" component={() => {
          const PayrollManagement = React.lazy(() => import("@/pages/hrm/payroll"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <PayrollManagement showAddDialog={true} />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/hrm/staff" component={() => {
          const StaffManagement = React.lazy(() => import("@/pages/hrm/staff"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <StaffManagement />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/hrm/staff/new" component={() => {
          const StaffManagement = React.lazy(() => import("@/pages/hrm/staff"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <StaffManagement showAddDialog={true} />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/hrm/interviews" component={() => {
          const InterviewManagement = React.lazy(() => import("@/pages/hrm/interviews"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <InterviewManagement />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/hrm/interviews/new" component={() => {
          const InterviewManagement = React.lazy(() => import("@/pages/hrm/interviews"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <InterviewManagement showAddDialog={true} />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/hrm/reports" component={() => {
          const HRReports = React.lazy(() => import("@/pages/hrm/reports"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <HRReports />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/hrm/attendance" component={() => {
          const AttendanceManagement = React.lazy(() => import("@/pages/hrm/attendance"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <AttendanceManagement />
            </React.Suspense>
          );
        }} />
        <ProtectedRoute path="/hrm/attendance/new" component={() => {
          const RecordAttendance = React.lazy(() => import("@/pages/hrm/attendance/new"));
          return (
            <React.Suspense fallback={<div>Loading...</div>}>
              <RecordAttendance />
            </React.Suspense>
          );
        }} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
