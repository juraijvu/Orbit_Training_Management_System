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
        <ProtectedRoute path="/proposal-templates" component={ProposalTemplates} />
        <ProtectedRoute path="/settings" component={Settings} />
        {/* WhatsApp Integration */}
        <ProtectedRoute path="/whatsapp-settings" component={WhatsappSettings} />
        <ProtectedRoute path="/whatsapp-chats" component={WhatsappChats} />
        {/* CRM Routes */}
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
