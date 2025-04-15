import { FC } from 'react';
import { cn } from '@/lib/utils';
import { 
  GraduationCap, 
  Presentation, 
  IndianRupee, 
  IdCard 
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  type: 'students' | 'courses' | 'revenue' | 'certificates';
  className?: string;
}

const StatCard: FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  type,
  className 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'students':
        return <GraduationCap className="text-primary-700" />;
      case 'courses':
        return <Presentation className="text-primary-700" />;
      case 'revenue':
        return <IndianRupee className="text-primary-700" />;
      case 'certificates':
        return <IdCard className="text-primary-700" />;
      default:
        return <GraduationCap className="text-primary-700" />;
    }
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-sm p-6", className)}>
      <div className="flex items-center">
        <div className="bg-primary-100 p-3 rounded-full">
          {getIcon()}
        </div>
        <div className="ml-4">
          <h2 className="text-sm font-medium text-gray-500">{title}</h2>
          <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
      </div>
      {change && (
        <div className="mt-4 text-sm text-success">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="inline-block h-4 w-4 mr-1" 
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
