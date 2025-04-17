import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Calendar,
  User,
  FileText
} from "lucide-react";
import { format } from "date-fns";

export default function LeadsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);

  // Query to fetch leads
  const { 
    data: leads = [], 
    isLoading 
  } = useQuery({
    queryKey: ['/api/crm/leads'],
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Leads Management</h1>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Lead
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Lead Dashboard</CardTitle>
          <CardDescription>
            Manage and track potential customers interested in your courses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search leads..."
                className="pl-8"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No leads yet</h3>
              <p className="text-muted-foreground mt-2">
                Add your first lead to start tracking potential customers.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setOpenDialog(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add New Lead
              </Button>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Interested In</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          {lead.fullName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-xs">
                            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                            {lead.phone}
                          </div>
                          {lead.email && (
                            <div className="flex items-center text-xs">
                              <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                              {lead.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`
                          px-2 py-1 rounded-full text-xs inline-flex items-center
                          ${lead.status === 'New' ? 'bg-blue-100 text-blue-800' : ''}
                          ${lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${lead.status === 'Qualified' ? 'bg-purple-100 text-purple-800' : ''}
                          ${lead.status === 'Converted' ? 'bg-green-100 text-green-800' : ''}
                          ${lead.status === 'Lost' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {lead.status}
                        </div>
                      </TableCell>
                      <TableCell>{lead.interestedCourse || 'Not specified'}</TableCell>
                      <TableCell>
                        {lead.lastContactDate ? (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-sm">
                              {format(new Date(lead.lastContactDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not contacted</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2"
                            onClick={() => {
                              toast({
                                description: "View lead details - to be implemented",
                              });
                            }}
                          >
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2"
                            onClick={() => {
                              toast({
                                description: "Add follow-up - to be implemented",
                              });
                            }}
                          >
                            Follow-up
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

      {/* Add Lead Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Enter the details of the potential customer. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">
                Full Name
              </Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                placeholder="+1 234 567 8900"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                placeholder="john@example.com"
                className="col-span-3"
                type="email"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="source" className="text-right">
                Source
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select lead source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="email">Email Campaign</SelectItem>
                  <SelectItem value="call">Cold Call</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interestedCourse" className="text-right">
                Interested In
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Web Development</SelectItem>
                  <SelectItem value="2">Digital Marketing</SelectItem>
                  <SelectItem value="3">Graphic Design</SelectItem>
                  <SelectItem value="4">Data Science</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                placeholder="Any additional information"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => {
              toast({
                title: "Success",
                description: "Lead added successfully!",
              });
              setOpenDialog(false);
            }}>
              Save Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}