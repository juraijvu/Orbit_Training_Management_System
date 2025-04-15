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
import Quotations from "@/pages/quotations";
import Proposals from "@/pages/proposals";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/student-registration" component={StudentRegistration} />
      <ProtectedRoute path="/student-list" component={StudentList} />
      <ProtectedRoute path="/invoices" component={Invoices} />
      <ProtectedRoute path="/course-management" component={CourseManagement} />
      <ProtectedRoute path="/trainers" component={Trainers} />
      <ProtectedRoute path="/schedule" component={Schedule} />
      <ProtectedRoute path="/certificates" component={Certificates} />
      <ProtectedRoute path="/quotations" component={Quotations} />
      <ProtectedRoute path="/proposals" component={Proposals} />
      <Route component={NotFound} />
    </Switch>
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
