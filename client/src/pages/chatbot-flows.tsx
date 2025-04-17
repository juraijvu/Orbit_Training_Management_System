import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Loader2, Plus, ChevronRight, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/layout/app-layout";

type ChatbotFlow = {
  id: number;
  name: string;
  description: string;
  triggerKeywords: string[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  createdBy: number;
};

type ChatbotNode = {
  id: number;
  flowId: number;
  type: string;
  message: string;
  position: number;
  variables: string[];
  createdAt: string;
};

type ChatbotCondition = {
  id: number;
  nodeId: number;
  type: string;
  value: string;
  nextNodeId: number | null;
  priority: number;
  createdAt: string;
};

type ChatbotAction = {
  id: number;
  nodeId: number;
  type: string;
  parameters: Record<string, any>;
  createdAt: string;
};

const ChatbotFlowsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isFlowDialogOpen, setIsFlowDialogOpen] = useState(false);
  const [isNodeDialogOpen, setIsNodeDialogOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<ChatbotFlow | null>(null);
  const [selectedNode, setSelectedNode] = useState<ChatbotNode | null>(null);
  const [flowForm, setFlowForm] = useState({
    name: "",
    description: "",
    triggerKeywords: "",
    isActive: true,
    isDefault: false,
  });
  const [nodeForm, setNodeForm] = useState({
    type: "message",
    message: "",
    position: 1,
    variables: "",
  });

  // Fetch flows
  const {
    data: flows,
    isLoading: isLoadingFlows,
    error: flowsError,
  } = useQuery<ChatbotFlow[]>({
    queryKey: ["/api/whatsapp/chatbot/flows"],
  });

  // Fetch nodes for selected flow
  const {
    data: nodes,
    isLoading: isLoadingNodes,
    error: nodesError,
  } = useQuery<ChatbotNode[]>({
    queryKey: ["/api/whatsapp/chatbot/flows", selectedFlow?.id, "nodes"],
    enabled: !!selectedFlow,
  });

  // Create flow mutation
  const createFlowMutation = useMutation({
    mutationFn: async (flow: any) => {
      const res = await fetch("/api/whatsapp/chatbot/flows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(flow),
      });
      if (!res.ok) {
        throw new Error("Failed to create flow");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/chatbot/flows"] });
      setIsFlowDialogOpen(false);
      resetFlowForm();
      toast({
        title: "Success",
        description: "Flow created successfully",
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

  // Update flow mutation
  const updateFlowMutation = useMutation({
    mutationFn: async ({ id, flow }: { id: number; flow: any }) => {
      const res = await fetch(`/api/whatsapp/chatbot/flows/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(flow),
      });
      if (!res.ok) {
        throw new Error("Failed to update flow");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/chatbot/flows"] });
      setIsFlowDialogOpen(false);
      resetFlowForm();
      toast({
        title: "Success",
        description: "Flow updated successfully",
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

  // Delete flow mutation
  const deleteFlowMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/whatsapp/chatbot/flows/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete flow");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/chatbot/flows"] });
      setSelectedFlow(null);
      toast({
        title: "Success",
        description: "Flow deleted successfully",
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

  // Create node mutation
  const createNodeMutation = useMutation({
    mutationFn: async (node: any) => {
      const res = await fetch("/api/whatsapp/chatbot/nodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(node),
      });
      if (!res.ok) {
        throw new Error("Failed to create node");
      }
      return await res.json();
    },
    onSuccess: () => {
      if (selectedFlow) {
        queryClient.invalidateQueries({
          queryKey: ["/api/whatsapp/chatbot/flows", selectedFlow.id, "nodes"],
        });
      }
      setIsNodeDialogOpen(false);
      resetNodeForm();
      toast({
        title: "Success",
        description: "Node created successfully",
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

  // Update node mutation
  const updateNodeMutation = useMutation({
    mutationFn: async ({ id, node }: { id: number; node: any }) => {
      const res = await fetch(`/api/whatsapp/chatbot/nodes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(node),
      });
      if (!res.ok) {
        throw new Error("Failed to update node");
      }
      return await res.json();
    },
    onSuccess: () => {
      if (selectedFlow) {
        queryClient.invalidateQueries({
          queryKey: ["/api/whatsapp/chatbot/flows", selectedFlow.id, "nodes"],
        });
      }
      setIsNodeDialogOpen(false);
      resetNodeForm();
      toast({
        title: "Success",
        description: "Node updated successfully",
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

  // Delete node mutation
  const deleteNodeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/whatsapp/chatbot/nodes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete node");
      }
      return true;
    },
    onSuccess: () => {
      if (selectedFlow) {
        queryClient.invalidateQueries({
          queryKey: ["/api/whatsapp/chatbot/flows", selectedFlow.id, "nodes"],
        });
      }
      setSelectedNode(null);
      toast({
        title: "Success",
        description: "Node deleted successfully",
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

  const handleCreateFlow = (e: React.FormEvent) => {
    e.preventDefault();
    const keywords = flowForm.triggerKeywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k);
    
    createFlowMutation.mutate({
      name: flowForm.name,
      description: flowForm.description,
      triggerKeywords: keywords,
      isActive: flowForm.isActive,
      isDefault: flowForm.isDefault,
    });
  };

  const handleUpdateFlow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlow) return;

    const keywords = flowForm.triggerKeywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k);
    
    updateFlowMutation.mutate({
      id: selectedFlow.id,
      flow: {
        name: flowForm.name,
        description: flowForm.description,
        triggerKeywords: keywords,
        isActive: flowForm.isActive,
        isDefault: flowForm.isDefault,
      },
    });
  };

  const handleDeleteFlow = (id: number) => {
    if (window.confirm("Are you sure you want to delete this flow?")) {
      deleteFlowMutation.mutate(id);
    }
  };

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlow) return;

    const variables = nodeForm.variables
      ? nodeForm.variables.split(",").map((v) => v.trim()).filter((v) => v)
      : [];

    createNodeMutation.mutate({
      flowId: selectedFlow.id,
      type: nodeForm.type,
      message: nodeForm.message,
      position: parseInt(nodeForm.position.toString()),
      variables,
    });
  };

  const handleUpdateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) return;

    const variables = nodeForm.variables
      ? nodeForm.variables.split(",").map((v) => v.trim()).filter((v) => v)
      : [];

    updateNodeMutation.mutate({
      id: selectedNode.id,
      node: {
        type: nodeForm.type,
        message: nodeForm.message,
        position: parseInt(nodeForm.position.toString()),
        variables,
      },
    });
  };

  const handleDeleteNode = (id: number) => {
    if (window.confirm("Are you sure you want to delete this node?")) {
      deleteNodeMutation.mutate(id);
    }
  };

  const resetFlowForm = () => {
    setFlowForm({
      name: "",
      description: "",
      triggerKeywords: "",
      isActive: true,
      isDefault: false,
    });
    setSelectedFlow(null);
  };

  const resetNodeForm = () => {
    setNodeForm({
      type: "message",
      message: "",
      position: 1,
      variables: "",
    });
    setSelectedNode(null);
  };

  const editFlow = (flow: ChatbotFlow) => {
    setSelectedFlow(flow);
    setFlowForm({
      name: flow.name,
      description: flow.description,
      triggerKeywords: flow.triggerKeywords.join(", "),
      isActive: flow.isActive,
      isDefault: flow.isDefault,
    });
    setIsFlowDialogOpen(true);
  };

  const editNode = (node: ChatbotNode) => {
    setSelectedNode(node);
    setNodeForm({
      type: node.type,
      message: node.message,
      position: node.position,
      variables: node.variables.join(", "),
    });
    setIsNodeDialogOpen(true);
  };

  const selectFlow = (flow: ChatbotFlow) => {
    setSelectedFlow(flow);
  };

  if (isLoadingFlows) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (flowsError) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Error loading chatbot flows</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">WhatsApp Chatbot Flows</h1>
          <Dialog open={isFlowDialogOpen} onOpenChange={setIsFlowDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetFlowForm();
                setIsFlowDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" /> New Flow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedFlow ? "Edit Flow" : "Create New Flow"}
                </DialogTitle>
                <DialogDescription>
                  {selectedFlow
                    ? "Update the details of your chatbot flow"
                    : "Create a new chatbot flow to automate your WhatsApp responses"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={selectedFlow ? handleUpdateFlow : handleCreateFlow}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={flowForm.name}
                      onChange={(e) =>
                        setFlowForm({ ...flowForm, name: e.target.value })
                      }
                      placeholder="Flow name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={flowForm.description}
                      onChange={(e) =>
                        setFlowForm({ ...flowForm, description: e.target.value })
                      }
                      placeholder="Flow description"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="triggerKeywords">
                      Trigger Keywords (comma separated)
                    </Label>
                    <Input
                      id="triggerKeywords"
                      value={flowForm.triggerKeywords}
                      onChange={(e) =>
                        setFlowForm({
                          ...flowForm,
                          triggerKeywords: e.target.value,
                        })
                      }
                      placeholder="hello, hi, start, begin"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={flowForm.isActive}
                        onCheckedChange={(checked) =>
                          setFlowForm({ ...flowForm, isActive: checked })
                        }
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isDefault"
                        checked={flowForm.isDefault}
                        onCheckedChange={(checked) =>
                          setFlowForm({ ...flowForm, isDefault: checked })
                        }
                      />
                      <Label htmlFor="isDefault">Default Flow</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetFlowForm();
                      setIsFlowDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createFlowMutation.isPending || updateFlowMutation.isPending}>
                    {createFlowMutation.isPending || updateFlowMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {selectedFlow ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>{selectedFlow ? "Update Flow" : "Create Flow"}</>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Chatbot Flows</CardTitle>
                <CardDescription>
                  {flows?.length === 0
                    ? "No flows created yet"
                    : `${flows?.length} flows available`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {flows?.map((flow) => (
                    <div
                      key={flow.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors flex justify-between items-center ${
                        selectedFlow?.id === flow.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => selectFlow(flow)}
                    >
                      <div>
                        <p className="font-medium">{flow.name}</p>
                        <div className="flex gap-2 mt-1">
                          {flow.isActive && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              Active
                            </Badge>
                          )}
                          {flow.isDefault && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            {selectedFlow ? (
              <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle>{selectedFlow.name}</CardTitle>
                    <CardDescription>{selectedFlow.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editFlow(selectedFlow)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteFlow(selectedFlow.id)}
                      disabled={deleteFlowMutation.isPending}
                    >
                      {deleteFlowMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}
                      {deleteFlowMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="nodes">
                    <TabsList className="mb-4">
                      <TabsTrigger value="nodes">Nodes</TabsTrigger>
                      <TabsTrigger value="triggers">Triggers</TabsTrigger>
                    </TabsList>
                    <TabsContent value="nodes">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Flow Nodes</h3>
                        <Dialog open={isNodeDialogOpen} onOpenChange={setIsNodeDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => {
                                resetNodeForm();
                                setIsNodeDialogOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" /> Add Node
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {selectedNode ? "Edit Node" : "Create New Node"}
                              </DialogTitle>
                              <DialogDescription>
                                {selectedNode
                                  ? "Update the details of your chatbot node"
                                  : "Create a new node for your chatbot flow"}
                              </DialogDescription>
                            </DialogHeader>
                            <form
                              onSubmit={
                                selectedNode ? handleUpdateNode : handleCreateNode
                              }
                            >
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="nodeType">Node Type</Label>
                                  <Select
                                    value={nodeForm.type}
                                    onValueChange={(value) =>
                                      setNodeForm({ ...nodeForm, type: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select node type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="start">Start</SelectItem>
                                      <SelectItem value="message">Message</SelectItem>
                                      <SelectItem value="question">Question</SelectItem>
                                      <SelectItem value="condition">Condition</SelectItem>
                                      <SelectItem value="end">End</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="message">Message</Label>
                                  <Textarea
                                    id="message"
                                    value={nodeForm.message}
                                    onChange={(e) =>
                                      setNodeForm({
                                        ...nodeForm,
                                        message: e.target.value,
                                      })
                                    }
                                    placeholder="Node message or content"
                                    required
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="position">Position</Label>
                                  <Input
                                    id="position"
                                    type="number"
                                    min="1"
                                    value={nodeForm.position}
                                    onChange={(e) =>
                                      setNodeForm({
                                        ...nodeForm,
                                        position: parseInt(e.target.value) || 1,
                                      })
                                    }
                                    required
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="variables">
                                    Variables (comma separated)
                                  </Label>
                                  <Input
                                    id="variables"
                                    value={nodeForm.variables}
                                    onChange={(e) =>
                                      setNodeForm({
                                        ...nodeForm,
                                        variables: e.target.value,
                                      })
                                    }
                                    placeholder="name, phone, email"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    resetNodeForm();
                                    setIsNodeDialogOpen(false);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="submit"
                                  disabled={
                                    createNodeMutation.isPending ||
                                    updateNodeMutation.isPending
                                  }
                                >
                                  {createNodeMutation.isPending ||
                                  updateNodeMutation.isPending ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      {selectedNode ? "Updating..." : "Creating..."}
                                    </>
                                  ) : (
                                    <>{selectedNode ? "Update Node" : "Create Node"}</>
                                  )}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      {isLoadingNodes ? (
                        <div className="flex justify-center items-center h-40">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : nodes && nodes.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Position</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Message</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {nodes
                              .sort((a, b) => a.position - b.position)
                              .map((node) => (
                                <TableRow key={node.id}>
                                  <TableCell>{node.position}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className={
                                        node.type === "start"
                                          ? "bg-green-100 text-green-800 border-green-200"
                                          : node.type === "end"
                                          ? "bg-red-100 text-red-800 border-red-200"
                                          : node.type === "condition"
                                          ? "bg-purple-100 text-purple-800 border-purple-200"
                                          : node.type === "question"
                                          ? "bg-blue-100 text-blue-800 border-blue-200"
                                          : "bg-gray-100 text-gray-800 border-gray-200"
                                      }
                                    >
                                      {node.type.charAt(0).toUpperCase() +
                                        node.type.slice(1)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="max-w-xs truncate">
                                    {node.message}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => editNode(node)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDeleteNode(node.id)}
                                        disabled={deleteNodeMutation.isPending}
                                      >
                                        {deleteNodeMutation.isPending ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center p-8 border rounded-md bg-muted/20">
                          <p className="text-muted-foreground">
                            No nodes created yet. Add your first node to get
                            started.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="triggers">
                      <div className="mb-4">
                        <h3 className="text-lg font-medium mb-2">Trigger Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedFlow.triggerKeywords.length > 0 ? (
                            selectedFlow.triggerKeywords.map((keyword, index) => (
                              <Badge key={index} variant="secondary">
                                {keyword}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-muted-foreground">
                              No trigger keywords set. Add keywords to trigger
                              this flow.
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-2">Flow Details</h3>
                        <dl className="space-y-2">
                          <div className="flex flex-wrap">
                            <dt className="w-32 font-medium">Status:</dt>
                            <dd>
                              {selectedFlow.isActive ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                  Inactive
                                </Badge>
                              )}
                            </dd>
                          </div>
                          <div className="flex flex-wrap">
                            <dt className="w-32 font-medium">Default:</dt>
                            <dd>
                              {selectedFlow.isDefault ? (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                  Default Flow
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                                  Regular Flow
                                </Badge>
                              )}
                            </dd>
                          </div>
                          <div className="flex flex-wrap">
                            <dt className="w-32 font-medium">Created:</dt>
                            <dd>
                              {new Date(selectedFlow.createdAt).toLocaleDateString()}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">
                      Select a Flow or Create a New One
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Chatbot flows let you automate responses based on user
                      messages and create interactive conversations
                    </p>
                    <Button onClick={() => setIsFlowDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Create New Flow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChatbotFlowsPage;