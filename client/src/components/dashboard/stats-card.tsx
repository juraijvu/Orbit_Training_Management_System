import { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { 
  GraduationCap, 
  Presentation, 
  DollarSign, 
  Award,
  Users, 
  BookOpen 
} from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  type: 'students' | 'courses' | 'revenue' | 'certificates';
  className?: string;
  icon?: ReactNode;
}

const StatCard: FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  type,
  className,
  icon
}) => {
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'students':
        return <Users className="h-5 w-5 text-blue-600" />;
      case 'courses':
        return <BookOpen className="h-5 w-5 text-yellow-600" />;
      case 'revenue':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'certificates':
        return <Award className="h-5 w-5 text-purple-600" />;
      default:
        return <Users className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-sm p-6", className)}>
      <div className="flex items-center">
        <div className="bg-primary-50 p-3 rounded-full">
          {getIcon()}
        </div>
        <div className="ml-4">
          <h2 className="text-sm font-medium text-gray-500">{title}</h2>
          <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
      </div>
      {change && (
        <div className="mt-4 text-xs text-gray-500">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="inline-block h-3 w-3 mr-1 text-green-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 10l7-7m0 0l7 7m-7-7v18" 
            />
          </svg>
          {change}
        </div>
      )}
    </div>
  );
};

export default StatCard;
