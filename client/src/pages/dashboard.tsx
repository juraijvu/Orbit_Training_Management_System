import { FC, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Activity } from '@shared/types';
import AppLayout from '@/components/layout/app-layout';
import StatCard from '@/components/dashboard/stats-card';
import RecentActivities from '@/components/dashboard/recent-activities';
import UpcomingSchedule from '@/components/dashboard/upcoming-schedule';
import QuickActions from '@/components/dashboard/quick-actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface DashboardStats {
  totalStudents: number;
  activeCourses: number;
  revenue: number;
  certificates: number;
}

interface ScheduleItem {
  id: number;
  title: string;
  courseName: string;
  trainerName: string;
  startTime: string;
  endTime: string;
  status: string;
}

const Dashboard: FC = () => {
  const { user } = useAuth();
  
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch recent activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['/api/dashboard/activities'],
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Fetch upcoming schedules
  const { data: schedules, isLoading: schedulesLoading } = useQuery<ScheduleItem[]>({
    queryKey: ['/api/dashboard/schedules'],
    staleTime: 60 * 1000, // 1 minute
  });

  // Format revenue for display
  const formatRevenue = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    } else {
      return `₹${amount}`;
    }
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to Orbit Institute Management System, {user?.fullName || user?.username}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={statsLoading ? "—" : stats?.totalStudents.toString() || "0"}
          change="12% from last month"
          type="students"
        />
        <StatCard
          title="Active Courses"
          value={statsLoading ? "—" : stats?.activeCourses.toString() || "0"}
          change="3 new this month"
          type="courses"
        />
        <StatCard
          title="Revenue"
          value={statsLoading ? "—" : formatRevenue(stats?.revenue || 0)}
          change="8% from last month"
          type="revenue"
        />
        <StatCard
          title="Certificates"
          value={statsLoading ? "—" : stats?.certificates.toString() || "0"}
          change="42 this month"
          type="certificates"
        />
      </div>

      {/* Recent Activities and Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RecentActivities 
          activities={activities || []} 
          loading={activitiesLoading} 
        />
        <UpcomingSchedule 
          schedules={schedules || []} 
          loading={schedulesLoading} 
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />
      
      {/* Role-specific sections */}
      {(user?.role === 'admin' || user?.role === 'superadmin') && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Admin Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Course Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Manage course content, pricing, and availability</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Trainer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Add, update, and schedule trainers</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">System Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">View detailed system and financial reports</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;
