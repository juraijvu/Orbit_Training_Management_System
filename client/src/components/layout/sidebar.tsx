import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  className?: string;
}

function Sidebar({ className }: SidebarNavProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: <HomeIcon className="h-5 w-5" />,
      roles: ["admin", "superadmin", "counselor"],
    },
    {
      title: "Student Registration",
      href: "/student-registration",
      icon: <UserPlus className="h-5 w-5" />,
      roles: ["admin", "superadmin", "counselor"],
    },
    {
      title: "Student List",
      href: "/student-list",
      icon: <Users className="h-5 w-5" />,
      roles: ["admin", "superadmin", "counselor"],
    },
    {
      title: "Invoices",
      href: "/invoices",
      icon: <FileText className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
    },
    {
      title: "Course Management",
      href: "/course-management",
      icon: <BookOpen className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
    },
    {
      title: "Trainers",
      href: "/trainers",
      icon: <UserCog className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
    },
    {
      title: "Schedule",
      href: "/schedule",
      icon: <Calendar className="h-5 w-5" />,
      roles: ["admin", "superadmin", "counselor"],
    },
    {
      title: "Certificates",
      href: "/certificates",
      icon: <Award className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
    },
    {
      title: "Certificate Templates",
      href: "/certificate-templates",
      icon: <Award className="h-5 w-5" />,
      roles: ["superadmin"],
    },
    {
      title: "Quotations",
      href: "/quotations",
      icon: <FileCheck className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
    },
    {
      title: "Proposals",
      href: "/proposals",
      icon: <FileSpreadsheet className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
    },
    {
      title: "Proposal Templates",
      href: "/proposal-templates",
      icon: <FileSpreadsheet className="h-5 w-5" />,
      roles: ["superadmin"],
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      roles: ["admin", "superadmin"],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <div className={cn("pb-12 h-full flex flex-col", className)}>
      <div className="space-y-4 py-4 flex-1">
        <div className="px-3 py-2">
          <div className="mb-8 px-4">
            <Link href="/">
              <h2 className="text-2xl font-bold tracking-tight">Orbit Institute</h2>
            </Link>
            <div className="text-sm text-gray-500 mt-1">UAE</div>
          </div>
          <div className="space-y-1">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {filteredNavItems.map((item) => (
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
              ))}
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
  );
}

export { Sidebar };
export default Sidebar;