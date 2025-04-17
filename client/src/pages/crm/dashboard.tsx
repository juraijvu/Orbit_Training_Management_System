import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  TrendingUp,
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  ArrowRight,
  BarChart3,
  Clock,
  ListChecks,
  UserPlus
} from "lucide-react";
import { format } from "date-fns";

export default function CrmDashboardPage() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState("overview");

  // Fetch leads data
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['/api/crm/leads'],
  });

  // Fetch campaigns data
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/crm/campaigns'],
  });

  // Fetch follow-ups data
  const { data: followUps = [], isLoading: followUpsLoading } = useQuery({
    queryKey: ['/api/crm/follow-ups'],
  });
  
  // Filter today's follow-ups
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayFollowUps = followUps.filter(fu => {
    if (!fu.nextFollowUp) return false;
    const followUpDate = new Date(fu.nextFollowUp);
    followUpDate.setHours(0, 0, 0, 0);
    return followUpDate.getTime() === today.getTime();
  });
  
  // Filter recent leads (last 7 days)
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const recentLeads = leads.filter(lead => {
    const createdDate = new Date(lead.createdAt);
    return createdDate >= lastWeek;
  });
  
  // Calculate conversion metrics
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;
  
  // Get active campaigns count
  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active').length;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">CRM Dashboard</h1>
        <div className="space-x-2">
          <Button asChild variant="outline">
            <Link href="/crm/leads">
              <UserPlus className="mr-2 h-4 w-4" />
              Manage Leads
            </Link>
          </Button>
          <Button asChild>
            <Link href="/crm/follow-ups">
              <Calendar className="mr-2 h-4 w-4" />
              View Follow-ups
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={tabValue} onValueChange={setTabValue}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="follow-ups">Follow-ups</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <div className="text-3xl font-bold">{totalLeads}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {recentLeads.length} new in last 7 days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <div className="text-3xl font-bold">{conversionRate}%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {convertedLeads} converted leads
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Follow-ups Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-500 mr-3" />
                  <div>
                    <div className="text-3xl font-bold">{todayFollowUps.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {followUps.length} total follow-ups
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <div className="text-3xl font-bold">{activeCampaigns}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {campaigns.length} total campaigns
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>Latest leads added in the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {leadsLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : recentLeads.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center">
                    <Users className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No new leads in the last 7 days</p>
                    <Button asChild variant="link" size="sm" className="mt-2">
                      <Link href="/crm/leads">Add new lead</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentLeads.slice(0, 5).map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.fullName}</TableCell>
                            <TableCell>
                              <div className={`
                                px-2 py-1 rounded-full text-xs inline-flex items-center
                                ${lead.status === 'New' ? 'bg-blue-100 text-blue-800' : ''}
                                ${lead.status === 'Interested Highly' ? 'bg-green-100 text-green-800' : ''}
                                ${lead.status === 'Register Soon' ? 'bg-purple-100 text-purple-800' : ''}
                                ${lead.status === 'Called Back' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${lead.status === 'Not Interested' ? 'bg-red-100 text-red-800' : ''}
                                ${lead.status === 'Converted' ? 'bg-emerald-100 text-emerald-800' : ''}
                              `}>
                                {lead.status}
                              </div>
                            </TableCell>
                            <TableCell>
                              {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              {recentLeads.length > 0 && (
                <CardFooter>
                  <Button asChild variant="outline" size="sm" className="ml-auto">
                    <Link href="/crm/leads">
                      View all leads
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              )}
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Today's Follow-ups</CardTitle>
                <CardDescription>Follow-ups scheduled for today</CardDescription>
              </CardHeader>
              <CardContent>
                {followUpsLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : todayFollowUps.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No follow-ups scheduled for today</p>
                    <Button asChild variant="link" size="sm" className="mt-2">
                      <Link href="/crm/follow-ups">Schedule follow-up</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lead</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Priority</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {todayFollowUps.slice(0, 5).map((followUp) => {
                          const lead = leads.find(l => l.id === followUp.leadId);
                          return (
                            <TableRow key={followUp.id}>
                              <TableCell className="font-medium">
                                {lead ? lead.fullName : `Lead #${followUp.leadId}`}
                              </TableCell>
                              <TableCell>
                                {followUp.nextFollowUpTime || "Not set"}
                              </TableCell>
                              <TableCell>
                                <span className={`
                                  px-2 py-1 rounded-full text-xs inline-flex items-center
                                  ${followUp.priority === 'High' ? 'bg-red-100 text-red-800' : ''}
                                  ${followUp.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                                  ${followUp.priority === 'Low' ? 'bg-green-100 text-green-800' : ''}
                                `}>
                                  {followUp.priority}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              {todayFollowUps.length > 0 && (
                <CardFooter>
                  <Button asChild variant="outline" size="sm" className="ml-auto">
                    <Link href="/crm/follow-ups">
                      View all follow-ups
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Lead Status Overview</CardTitle>
              <CardDescription>Distribution of leads by current status</CardDescription>
            </CardHeader>
            <CardContent>
              {leadsLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : leads.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-lg font-medium">No leads available</p>
                  <p className="text-muted-foreground mt-1">Start by adding new leads to your CRM</p>
                  <Button asChild className="mt-4">
                    <Link href="/crm/leads">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add New Lead
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['New', 'Interested Highly', 'Register Soon', 'Called Back', 'Not Interested', 'Wrong Enquiry', 'Converted'].map(status => {
                    const count = leads.filter(lead => lead.status === status).length;
                    const percentage = totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) : 0;
                    
                    let bgColor = 'bg-gray-100';
                    let textColor = 'text-gray-800';
                    
                    switch(status) {
                      case 'New': 
                        bgColor = 'bg-blue-100';
                        textColor = 'text-blue-800';
                        break;
                      case 'Interested Highly': 
                        bgColor = 'bg-green-100';
                        textColor = 'text-green-800';
                        break;
                      case 'Register Soon': 
                        bgColor = 'bg-purple-100';
                        textColor = 'text-purple-800';
                        break;
                      case 'Called Back': 
                        bgColor = 'bg-yellow-100';
                        textColor = 'text-yellow-800';
                        break;
                      case 'Not Interested': 
                        bgColor = 'bg-red-100';
                        textColor = 'text-red-800';
                        break;
                      case 'Wrong Enquiry': 
                        bgColor = 'bg-orange-100';
                        textColor = 'text-orange-800';
                        break;
                      case 'Converted': 
                        bgColor = 'bg-emerald-100';
                        textColor = 'text-emerald-800';
                        break;
                    }
                    
                    return (
                      <Card key={status} className={`${bgColor} border-none`}>
                        <CardHeader className="pb-2">
                          <CardTitle className={`text-sm font-medium ${textColor}`}>{status}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{count}</div>
                          <p className="text-xs mt-1 text-muted-foreground">{percentage}% of total</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="ml-auto">
                <Link href="/crm/leads">
                  Manage Leads
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="follow-ups">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Follow-up Schedule</CardTitle>
              <CardDescription>Upcoming follow-ups for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {followUpsLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : followUps.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-lg font-medium">No scheduled follow-ups</p>
                  <p className="text-muted-foreground mt-1">Create follow-ups to stay on top of your leads</p>
                  <Button asChild className="mt-4">
                    <Link href="/crm/follow-ups">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Follow-ups
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Today's follow-ups */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Today</h3>
                    {todayFollowUps.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No follow-ups scheduled for today</p>
                    ) : (
                      <div className="space-y-2">
                        {todayFollowUps.map((followUp) => {
                          const lead = leads.find(l => l.id === followUp.leadId);
                          return (
                            <Card key={followUp.id} className="p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">{lead ? lead.fullName : `Lead #${followUp.leadId}`}</div>
                                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {followUp.nextFollowUpTime || "Not set"}
                                    
                                    <span className="mx-2">•</span>
                                    
                                    <span className={`
                                      px-1.5 py-0.5 rounded-full text-xs
                                      ${followUp.priority === 'High' ? 'bg-red-100 text-red-800' : ''}
                                      ${followUp.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                                      ${followUp.priority === 'Low' ? 'bg-green-100 text-green-800' : ''}
                                    `}>
                                      {followUp.priority}
                                    </span>
                                  </div>
                                  {followUp.notes && (
                                    <div className="text-sm mt-2">{followUp.notes}</div>
                                  )}
                                </div>
                                <div>
                                  {lead && lead.phone && (
                                    <Button size="icon" variant="ghost" className="h-8 w-8">
                                      <Phone className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {lead && lead.email && (
                                    <Button size="icon" variant="ghost" className="h-8 w-8">
                                      <Mail className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {lead && lead.whatsappNumber && (
                                    <Button size="icon" variant="ghost" className="h-8 w-8">
                                      <MessageSquare className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Upcoming follow-ups */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Upcoming</h3>
                    <div className="space-y-2">
                      {followUps
                        .filter(fu => {
                          if (!fu.nextFollowUp) return false;
                          const followUpDate = new Date(fu.nextFollowUp);
                          followUpDate.setHours(0, 0, 0, 0);
                          
                          const tomorrow = new Date(today);
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          
                          const nextWeek = new Date(today);
                          nextWeek.setDate(nextWeek.getDate() + 7);
                          
                          return followUpDate >= tomorrow && followUpDate <= nextWeek;
                        })
                        .slice(0, 5)
                        .map((followUp) => {
                          const lead = leads.find(l => l.id === followUp.leadId);
                          const followUpDate = new Date(followUp.nextFollowUp);
                          
                          return (
                            <Card key={followUp.id} className="p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">{lead ? lead.fullName : `Lead #${followUp.leadId}`}</div>
                                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {format(followUpDate, 'MMM d, yyyy')}
                                    
                                    <span className="mx-2">•</span>
                                    
                                    <Clock className="h-3 w-3 mr-1" />
                                    {followUp.nextFollowUpTime || "Not set"}
                                    
                                    <span className="mx-2">•</span>
                                    
                                    <span className={`
                                      px-1.5 py-0.5 rounded-full text-xs
                                      ${followUp.priority === 'High' ? 'bg-red-100 text-red-800' : ''}
                                      ${followUp.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                                      ${followUp.priority === 'Low' ? 'bg-green-100 text-green-800' : ''}
                                    `}>
                                      {followUp.priority}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })
                      }
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            {followUps.length > 0 && (
              <CardFooter>
                <Button asChild variant="outline" className="ml-auto">
                  <Link href="/crm/follow-ups">
                    View Full Schedule
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Campaigns</CardTitle>
              <CardDescription>
                Overview of your active marketing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-lg font-medium">No campaigns available</p>
                  <p className="text-muted-foreground mt-1">Start by creating a marketing campaign</p>
                  <Button asChild className="mt-4">
                    <Link href="/crm/campaigns">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Create Campaign
                    </Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Results</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.slice(0, 5).map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>{campaign.platform}</TableCell>
                        <TableCell>
                          <span className={`
                            px-2 py-1 rounded-full text-xs
                            ${campaign.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                            ${campaign.status === 'planned' ? 'bg-blue-100 text-blue-800' : ''}
                            ${campaign.status === 'completed' ? 'bg-gray-100 text-gray-800' : ''}
                          `}>
                            {campaign.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {campaign.budget ? `AED ${campaign.budget}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {campaign.conversions || 0} conversions
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            {campaigns.length > 0 && (
              <CardFooter>
                <Button asChild variant="outline" className="ml-auto">
                  <Link href="/crm/campaigns">
                    View All Campaigns
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}