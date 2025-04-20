import React, { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BarChart, LineChart, PieChart, ArrowUpIcon, ArrowDownIcon } from "lucide-react";

const ReportsPage: FC = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>

      <Tabs defaultValue="student" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="student">Student Reports</TabsTrigger>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="trainer">Trainer Reports</TabsTrigger>
          <TabsTrigger value="course">Course Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="student" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Student Enrollment</CardTitle>
                <CardDescription>Monthly student registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <BarChart className="h-16 w-16 opacity-50" />
                    <p>Analytics will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Course Distribution</CardTitle>
                <CardDescription>Student distribution by course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <PieChart className="h-16 w-16 opacity-50" />
                    <p>Analytics will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Completion Rate</CardTitle>
                <CardDescription>Course completion statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <LineChart className="h-16 w-16 opacity-50" />
                    <p>Analytics will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <BarChart className="h-16 w-16 opacity-50" />
                    <p>Analytics will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Payment Methods</CardTitle>
                <CardDescription>Distribution by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <PieChart className="h-16 w-16 opacity-50" />
                    <p>Analytics will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Outstanding Payments</CardTitle>
                <CardDescription>Pending invoice totals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <ArrowUpIcon className="h-16 w-16 opacity-50" />
                    <p>Analytics will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trainer" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Trainer Performance</CardTitle>
                <CardDescription>Student ratings and feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <BarChart className="h-16 w-16 opacity-50" />
                    <p>Analytics will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Course Load</CardTitle>
                <CardDescription>Hours by trainer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <PieChart className="h-16 w-16 opacity-50" />
                    <p>Analytics will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Revenue Generated</CardTitle>
                <CardDescription>Revenue by trainer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <LineChart className="h-16 w-16 opacity-50" />
                    <p>Analytics will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="course" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Popular Courses</CardTitle>
                <CardDescription>Enrollment by course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <BarChart className="h-16 w-16 opacity-50" />
                    <p>Analytics will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Revenue by Course</CardTitle>
                <CardDescription>Financial breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <PieChart className="h-16 w-16 opacity-50" />
                    <p>Analytics will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Course Growth</CardTitle>
                <CardDescription>Enrollment trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <LineChart className="h-16 w-16 opacity-50" />
                    <p>Analytics will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;