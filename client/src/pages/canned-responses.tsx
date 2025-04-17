import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, Copy, MoreHorizontal } from "lucide-react";
import AppLayout from "@/components/layout/app-layout";

type CannedResponse = {
  id: number;
  shortcut: string;
  content: string;
  isGlobal: boolean;
  createdBy: number;
  createdAt: string;
};

const CannedResponsesPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<CannedResponse | null>(null);
  const [form, setForm] = useState({
    shortcut: "",
    content: "",
    isGlobal: false,
  });

  // Fetch canned responses
  const {
    data: responses,
    isLoading,
    error,
  } = useQuery<CannedResponse[]>({
    queryKey: [
      "/api/whatsapp/canned-responses",
      user?.id ? `consultant/${user.id}` : "",
    ],
    queryFn: async ({ queryKey }) => {
      const consultantId = user?.id;
      const url = consultantId
        ? `/api/whatsapp/canned-responses/consultant/${consultantId}`
        : "/api/whatsapp/canned-responses";
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch canned responses");
      }
      return res.json();
    },
    enabled: !!user,
  });

  // Create canned response mutation
  const createMutation = useMutation({
    mutationFn: async (response: any) => {
      const res = await fetch("/api/whatsapp/canned-responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(response),
      });
      if (!res.ok) {
        throw new Error("Failed to create canned response");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/whatsapp/canned-responses"],
      });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Canned response created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update canned response mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, response }: { id: number; response: any }) => {
      const res = await fetch(`/api/whatsapp/canned-responses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(response),
      });
      if (!res.ok) {
        throw new Error("Failed to update canned response");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/whatsapp/canned-responses"],
      });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Canned response updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete canned response mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/whatsapp/canned-responses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete canned response");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/whatsapp/canned-responses"],
      });
      toast({
        title: "Success",
        description: "Canned response deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateResponse = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      shortcut: form.shortcut,
      content: form.content,
      isGlobal: form.isGlobal,
    });
  };

  const handleUpdateResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResponse) return;

    updateMutation.mutate({
      id: selectedResponse.id,
      response: {
        shortcut: form.shortcut,
        content: form.content,
        isGlobal: form.isGlobal,
      },
    });
  };

  const handleDeleteResponse = (id: number) => {
    if (window.confirm("Are you sure you want to delete this canned response?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setForm({
      shortcut: "",
      content: "",
      isGlobal: false,
    });
    setSelectedResponse(null);
  };

  const editResponse = (response: CannedResponse) => {
    setSelectedResponse(response);
    setForm({
      shortcut: response.shortcut,
      content: response.content,
      isGlobal: response.isGlobal,
    });
    setIsDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied",
          description: "Response copied to clipboard",
        });
      },
      (err) => {
        toast({
          title: "Error",
          description: "Could not copy text: " + err,
          variant: "destructive",
        });
      }
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Error loading canned responses</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Canned Responses</h1>
            <p className="text-muted-foreground">
              Create and manage preset message templates for quick responses
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" /> New Response
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedResponse ? "Edit Response" : "Create New Response"}
                </DialogTitle>
                <DialogDescription>
                  {selectedResponse
                    ? "Update your canned response details"
                    : "Create a new canned response for quick messaging"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={selectedResponse ? handleUpdateResponse : handleCreateResponse}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="shortcut">Shortcut</Label>
                    <Input
                      id="shortcut"
                      value={form.shortcut}
                      onChange={(e) =>
                        setForm({ ...form, shortcut: e.target.value })
                      }
                      placeholder="e.g. #hello or #thanks"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Type this shortcut in the chat followed by space to use this response
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="content">Message</Label>
                    <Textarea
                      id="content"
                      value={form.content}
                      onChange={(e) =>
                        setForm({ ...form, content: e.target.value })
                      }
                      placeholder="Your canned response message"
                      rows={6}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      You can use variables like {"{name}"} or {"{phone}"} that will be replaced with actual values
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isGlobal"
                      checked={form.isGlobal}
                      onCheckedChange={(checked) =>
                        setForm({ ...form, isGlobal: checked })
                      }
                    />
                    <Label htmlFor="isGlobal">Make global for all consultants</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {selectedResponse ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>{selectedResponse ? "Update Response" : "Create Response"}</>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Canned Responses</CardTitle>
            <CardDescription>
              {responses?.length === 0
                ? "No canned responses created yet"
                : `${responses?.length} canned responses available`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {responses && responses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shortcut</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="font-mono">{response.shortcut}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {response.content}
                      </TableCell>
                      <TableCell>
                        {response.isGlobal ? (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                            Global
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                            Personal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyToClipboard(response.content)}>
                              <Copy className="h-4 w-4 mr-2" /> Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editResponse(response)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteResponse(response.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-8 border rounded-md bg-muted/20">
                <p className="text-muted-foreground mb-4">
                  You don't have any canned responses yet. Create your first one to save time when messaging.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Create Canned Response
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Use Canned Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">In WhatsApp Chat</h3>
                <p className="text-muted-foreground">
                  When chatting with customers, simply type your shortcut followed by a space to automatically replace it with the full response. For example, typing "#hello " will insert your predefined greeting.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Variables</h3>
                <p className="text-muted-foreground">
                  Include variables in your responses by using curly braces like {"{name}"} or {"{phone}"}. These will be automatically replaced with customer data when available.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Global vs Personal</h3>
                <p className="text-muted-foreground">
                  Global responses are available to all consultants, while personal responses are only visible to you. Admins can create global responses for the whole team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CannedResponsesPage;