import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  HomeIcon, 
  Users, 
  BarChart, 
  Menu, 
  X, 
  Calendar,
  FileText,
  Award,
  MessageCircle,
  BookOpen,
  UserCog,
  Settings,
  UserPlus,
  FileCheck,
  FileSpreadsheet,
  MessagesSquare as MessageSquare,
  Mail,
  LogOut,
  Briefcase, // For HRM
  Building,  // For HRM
  DollarSign, // For HRM/Payroll & Payment Gateway
  FileEdit, // For Interviews
  Plane, // For Visa Management
  Clock // For Attendance
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

export function MobileNav() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
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

  // Close menu when location changes
  useEffect(() => {
    setIsOpen(false);
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
      title: "Student Registration",
      href: "/students/register",
      icon: <UserPlus className="h-5 w-5" />,
      roles: ["admin", "superadmin", "counselor"],
      section: "main"
    },
    {
      title: "Student List",
      href: "/students",
      icon: <Users className="h-5 w-5" />,
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
      title: "Payment Link Generator",
      href: "/crm/payment-link-generator",
      icon: <FileText className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "crm"
    },
    
    // Reports & Analytics
    {
      title: "Reports",
      href: "/reports",
      icon: <FileText className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "main"
    },
    {
      title: "Analytics Dashboard",
      href: "/analytics-dashboard",
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
      title: "Payment Gateway",
      href: "/settings/crm/payment-gateway",
      icon: <DollarSign className="h-5 w-5" />,
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
    
    // HRM Section
    {
      title: "HR Dashboard",
      href: "/hrm",
      icon: <Building className="h-5 w-5" />,
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
      title: "Staff Management",
      href: "/hrm/staff",
      icon: <Briefcase className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
      section: "hrm"
    },
    {
      title: "Interviews",
      href: "/hrm/interviews",
      icon: <FileEdit className="h-5 w-5" />,
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
    {
      title: "Attendance",
      href: "/hrm/attendance",
      icon: <Clock className="h-5 w-5" />,
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
  
  // Check if user has access to sections
  const hasCrmAccess = crmNavItems.length > 0;
  const hasHrmAccess = hrmNavItems.length > 0;

  // Determine current page icon for the mobile menu
  const getCurrentIcon = () => {
    const currentItem = filteredNavItems.find(item => item.href === location);
    if (currentItem) {
      return currentItem.icon;
    }
    return <HomeIcon className="h-6 w-6" />;
  };

  const isDashboard = location === "/" || location === "/crm/dashboard";

  return (
    <>
      {/* Mobile Navigation Footer */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 md:hidden z-50 w-[90%] max-w-md">
        <div className="flex justify-between items-center bg-black rounded-full shadow-lg px-6 py-2 mx-auto w-full">
          <Link href="/">
            <Button
              variant="ghost"
              className={cn("flex flex-col items-center rounded-none px-1", 
                location === "/" ? "text-primary" : "text-white"
              )}
            >
              <HomeIcon className="h-[20px] w-[20px]" />
              <span className="text-[10px] mt-[0px]">Home</span>
            </Button>
          </Link>

          {hasCrmAccess && (
            <Link href="/crm/dashboard">
              <Button
                variant="ghost"
                className={cn("flex flex-col items-center rounded-none px-1", 
                  (location?.startsWith("/crm") || location?.startsWith("/settings/crm")) ? "text-primary" : "text-white"
                )}
              >
                <BarChart className="h-[20px] w-[20px]" />
                <span className="text-[10px] mt-[0px]">CRM</span>
              </Button>
            </Link>
          )}
          
          <Button
            variant="ghost"
            className={cn("flex flex-col items-center justify-center relative",
              isOpen ? "text-white bg-primary rounded-full h-16 w-16 -mt-10 shadow-lg" : "text-white bg-primary rounded-full h-16 w-16 -mt-10 shadow-lg"
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="h-8 w-8" />
            ) : (
              <Menu className="h-8 w-8" />
            )}
          </Button>
          
          {hasHrmAccess && (
            <Link href="/hrm">
              <Button
                variant="ghost"
                className={cn("flex flex-col items-center rounded-none px-1", 
                  (location?.startsWith("/hrm") || location === "/visa-management" || location?.startsWith("/settings/hrm")) ? "text-primary" : "text-white"
                )}
              >
                <Building className="h-[20px] w-[20px]" />
                <span className="text-[10px] mt-[0px]">HRM</span>
              </Button>
            </Link>
          )}
          
          <Link href={`/profile/${user.id}`}>
            <Button
              variant="ghost"
              className={cn("flex flex-col items-center rounded-none px-1", 
                location?.startsWith("/profile") ? "text-primary" : "text-white"
              )}
            >
              <Users className="h-[20px] w-[20px]" />
              <span className="text-[10px] mt-[0px]">Profile</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Roll-up menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed bottom-24 left-4 right-4 bg-background md:hidden z-40 shadow-lg border rounded-lg"
          >
            <ScrollArea className="max-h-[60vh] overflow-y-auto">
              <div className="px-4 py-4">
                <div className="mb-4">
                  <div className="flex space-x-2 border-b overflow-x-auto pb-1">
                    <Button 
                      variant="link" 
                      className={cn(
                        "px-2 py-1 h-auto rounded-none font-medium whitespace-nowrap",
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
                          "px-2 py-1 h-auto rounded-none font-medium whitespace-nowrap",
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
                          "px-2 py-1 h-auto rounded-none font-medium whitespace-nowrap",
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
                
                <div className="space-y-2">
                  {activeSection === "main" ? (
                    mainNavItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={location === item.href ? "secondary" : "ghost"}
                          className={cn("w-full justify-start", {
                            "bg-primary/10": location === item.href,
                          })}
                        >
                          <div className="h-[20px] w-[20px] flex items-center justify-center">
                            {React.cloneElement(item.icon as React.ReactElement, { className: "h-[20px] w-[20px]" })}
                          </div>
                          <span className="ml-[1px]">{item.title}</span>
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
                          <div className="h-[20px] w-[20px] flex items-center justify-center">
                            {React.cloneElement(item.icon as React.ReactElement, { className: "h-[20px] w-[20px]" })}
                          </div>
                          <span className="ml-[1px]">{item.title}</span>
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
                          <div className="h-[20px] w-[20px] flex items-center justify-center">
                            {React.cloneElement(item.icon as React.ReactElement, { className: "h-[20px] w-[20px]" })}
                          </div>
                          <span className="ml-[1px]">{item.title}</span>
                        </Button>
                      </Link>
                    ))
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center mb-2">
                    <div>
                      <p className="text-sm font-medium">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => logoutMutation.mutate()}
                  >
                    <div className="h-[20px] w-[20px] flex items-center justify-center">
                      <LogOut className="h-[20px] w-[20px]" />
                    </div>
                    <span className="ml-[1px]">Logout</span>
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extra space at the bottom to prevent content from being hidden behind the mobile nav */}
      <div className="md:hidden h-24"></div>
    </>
  );
}

export default MobileNav;