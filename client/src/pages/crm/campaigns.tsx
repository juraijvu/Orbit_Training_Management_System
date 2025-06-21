import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Calendar,
  TrendingUp,
  DollarSign,
  Monitor,
  FileText
} from "lucide-react";
import { format } from "date-fns";

export default function CampaignsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    platform: "",
    targetAudience: "",
    budget: "",
    startDate: "",
    endDate: "",
    status: "draft"
  });

  // Query to fetch campaigns
  const { 
    data: campaigns = [], 
    isLoading 
  } = useQuery({
    queryKey: ['/api/crm/campaigns'],
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      const response = await apiRequest('POST', '/api/crm/campaigns', campaignData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Campaign created successfully",
      });
      setOpenDialog(false);
      setFormData({
        name: "",
        description: "",
        platform: "",
        targetAudience: "",
        budget: "",
        startDate: "",
        endDate: "",
        status: "draft"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/campaigns'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.platform || !formData.startDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createCampaignMutation.mutate({
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : null,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Marketing Campaigns</h1>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Campaign
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Campaign Dashboard</CardTitle>
          <CardDescription>
            Track and manage your marketing campaigns across different platforms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search campaigns..."
                className="pl-8"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No campaigns yet</h3>
              <p className="text-muted-foreground mt-2">
                Create your first marketing campaign to promote your courses.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setOpenDialog(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Campaign
              </Button>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          {campaign.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Monitor className="h-4 w-4 mr-2 text-muted-foreground" />
                          {campaign.platform}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`
                          px-2 py-1 rounded-full text-xs inline-flex items-center
                          ${campaign.status === 'Draft' ? 'bg-gray-100 text-gray-800' : ''}
                          ${campaign.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                          ${campaign.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${campaign.status === 'Completed' ? 'bg-blue-100 text-blue-800' : ''}
                        `}>
                          {campaign.status}
                        </div>
                      </TableCell>
                      <TableCell>
                        {campaign.budget ? (
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span>{campaign.budget}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-xs">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span>Start: {format(new Date(campaign.startDate), 'MMM d, yyyy')}</span>
                          </div>
                          {campaign.endDate && (
                            <div className="flex items-center text-xs">
                              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span>End: {format(new Date(campaign.endDate), 'MMM d, yyyy')}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2"
                            onClick={() => {
                              toast({
                                description: "Edit campaign - to be implemented",
                              });
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2"
                            onClick={() => {
                              toast({
                                description: "View results - to be implemented",
                              });
                            }}
                          >
                            Results
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Set up a new marketing campaign. Fill in the details and click create when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Campaign Name
              </Label>
              <Input
                id="name"
                placeholder="Summer Enrollment 2025"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="platform" className="text-right">
                Platform
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="google">Google Ads</SelectItem>
                  <SelectItem value="email">Email Marketing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Campaign objectives and details"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                Budget (AED)
              </Label>
              <Input
                id="budget"
                type="number"
                placeholder="5000"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => {
              toast({
                title: "Success",
                description: "Campaign created successfully!",
              });
              setOpenDialog(false);
            }}>
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}