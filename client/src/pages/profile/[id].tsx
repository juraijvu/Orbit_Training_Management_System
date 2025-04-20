import React, { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserRole } from "@shared/types";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Shield, User as UserIcon, Calendar, BarChart2, CheckCircle, Clock } from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const id = params.id;
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Fetch user profile
  const { 
    data: user, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: [`/api/users/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      return response.json();
    },
    retry: 1,
  });

  // Handle any errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load user profile. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  // Initialize form data when user data is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName,
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);
  
  // Update profile handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      toast({
        title: "Success",
        description: "Your profile has been updated successfully",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  };
  
  // Change password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation do not match",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${id}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to change password');
      }
      
      toast({
        title: "Success",
        description: "Your password has been changed successfully",
      });
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      });
    }
  };

  // Helper function to determine role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'superadmin':
        return "bg-red-500";
      case 'admin':
        return "bg-blue-500";
      case 'counselor':
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get avatar text (first two letters of full name)
  const getAvatarText = (fullName: string) => {
    if (!fullName) return "??";
    const nameParts = fullName.split(' ');
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Tabs defaultValue="overview">
            <TabsList>
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </TabsList>
            <div className="mt-6">
              <Skeleton className="h-48 w-full" />
            </div>
          </Tabs>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <UserIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">User not found</h3>
            <p className="text-muted-foreground mb-4">The requested user profile could not be loaded.</p>
            <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        {/* Profile header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24 border-4 border-background">
            <AvatarFallback className="text-xl">{getAvatarText(user.fullName)}</AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-2xl font-bold">{user.fullName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
              {user.id === currentUser?.id && (
                <Badge variant="outline">This is you</Badge>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {user.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
              )}
              
              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            {user.id === currentUser?.id && (
              <TabsTrigger value="settings">Settings</TabsTrigger>
            )}
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Username</div>
                      <div className="font-medium">{user.username}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Full Name</div>
                      <div className="font-medium">{user.fullName}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Role</div>
                      <div className="font-medium capitalize">{user.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                      <div className="font-medium">{user.email || "Not provided"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Phone</div>
                      <div className="font-medium">{user.phone || "Not provided"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* We can add additional cards here with permissions, specialized fields, etc. */}
              {(user.role === "admin" || user.role === "superadmin") && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Administrative Access</CardTitle>
                    <CardDescription>
                      This user has administrative privileges in the system.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex items-center p-3 border rounded-lg">
                        <Shield className="h-5 w-5 mr-2 text-primary" />
                        <div className="text-sm font-medium">User Management</div>
                      </div>
                      <div className="flex items-center p-3 border rounded-lg">
                        <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                        <div className="text-sm font-medium">Reports Access</div>
                      </div>
                      <div className="flex items-center p-3 border rounded-lg">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                        <div className="text-sm font-medium">Approval Rights</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  View recent system activities by this user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* This would be populated from an API but for now show a placeholder */}
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">User activity tracking is not yet available</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        This feature will be available in a future update
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Settings Tab (only for current user) */}
          {user.id === currentUser?.id && (
            <TabsContent value="settings">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>
                      Update your personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={handleUpdateProfile}>
                      <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                        <Input
                          id="phone"
                          name="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        />
                      </div>
                      
                      <Button type="submit" className="mt-4">Save Changes</Button>
                    </form>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your account password
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={handleChangePassword}>
                      <div className="space-y-2">
                        <label htmlFor="currentPassword" className="text-sm font-medium">Current Password</label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          placeholder="Enter current password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          placeholder="Enter new password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm new password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        />
                      </div>
                      
                      <Button type="submit" className="mt-4">Change Password</Button>
                    </form>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Account Preferences</CardTitle>
                    <CardDescription>
                      Manage your account settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        For advanced settings and system-wide configuration, please visit the main {" "}
                        <Button variant="link" className="px-1 py-0 h-auto" onClick={() => window.location.href = "/settings"}>
                          Settings page
                        </Button>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}