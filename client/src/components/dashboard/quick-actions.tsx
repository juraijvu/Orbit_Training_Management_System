import { FC } from 'react';
import { Link } from 'wouter';
import { UserPlus, File, Calendar, FilePen } from 'lucide-react';

const QuickActions: FC = () => {
  const actions = [
    {
      name: 'New Student',
      href: '/student-registration',
      icon: <UserPlus className="h-6 w-6" />,
      bgColor: 'bg-primary-100',
      textColor: 'text-primary-700'
    },
    {
      name: 'Create Invoice',
      href: '/invoices?new=true',
      icon: <File className="h-6 w-6" />,
      bgColor: 'bg-green-100',
      textColor: 'text-green-700'
    },
    {
      name: 'Schedule Session',
      href: '/schedule?new=true',
      icon: <Calendar className="h-6 w-6" />,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700'
    },
    {
      name: 'New Quotation',
      href: '/quotations?new=true',
      icon: <FilePen className="h-6 w-6" />,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Link 
            key={index} 
            href={action.href}
            className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className={`w-12 h-12 flex items-center justify-center ${action.bgColor} ${action.textColor} rounded-full mb-3`}>
              {action.icon}
            </div>
            <span className="text-sm font-medium text-gray-700">{action.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
