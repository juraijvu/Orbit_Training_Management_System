import { FC } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';

interface ScheduleItem {
  id: number;
  title: string;
  courseName: string;
  trainerName: string;
  startTime: Date | string;
  endTime: Date | string;
  status: string;
}

interface UpcomingScheduleProps {
  schedules: ScheduleItem[];
  loading?: boolean;
}

const UpcomingSchedule: FC<UpcomingScheduleProps> = ({ 
  schedules,
  loading = false 
}) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };

  const formatTime = (start: Date | string, end: Date | string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Upcoming Schedule</h2>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Upcoming Schedule</h2>
        <a href="#" className="text-sm text-primary-600 hover:text-primary-800">View Full Schedule</a>
      </div>
      <div className="space-y-4">
        {schedules.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No upcoming schedules</p>
        ) : (
          schedules.map((schedule) => {
            const scheduleDate = new Date(schedule.startTime);
            const month = format(scheduleDate, 'MMM').toUpperCase();
            const day = format(scheduleDate, 'd');
            
            return (
              <div key={schedule.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 flex-shrink-0 flex flex-col items-center justify-center bg-primary-700 text-white rounded-lg">
                  <span className="text-xs font-semibold">{month}</span>
                  <span className="text-lg font-bold">{day}</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-800">{schedule.title}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(schedule.startTime, schedule.endTime)}
                    <span className="mx-2">•</span>
                    <User className="h-3 w-3 mr-1" />
                    {schedule.trainerName}
                  </div>
                </div>
                <div className="ml-auto">
                  {getStatusBadge(schedule.status)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UpcomingSchedule;
