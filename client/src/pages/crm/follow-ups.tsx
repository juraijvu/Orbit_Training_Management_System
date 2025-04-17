import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  Phone,
  FileText,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";

export default function FollowUpsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);

  // Query to fetch follow-ups
  const { 
    data: followUps = [], 
    isLoading,
  } = useQuery({
    queryKey: ['/api/crm/follow-ups'],
  });

  // Query to fetch leads for dropdown
  const { 
    data: leads = [], 
  } = useQuery({
    queryKey: ['/api/crm/leads'],
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Follow-ups</h1>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Schedule Follow-up
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Today</CardTitle>
            <CardDescription>
              Follow-ups scheduled for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {followUps
                .filter(fu => {
                  const today = new Date();
                  const fuDate = new Date(fu.contactDate);
                  return (
                    fuDate.getDate() === today.getDate() &&
                    fuDate.getMonth() === today.getMonth() &&
                    fuDate.getFullYear() === today.getFullYear()
                  );
                })
                .map((followUp) => (
                  <div key={followUp.id} className="flex items-center justify-between border p-3 rounded-md">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Call {followUp.leadName}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(followUp.contactDate), 'h:mm a')}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Marked as completed",
                          description: "Follow-up has been completed successfully.",
                        });
                      }}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              {followUps.filter(fu => {
                const today = new Date();
                const fuDate = new Date(fu.contactDate);
                return (
                  fuDate.getDate() === today.getDate() &&
                  fuDate.getMonth() === today.getMonth() &&
                  fuDate.getFullYear() === today.getFullYear()
                );
              }).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <p>No follow-ups for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Upcoming</CardTitle>
            <CardDescription>
              Follow-ups scheduled for later
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {followUps
                .filter(fu => {
                  const today = new Date();
                  const fuDate = new Date(fu.contactDate);
                  // Get follow-ups for future dates
                  return new Date(fu.contactDate) > today && !(
                    fuDate.getDate() === today.getDate() &&
                    fuDate.getMonth() === today.getMonth() &&
                    fuDate.getFullYear() === today.getFullYear()
                  );
                })
                .map((followUp) => (
                  <div key={followUp.id} className="flex items-center justify-between border p-3 rounded-md">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{followUp.leadName}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(followUp.contactDate), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        toast({
                          description: "Reschedule - to be implemented",
                        });
                      }}
                    >
                      Reschedule
                    </Button>
                  </div>
                ))}
              {followUps.filter(fu => {
                const today = new Date();
                const fuDate = new Date(fu.contactDate);
                return new Date(fu.contactDate) > today && !(
                  fuDate.getDate() === today.getDate() &&
                  fuDate.getMonth() === today.getMonth() &&
                  fuDate.getFullYear() === today.getFullYear()
                );
              }).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <p>No upcoming follow-ups</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completed</CardTitle>
            <CardDescription>
              Recently completed follow-ups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {followUps
                .filter(fu => fu.outcome !== null)
                .slice(0, 5)
                .map((followUp) => (
                  <div key={followUp.id} className="flex items-center justify-between border p-3 rounded-md">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{followUp.leadName}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(followUp.contactDate), 'MMM d')} - {followUp.outcome || "Completed"}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        toast({
                          description: "View notes - to be implemented",
                        });
                      }}
                    >
                      Notes
                    </Button>
                  </div>
                ))}
              {followUps.filter(fu => fu.outcome !== null).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No completed follow-ups</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>All Follow-ups</CardTitle>
          <CardDescription>
            Complete history of lead interactions and follow-ups
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : followUps.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No follow-ups yet</h3>
              <p className="text-muted-foreground mt-2">
                Schedule your first follow-up to track lead interactions.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setOpenDialog(true)}>
                <Plus className="mr-2 h-4 w-4" /> Schedule Follow-up
              </Button>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Lead</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {followUps.map((followUp) => (
                    <TableRow key={followUp.id}>
                      <TableCell>
                        <div className="font-medium">
                          {format(new Date(followUp.contactDate), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(followUp.contactDate), 'h:mm a')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{followUp.leadName}</span>
                        </div>
                        <div className="text-xs flex items-center mt-1">
                          <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{followUp.leadPhone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`
                          px-2 py-1 rounded-full text-xs inline-flex items-center
                          ${followUp.contactType === 'Call' ? 'bg-blue-100 text-blue-800' : ''}
                          ${followUp.contactType === 'Email' ? 'bg-purple-100 text-purple-800' : ''}
                          ${followUp.contactType === 'Meeting' ? 'bg-green-100 text-green-800' : ''}
                          ${followUp.contactType === 'Message' ? 'bg-yellow-100 text-yellow-800' : ''}
                        `}>
                          {followUp.contactType}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {followUp.notes || 'No notes'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate">
                          {followUp.outcome || 'Pending'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {followUp.nextFollowUp ? (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-sm">
                              {format(new Date(followUp.nextFollowUp), 'MMM d, yyyy')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not scheduled</span>
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
                                description: "Update follow-up - to be implemented",
                              });
                            }}
                          >
                            Update
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

      {/* Schedule Follow-up Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule Follow-up</DialogTitle>
            <DialogDescription>
              Plan your next interaction with a lead. Fill in the details and save.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lead" className="text-right">
                Lead
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map(lead => (
                    <SelectItem key={lead.id} value={lead.id.toString()}>
                      {lead.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactType" className="text-right">
                Contact Type
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="message">Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactDate" className="text-right">
                Date
              </Label>
              <Input
                id="contactDate"
                type="date"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactTime" className="text-right">
                Time
              </Label>
              <Input
                id="contactTime"
                type="time"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Agenda, topics to discuss, etc."
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => {
              toast({
                title: "Success",
                description: "Follow-up scheduled successfully!",
              });
              setOpenDialog(false);
            }}>
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}