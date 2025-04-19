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
  LogOut
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
    if (location?.startsWith("/crm")) {
      setActiveSection("crm");
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
      href: "/student-registration",
      icon: <UserPlus className="h-5 w-5" />,
      roles: ["admin", "superadmin", "counselor"],
      section: "main"
    },
    {
      title: "Student List",
      href: "/student-list",
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
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  // Group nav items by section
  const mainNavItems = filteredNavItems.filter(item => item.section === 'main');
  const crmNavItems = filteredNavItems.filter(item => item.section === 'crm');
  
  // Check if user has access to CRM section
  const hasCrmAccess = crmNavItems.length > 0;

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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-50">
        <div className="flex justify-between items-center">
          <Link href="/">
            <Button
              variant="ghost"
              className={cn("flex-1 flex flex-col items-center py-3 rounded-none", 
                location === "/" ? "text-primary" : "text-gray-500"
              )}
            >
              <HomeIcon className="h-6 w-6" />
              <span className="text-xs mt-1">Institute</span>
            </Button>
          </Link>

          {hasCrmAccess && (
            <Link href="/crm/dashboard">
              <Button
                variant="ghost"
                className={cn("flex-1 flex flex-col items-center py-3 rounded-none", 
                  location === "/crm/dashboard" ? "text-primary" : "text-gray-500"
                )}
              >
                <BarChart className="h-6 w-6" />
                <span className="text-xs mt-1">CRM</span>
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            className="flex-1 flex flex-col items-center py-3 rounded-none text-gray-500 relative"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
            <span className="text-xs mt-1">Menu</span>
          </Button>
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
            className="fixed bottom-16 left-0 right-0 bg-white border-t md:hidden z-40 shadow-lg"
          >
            <ScrollArea className="max-h-[60vh] overflow-y-auto">
              <div className="px-4 py-4">
                {hasCrmAccess && (
                  <div className="mb-4">
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
                    </div>
                  </div>
                )}
                
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
                          {item.icon}
                          <span className="ml-2">{item.title}</span>
                        </Button>
                      </Link>
                    ))
                  ) : (
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
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extra space at the bottom to prevent content from being hidden behind the mobile nav */}
      <div className="md:hidden h-16"></div>
    </>
  );
}

export default MobileNav;