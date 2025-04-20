import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  HomeIcon,
  UserPlus,
  Users,
  FileText,
  BookOpen,
  UserCog,
  Calendar,
  Award,
  FileCheck,
  FileSpreadsheet,
  Settings,
  LogOut,
  BarChart,
  Building,
  PhoneCall,
  Mail,
  MessagesSquare as MessageSquare,
  MessageCircle,
  MessagesSquare,
  UserCircle,
  DollarSign,
  Plane,
  CreditCard,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  className?: string;
}

function Sidebar({ className }: SidebarNavProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [activeSection, setActiveSection] = useState("main");
  
  // Set section based on the current location
  useEffect(() => {
    if (location?.startsWith("/crm") || location?.startsWith("/settings/crm")) {
      setActiveSection("crm");
    } else if (location?.startsWith("/hrm") || location?.startsWith("/visa-management") || location?.startsWith("/settings/hrm")) {
      setActiveSection("hrm");
    } else {
      setActiveSection("main");
    }
  }, [location]);

  if (!user) return null;

  const navItems = [
    // Dashboard & Administration
    {
      title: "Dashboard",
      href: "/",
      icon: <HomeIcon className="h-5 w-5" />,
      roles: ["admin", "superadmin", "counselor"],
      section: "main"
    },
    
    // Student Management
    {
      title: "Students",
      href: "/students",
      icon: <Users className="h-5 w-5" />,
      roles: ["admin", "superadmin", "counselor"],
      section: "main"
    },
    {
      title: "Register Student",
      href: "/students/register",
      icon: <UserPlus className="h-5 w-5" />,
      roles: ["admin", "superadmin", "counselor"],
      section: "main"
    },
    
    // Financial Management
    {
      title: "Invoices",
      href: "/invoices",
      icon: <FileText className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "main"
    },
    
    // Course & Trainer Management
    {
      title: "Course Management",
      href: "/course-management",
      icon: <BookOpen className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "main"
    },
    {
      title: "Trainers",
      href: "/trainers",
      icon: <UserCog className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "main"
    },
    {
      title: "Schedule",
      href: "/schedule",
      icon: <Calendar className="h-5 w-5" />,
      roles: ["admin", "superadmin", "counselor"],
      section: "main"
    },
    
    // Document Management
    {
      title: "Certificates",
      href: "/certificates",
      icon: <Award className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "main"
    },
    {
      title: "Certificate Templates",
      href: "/certificate-templates",
      icon: <Award className="h-5 w-5" />,
      roles: ["superadmin"],
      section: "main"
    },
    
    // Administration & Reports
    {
      title: "Reports",
      href: "/reports",
      icon: <BarChart className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "main"
    },
    {
      title: "Facilities",
      href: "/facilities",
      icon: <Building className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "main"
    },
    
    // HR Management Section
    {
      title: "HR Dashboard",
      href: "/hrm",
      icon: <UserCircle className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "hrm"
    },
    {
      title: "Employees",
      href: "/hrm/employees",
      icon: <Users className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "hrm"
    },
    {
      title: "Attendance",
      href: "/hrm/attendance",
      icon: <Clock className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "hrm"
    },
    {
      title: "Payroll",
      href: "/hrm/payroll",
      icon: <DollarSign className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "hrm"
    },
    {
      title: "Visa Management",
      href: "/visa-management",
      icon: <Plane className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "hrm"
    },
    
    // Business Development
    {
      title: "Quotations",
      href: "/quotations",
      icon: <FileCheck className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "main"
    },
    {
      title: "Proposals",
      href: "/proposals",
      icon: <FileSpreadsheet className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "main"
    },
    {
      title: "Proposal Templates",
      href: "/proposal-templates",
      icon: <FileSpreadsheet className="h-5 w-5" />,
      roles: ["superadmin"],
      section: "main"
    },
    
    // CRM Section
    {
      title: "CRM Dashboard",
      href: "/crm/dashboard",
      icon: <BarChart className="h-5 w-5" />,
      roles: ["admin", "superadmin", "counselor"],
      section: "crm"
    },
    {
      title: "Leads Management",
      href: "/crm/leads",
      icon: <Users className="h-5 w-5" />,
      roles: ["admin", "superadmin", "counselor"],
      section: "crm"
    },
    {
      title: "Marketing Campaigns",
      href: "/crm/campaigns",
      icon: <FileText className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "crm"
    },
    {
      title: "Follow-ups",
      href: "/crm/follow-ups",
      icon: <Calendar className="h-5 w-5" />,
      roles: ["admin", "superadmin", "counselor"],
      section: "crm"
    },
    {
      title: "Emails",
      href: "/crm/emails",
      icon: <Mail className="h-5 w-5" />,
      roles: ["admin", "superadmin", "counselor"],
      section: "crm"
    },
    {
      title: "Meetings",
      href: "/crm/meetings",
      icon: <MessageSquare className="h-5 w-5" />,
      roles: ["admin", "superadmin", "counselor"],
      section: "crm"
    },
    {
      title: "Corporate Leads",
      href: "/crm/corporate-leads",
      icon: <FileText className="h-5 w-5" />,
      roles: ["admin", "superadmin", "counselor"],
      section: "crm"
    },
    {
      title: "Posts",
      href: "/crm/posts",
      icon: <FileText className="h-5 w-5" />,
      roles: ["admin", "superadmin", "counselor"],
      section: "crm"
    },
    {
      title: "Expenses",
      href: "/crm/expenses",
      icon: <DollarSign className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "crm"
    },
    {
      title: "Payment Links",
      href: "/crm/payment-link-generator",
      icon: <CreditCard className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "crm"
    },
    
    // External Integrations
    {
      title: "WhatsApp Settings",
      href: "/whatsapp-settings",
      icon: <MessageCircle className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "main"
    },
    {
      title: "WhatsApp Chats",
      href: "/whatsapp-chats",
      icon: <MessageSquare className="h-5 w-5" />,
      roles: ["admin", "superadmin", "counselor"],
      section: "main"
    },
    {
      title: "Email Settings",
      href: "/email-settings",
      icon: <Mail className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "main"
    },
    
    // Settings
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "main"
    },
    {
      title: "CRM Settings",
      href: "/settings/crm",
      icon: <Settings className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "crm"
    },
    {
      title: "Payment Gateways",
      href: "/settings/crm/payment-gateway",
      icon: <CreditCard className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "crm"
    },
    {
      title: "HRM Settings",
      href: "/settings/hrm",
      icon: <Settings className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "hrm"
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  // Group nav items by section
  const mainNavItems = filteredNavItems.filter(item => item.section === 'main');
  const crmNavItems = filteredNavItems.filter(item => item.section === 'crm');
  const hrmNavItems = filteredNavItems.filter(item => item.section === 'hrm');
  
  // Check if user has access to CRM and HRM sections
  const hasCrmAccess = crmNavItems.length > 0;
  const hasHrmAccess = hrmNavItems.length > 0;

  return (
    <div className={cn("pb-12 h-full flex flex-col", className)}>
      <div className="space-y-4 py-4 flex-1">
        <div className="px-3 py-2">
          <div className="mb-6 px-4">
            <Link href="/">
              <h2 className="text-2xl font-bold tracking-tight">Orbit Institute</h2>
            </Link>
            <div className="text-sm text-gray-500 mt-1">UAE</div>
          </div>
          
          {/* Section tabs */}
          {(hasCrmAccess || hasHrmAccess) && (
            <div className="mb-4 px-4">
              <div className="flex space-x-2 border-b">
                <Button 
                  variant="link" 
                  className={cn(
                    "px-2 py-1 h-auto rounded-none font-medium",
                    activeSection === "main" 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-muted-foreground"
                  )}
                  onClick={() => setActiveSection("main")}
                >
                  Institute
                </Button>
                {hasCrmAccess && (
                  <Button 
                    variant="link" 
                    className={cn(
                      "px-2 py-1 h-auto rounded-none font-medium",
                      activeSection === "crm" 
                        ? "text-primary border-b-2 border-primary" 
                        : "text-muted-foreground"
                    )}
                    onClick={() => setActiveSection("crm")}
                  >
                    CRM
                  </Button>
                )}
                {hasHrmAccess && (
                  <Button 
                    variant="link" 
                    className={cn(
                      "px-2 py-1 h-auto rounded-none font-medium",
                      activeSection === "hrm" 
                        ? "text-primary border-b-2 border-primary" 
                        : "text-muted-foreground"
                    )}
                    onClick={() => setActiveSection("hrm")}
                  >
                    HRM
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {activeSection === "main" ? (
                mainNavItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={location === item.href ? "secondary" : "ghost"}
                      className={cn("w-full justify-start", {
                        "bg-primary/10": location === item.href,
                      })}
                    >
                      {item.icon}
                      <span className="ml-2">{item.title}</span>
                    </Button>
                  </Link>
                ))
              ) : activeSection === "crm" ? (
                crmNavItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={location === item.href ? "secondary" : "ghost"}
                      className={cn("w-full justify-start", {
                        "bg-primary/10": location === item.href,
                      })}
                    >
                      {item.icon}
                      <span className="ml-2">{item.title}</span>
                    </Button>
                  </Link>
                ))
              ) : (
                hrmNavItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={location === item.href ? "secondary" : "ghost"}
                      className={cn("w-full justify-start", {
                        "bg-primary/10": location === item.href,
                      })}
                    >
                      {item.icon}
                      <span className="ml-2">{item.title}</span>
                    </Button>
                  </Link>
                ))
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
      <div className="px-3 py-2 border-t">
        <div className="flex items-center mb-2 px-4">
          <div className="ml-2">
            <p className="text-sm font-medium">{user.fullName}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        </div>
        <div className="space-y-1">
          <Link href={`/profile/${user.id}`}>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <UserCircle className="h-5 w-5 mr-2" />
              View Profile
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

export { Sidebar };
export default Sidebar;