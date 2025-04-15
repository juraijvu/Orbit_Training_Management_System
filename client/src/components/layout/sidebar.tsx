import { FC } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  BarChart2,
  UserPlus,
  Users,
  File,
  Book,
  BookOpen,
  Calendar,
  FilePen,
  FileSignature,
  Award,
  Settings
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const Sidebar: FC<SidebarProps> = ({ className }) => {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;

  const menuItems = [
    {
      title: 'ADMISSIONS',
      items: [
        {
          name: 'Dashboard',
          href: '/',
          icon: <BarChart2 className="w-5 h-5" />,
          access: true,
        },
        {
          name: 'Student Registration',
          href: '/student-registration',
          icon: <UserPlus className="w-5 h-5" />,
          access: true,
        },
        {
          name: 'Student List',
          href: '/student-list',
          icon: <Users className="w-5 h-5" />,
          access: true,
        },
        {
          name: 'Invoices',
          href: '/invoices',
          icon: <File className="w-5 h-5" />,
          access: true,
        },
      ],
    },
    {
      title: 'COURSES',
      items: [
        {
          name: 'Course Management',
          href: '/course-management',
          icon: <Book className="w-5 h-5" />,
          access: isAdmin,
        },
        {
          name: 'Trainers',
          href: '/trainers',
          icon: <BookOpen className="w-5 h-5" />,
          access: isAdmin,
        },
        {
          name: 'Schedule',
          href: '/schedule',
          icon: <Calendar className="w-5 h-5" />,
          access: true,
        },
      ],
    },
    {
      title: 'CORPORATE',
      items: [
        {
          name: 'Quotations',
          href: '/quotations',
          icon: <FilePen className="w-5 h-5" />,
          access: true,
        },
        {
          name: 'Proposals',
          href: '/proposals',
          icon: <FileSignature className="w-5 h-5" />,
          access: true,
        },
      ],
    },
    {
      title: 'ADMIN',
      items: [
        {
          name: 'Certificates',
          href: '/certificates',
          icon: <Award className="w-5 h-5" />,
          access: isSuperAdmin,
        },
        {
          name: 'Settings',
          href: '/settings',
          icon: <Settings className="w-5 h-5" />,
          access: isAdmin,
        },
      ],
    },
  ];

  return (
    <aside className={cn("bg-gray-800 text-white w-64 min-h-screen hidden md:block overflow-y-auto", className)}>
      <div className="p-4">
        <h1 className="text-xl font-semibold">Orbit Institute</h1>
      </div>
      
      <nav className="mt-4">
        {menuItems.map((section, idx) => {
          const visibleItems = section.items.filter(item => item.access);
          if (visibleItems.length === 0) return null;
          
          return (
            <div key={idx}>
              <div className="px-4 py-2 text-gray-400 text-xs font-semibold">{section.title}</div>
              
              {visibleItems.map((item, itemIdx) => (
                <Link
                  key={itemIdx}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700",
                    location === item.href && "text-white bg-primary-800"
                  )}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Link>
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
