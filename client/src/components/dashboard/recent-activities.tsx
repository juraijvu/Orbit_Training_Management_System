import { FC } from 'react';
import { Activity } from '@shared/types';
import { format } from 'date-fns';
import { 
  UserPlus, 
  File, 
  CalendarCheck, 
  Award 
} from 'lucide-react';

interface RecentActivitiesProps {
  activities: Activity[];
  loading?: boolean;
}

const RecentActivities: FC<RecentActivitiesProps> = ({ 
  activities,
  loading = false 
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'registration':
        return (
          <div className="bg-primary-100 p-2 rounded-full">
            <UserPlus className="text-primary-700 h-4 w-4" />
          </div>
        );
      case 'invoice':
        return (
          <div className="bg-green-100 p-2 rounded-full">
            <File className="text-green-700 h-4 w-4" />
          </div>
        );
      case 'schedule':
        return (
          <div className="bg-yellow-100 p-2 rounded-full">
            <CalendarCheck className="text-yellow-700 h-4 w-4" />
          </div>
        );
      case 'certificate':
        return (
          <div className="bg-purple-100 p-2 rounded-full">
            <Award className="text-purple-700 h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-2 rounded-full">
            <UserPlus className="text-gray-700 h-4 w-4" />
          </div>
        );
    }
  };

  const formatTime = (timestamp: Date) => {
    const today = new Date();
    const activityDate = new Date(timestamp);
    
    if (
      activityDate.getDate() === today.getDate() &&
      activityDate.getMonth() === today.getMonth() &&
      activityDate.getFullYear() === today.getFullYear()
    ) {
      return `Today, ${format(activityDate, 'h:mm a')}`;
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (
      activityDate.getDate() === yesterday.getDate() &&
      activityDate.getMonth() === yesterday.getMonth() &&
      activityDate.getFullYear() === yesterday.getFullYear()
    ) {
      return `Yesterday, ${format(activityDate, 'h:mm a')}`;
    }
    
    return format(activityDate, 'MMM d, h:mm a');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Recent Activities</h2>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start pb-4 border-b border-gray-200">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="ml-4 w-full">
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Recent Activities</h2>
        <a href="#" className="text-sm text-primary-600 hover:text-primary-800">View All</a>
      </div>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent activities</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start pb-4 border-b border-gray-200">
              {getActivityIcon(activity.type)}
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-800">{activity.message}</p>
                <p className="text-sm text-gray-600">{activity.detail}</p>
                <p className="text-xs text-gray-500 mt-1">{formatTime(activity.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivities;
