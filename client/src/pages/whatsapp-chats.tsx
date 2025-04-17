import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Phone, User, MessageSquare, Paperclip, Image as ImageIcon, Info, Mic } from "lucide-react";

export default function WhatsappChatsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const messageEndRef = useRef(null);
  const [activeTab, setActiveTab] = useState("assigned");
  
  // Query to fetch WhatsApp chats
  const { 
    data: chats = [],
    isLoading: isLoadingChats
  } = useQuery({
    queryKey: ['/api/whatsapp/chats', user?.id],
    enabled: !!user
  });

  // Query to fetch messages for selected chat
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    refetch: refetchMessages
  } = useQuery({
    queryKey: ['/api/whatsapp/messages', selectedChat?.id],
    enabled: !!selectedChat
  });

  // Query to fetch all leads
  const {
    data: leads = [],
    isLoading: isLoadingLeads
  } = useQuery({
    queryKey: ['/api/crm/leads'],
    enabled: !!user
  });

  // Mutation to send a message
  const sendMessageMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest(
        "POST", 
        "/api/whatsapp/messages/send", 
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      setMessage("");
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/chats', user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation to assign chat to consultant
  const assignChatMutation = useMutation({
    mutationFn: async ({ chatId, consultantId }) => {
      const res = await apiRequest(
        "PUT", 
        `/api/whatsapp/chats/${chatId}/assign`, 
        { consultantId }
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Chat Assigned",
        description: "Chat has been assigned to the consultant",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/chats', user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const assignedChats = chats.filter(chat => 
    chat.consultantId === user?.id || 
    (user?.role === "admin" || user?.role === "superadmin")
  );

  const unassignedChats = chats.filter(chat => 
    !chat.consultantId && (user?.role === "admin" || user?.role === "superadmin")
  );

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    // Mark as read logic would go here
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    sendMessageMutation.mutate({
      chatId: selectedChat.id,
      content: message,
      sentBy: user.id
    });
  };

  const handleAssignToMe = () => {
    if (selectedChat) {
      assignChatMutation.mutate({
        chatId: selectedChat.id,
        consultantId: user.id
      });
    }
  };

  // Scroll to bottom of messages when new ones come in
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Get lead info for the selected chat
  const getLeadInfo = (leadId) => {
    return leads.find(lead => lead.id === leadId);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">WhatsApp Conversations</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardHeader className="p-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="assigned">
                  My Chats {assignedChats.length > 0 && <Badge className="ml-1">{assignedChats.length}</Badge>}
                </TabsTrigger>
                {(user?.role === "admin" || user?.role === "superadmin") && (
                  <TabsTrigger value="unassigned">
                    Unassigned {unassignedChats.length > 0 && <Badge variant="secondary" className="ml-1">{unassignedChats.length}</Badge>}
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-240px)]">
              <TabsContent value="assigned" className="mt-0">
                {isLoadingChats ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : assignedChats.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No assigned chats</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {assignedChats.map(chat => {
                      const lead = getLeadInfo(chat.leadId);
                      return (
                        <div 
                          key={chat.id}
                          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-accent transition-colors ${selectedChat?.id === chat.id ? 'bg-accent' : ''}`}
                          onClick={() => handleSelectChat(chat)}
                        >
                          <Avatar>
                            <AvatarFallback>{lead?.fullName?.[0] || 'U'}</AvatarFallback>
                            <AvatarImage src="/placeholder-avatar.jpg" />
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <p className="font-medium truncate">{lead?.fullName || 'Unknown Lead'}</p>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(chat.lastMessageTime), 'HH:mm')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <p className="text-sm text-muted-foreground truncate">
                                {chat.phoneNumber}
                              </p>
                              {chat.unreadCount > 0 && (
                                <Badge variant="secondary" className="ml-1">{chat.unreadCount}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="unassigned" className="mt-0">
                {isLoadingChats ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : unassignedChats.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No unassigned chats</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {unassignedChats.map(chat => {
                      const lead = getLeadInfo(chat.leadId);
                      return (
                        <div 
                          key={chat.id}
                          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-accent transition-colors ${selectedChat?.id === chat.id ? 'bg-accent' : ''}`}
                          onClick={() => handleSelectChat(chat)}
                        >
                          <Avatar>
                            <AvatarFallback>{lead?.fullName?.[0] || 'U'}</AvatarFallback>
                            <AvatarImage src="/placeholder-avatar.jpg" />
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <p className="font-medium truncate">{lead?.fullName || 'Unknown Lead'}</p>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(chat.lastMessageTime), 'HH:mm')}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <p className="text-sm text-muted-foreground truncate">
                                {chat.phoneNumber}
                              </p>
                              <Badge className="ml-2" variant="outline">New</Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Chat Messages */}
        <Card className="lg:col-span-3">
          {selectedChat ? (
            <>
              <CardHeader className="px-4 py-3 border-b flex flex-row items-center space-y-0">
                <div className="flex items-center flex-1">
                  <Avatar className="h-9 w-9 mr-2">
                    <AvatarFallback>
                      {getLeadInfo(selectedChat.leadId)?.fullName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {getLeadInfo(selectedChat.leadId)?.fullName || 'Unknown Lead'}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {selectedChat.phoneNumber}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!selectedChat.consultantId && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleAssignToMe}
                      disabled={assignChatMutation.isPending}
                    >
                      {assignChatMutation.isPending && (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      )}
                      Assign to me
                    </Button>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Lead Information</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {isLoadingLeads ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : (
                          <>
                            {getLeadInfo(selectedChat.leadId) && (
                              <div className="space-y-3">
                                <div>
                                  <p className="font-medium">Full Name</p>
                                  <p>{getLeadInfo(selectedChat.leadId).fullName}</p>
                                </div>
                                <div>
                                  <p className="font-medium">Email</p>
                                  <p>{getLeadInfo(selectedChat.leadId).email || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="font-medium">Phone</p>
                                  <p>{getLeadInfo(selectedChat.leadId).phone}</p>
                                </div>
                                <div>
                                  <p className="font-medium">WhatsApp</p>
                                  <p>{getLeadInfo(selectedChat.leadId).whatsappNumber || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="font-medium">Status</p>
                                  <Badge>{getLeadInfo(selectedChat.leadId).status}</Badge>
                                </div>
                                <div>
                                  <p className="font-medium">Source</p>
                                  <p>{getLeadInfo(selectedChat.leadId).source}</p>
                                </div>
                                <div>
                                  <p className="font-medium">Notes</p>
                                  <p className="text-sm">{getLeadInfo(selectedChat.leadId).notes || 'No notes'}</p>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[calc(100vh-280px)]">
                <ScrollArea className="flex-1 p-4">
                  {isLoadingMessages ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium">No messages yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Start the conversation by sending a message.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`flex ${msg.direction === 'inbound' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div 
                            className={`max-w-[70%] px-4 py-2 rounded-lg ${
                              msg.direction === 'inbound' 
                                ? 'bg-secondary text-secondary-foreground' 
                                : 'bg-primary text-primary-foreground'
                            }`}
                          >
                            {msg.mediaUrl && (
                              <div className="mb-2">
                                {msg.mediaType === 'image' ? (
                                  <img 
                                    src={msg.mediaUrl} 
                                    alt="Media" 
                                    className="rounded-md max-h-40 object-contain"
                                  />
                                ) : (
                                  <div className="flex items-center space-x-2 p-2 bg-background/20 rounded">
                                    <Paperclip className="h-4 w-4" />
                                    <span className="text-sm">Attachment</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            <div className="flex justify-end items-center mt-1 space-x-1">
                              <span className="text-xs opacity-70">
                                {format(new Date(msg.timestamp), 'HH:mm')}
                              </span>
                              {msg.direction === 'outbound' && (
                                <span className="text-xs opacity-70">
                                  {msg.status === 'sent' && '✓'}
                                  {msg.status === 'delivered' && '✓✓'}
                                  {msg.status === 'read' && '✓✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messageEndRef} />
                    </div>
                  )}
                </ScrollArea>
                
                <form 
                  onSubmit={handleSendMessage} 
                  className="border-t p-3 flex items-center gap-2"
                >
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    className="shrink-0"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <MessageSquare className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">WhatsApp Conversations</h2>
              <p className="text-center text-muted-foreground max-w-md mb-6">
                Select a chat from the list to view and send messages. You can communicate directly with leads and students via WhatsApp.
              </p>
              <p className="text-sm text-muted-foreground">
                {assignedChats.length === 0 ? (
                  "No chats are currently assigned to you."
                ) : (
                  `You have ${assignedChats.length} active chat${assignedChats.length !== 1 ? 's' : ''}.`
                )}
                {unassignedChats.length > 0 && user?.role === "admin" || user?.role === "superadmin" ? (
                  ` There are ${unassignedChats.length} unassigned chat${unassignedChats.length !== 1 ? 's' : ''} waiting for attention.`
                ) : ''}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}