import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Download, Share, FileText, Calendar, RefreshCw, Edit, Trash, Eye, CheckCircle2, ImageIcon, FilePlus } from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { insertCrmPostSchema, InsertCrmPost } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// UI components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Enhanced schema with validations
const postFormSchema = insertCrmPostSchema.extend({
  title: z.string().min(2, { message: "Title is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  expiryDate: z.string().optional().transform((val) => val ? new Date(val) : null),
});

type PostFormValues = z.infer<typeof postFormSchema>;

export default function Posts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  // Fetch posts data
  const {
    data: posts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/crm/posts"],
    queryFn: async () => {
      const response = await fetch("/api/crm/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return await response.json();
    },
  });

  // Fetch users data
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return await response.json();
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: FormData) => {
      const res = await fetch("/api/crm/posts", {
        method: "POST",
        body: postData,
      });
      if (!res.ok) {
        throw new Error("Failed to create post");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/posts"] });
      toast({
        title: "Post Created",
        description: "The post has been successfully created.",
      });
      setOpenDialog(false);
      setMediaFile(null);
      setPreviewUrl(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, postData }: { id: number; postData: FormData }) => {
      const res = await fetch(`/api/crm/posts/${id}`, {
        method: "PATCH",
        body: postData,
      });
      if (!res.ok) {
        throw new Error("Failed to update post");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/posts"] });
      toast({
        title: "Post Updated",
        description: "The post has been successfully updated.",
      });
      setOpenDialog(false);
      setIsEditing(false);
      setSelectedPost(null);
      setMediaFile(null);
      setPreviewUrl(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update post",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/crm/posts/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/posts"] });
      toast({
        title: "Post Deleted",
        description: "The post has been successfully deleted.",
      });
      setSelectedPost(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  // View count increment mutation
  const incrementViewMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/crm/posts/${id}/view`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/posts"] });
    },
  });

  // Download count increment mutation
  const incrementDownloadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/crm/posts/${id}/download`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/posts"] });
    },
  });

  // Share count increment mutation
  const incrementShareMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/crm/posts/${id}/share`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/posts"] });
    },
  });

  // Approve post mutation
  const approvePostMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/crm/posts/${id}/approve`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/posts"] });
      toast({
        title: "Post Approved",
        description: "The post has been approved and is now visible to all users.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve post",
        variant: "destructive",
      });
    },
  });

  // Form setup
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "announcement",
      tags: [],
      mediaUrl: "",
      downloadable: true,
      shareable: true,
      expiryDate: "",
    },
  });

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditing(false);
    setSelectedPost(null);
    setMediaFile(null);
    setPreviewUrl(null);
    form.reset();
  };

  // Handle form submission
  const onSubmit = (data: PostFormValues) => {
    // Create FormData object for file upload
    const formData = new FormData();
    
    // Add all form fields to FormData
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (key === "expiryDate" && value) {
          formData.append(key, new Date(value).toISOString());
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    // Add file if it exists
    if (mediaFile) {
      formData.append("file", mediaFile);
    }
    
    // Set createdBy to current user
    formData.append("createdBy", String(user?.id));
    
    if (isEditing && selectedPost) {
      updatePostMutation.mutate({ id: selectedPost.id, postData: formData });
    } else {
      createPostMutation.mutate(formData);
    }
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      
      // Create preview URL for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreviewUrl(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, just show the file name
        setPreviewUrl(null);
      }
    }
  };

  // Edit post handler
  const handleEditPost = (post: any) => {
    setSelectedPost(post);
    setIsEditing(true);
    setPreviewUrl(post.mediaUrl || null);
    
    form.reset({
      ...post,
      expiryDate: post.expiryDate ? format(parseISO(post.expiryDate), "yyyy-MM-dd") : null,
      tags: post.tags || [],
    });
    
    setOpenDialog(true);
  };

  // Handle post view
  const handleViewPost = (post: any) => {
    incrementViewMutation.mutate(post.id);
    window.open(post.mediaUrl, "_blank");
  };

  // Handle post download
  const handleDownloadPost = (post: any) => {
    incrementDownloadMutation.mutate(post.id);
    
    // Create a download link and click it
    const a = document.createElement('a');
    a.href = post.mediaUrl;
    a.download = post.title || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle post share
  const handleSharePost = (post: any) => {
    incrementShareMutation.mutate(post.id);
    
    // Share with Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: post.mediaUrl || window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback to copying URL to clipboard
      const url = post.mediaUrl || window.location.href;
      navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "The link has been copied to your clipboard.",
      });
    }
  };

  // Get creator name
  const getCreatorName = (userId: number) => {
    const user = users.find((u: any) => u.id === userId);
    return user ? user.username : "Unknown";
  };

  // Get post media type icon
  const getMediaTypeIcon = (url: string | null) => {
    if (!url) return <FileText className="h-12 w-12 text-muted-foreground" />;
    
    if (url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) {
      return <ImageIcon className="h-12 w-12 text-blue-500" />;
    } else if (url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i)) {
      return <FileText className="h-12 w-12 text-amber-500" />;
    } else {
      return <FileText className="h-12 w-12 text-muted-foreground" />;
    }
  };

  // Categories
  const categories = [
    { value: "announcement", label: "Announcement" },
    { value: "promotion", label: "Promotion" },
    { value: "course_update", label: "Course Update" },
    { value: "event", label: "Event" },
    { value: "success_story", label: "Success Story" },
    { value: "job_opportunity", label: "Job Opportunity" },
    { value: "other", label: "Other" },
  ];

  // Filter posts by tab and search term
  const filteredPosts = posts.filter((post: any) => {
    // Search filter
    const searchMatch = searchTerm === "" || 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    // Tab filter
    let tabMatch = true;
    if (activeTab === "my") {
      tabMatch = post.createdBy === user?.id;
    } else if (activeTab === "approved") {
      tabMatch = post.approved === true;
    } else if (activeTab === "pending") {
      tabMatch = post.approved === false;
    } else if (activeTab !== "all") {
      tabMatch = post.category === activeTab;
    }
    
    return searchMatch && tabMatch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <h3 className="font-semibold">Error loading posts</h3>
        <p>{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Today's Posts & Status</h1>
          <p className="text-muted-foreground">Share updates, files, and materials with your team</p>
        </div>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Post
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-2/3">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="announcement">Announcements</TabsTrigger>
            <TabsTrigger value="promotion">Promotions</TabsTrigger>
            <TabsTrigger value="course_update">Course Updates</TabsTrigger>
            <TabsTrigger value="my">My Posts</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No posts found</h3>
          <p className="text-muted-foreground mt-2">
            {searchTerm
              ? "No results match your search criteria."
              : "Create your first post to share with the team."}
          </p>
          <Button onClick={() => setOpenDialog(true)} variant="outline" className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Create New Post
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post: any) => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="capitalize">
                        {post.category.replace("_", " ")}
                      </Badge>
                      {post.approved ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                          Pending
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="mt-2">{post.title}</CardTitle>
                    <CardDescription>
                      {post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center py-4">
                  {post.mediaUrl ? (
                    post.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                      <div className="relative aspect-video w-full max-h-48 overflow-hidden rounded-md">
                        <img 
                          src={post.mediaUrl} 
                          alt={post.title} 
                          className="object-cover w-full h-full"
                          onClick={() => handleViewPost(post)}
                        />
                      </div>
                    ) : (
                      <div 
                        className="flex flex-col items-center gap-2 cursor-pointer"
                        onClick={() => handleViewPost(post)}
                      >
                        {getMediaTypeIcon(post.mediaUrl)}
                        <span className="text-sm text-muted-foreground">
                          Click to view file
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      {getMediaTypeIcon(post.mediaUrl)}
                      <span className="text-sm text-muted-foreground">
                        No attachment
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getCreatorName(post.createdBy).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    Posted by {getCreatorName(post.createdBy)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatDistanceToNow(parseISO(post.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <div className="grid grid-cols-4 w-full gap-2 border-t pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex flex-col items-center text-xs gap-1 h-auto py-2"
                    onClick={() => handleViewPost(post)}
                  >
                    <Eye className="h-4 w-4" />
                    {post.viewCount || 0}
                    <span>Views</span>
                  </Button>
                  
                  {post.downloadable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex flex-col items-center text-xs gap-1 h-auto py-2"
                      onClick={() => handleDownloadPost(post)}
                      disabled={!post.mediaUrl}
                    >
                      <Download className="h-4 w-4" />
                      {post.downloadCount || 0}
                      <span>Downloads</span>
                    </Button>
                  )}
                  
                  {post.shareable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex flex-col items-center text-xs gap-1 h-auto py-2"
                      onClick={() => handleSharePost(post)}
                    >
                      <Share className="h-4 w-4" />
                      {post.shareCount || 0}
                      <span>Shares</span>
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex flex-col items-center text-xs gap-1 h-auto py-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                        <span>More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user?.id === post.createdBy && (
                        <>
                          <DropdownMenuItem onClick={() => handleEditPost(post)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Post
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      
                      {user?.role === "superadmin" || user?.role === "admin" ? (
                        <>
                          {!post.approved && (
                            <DropdownMenuItem onClick={() => approvePostMutation.mutate(post.id)}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Approve Post
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this post?")) {
                                deletePostMutation.mutate(post.id);
                              }
                            }}
                            className="text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Post Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Post" : "Create New Post"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the post details and content."
                : "Share updates, files, or materials with your team."}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] overflow-auto">
            <div className="p-1">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Post Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter post title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter post content"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Date when this post will no longer be relevant
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Upload Media (Optional)</FormLabel>
                    <div className="mt-2 border-2 border-dashed rounded-md p-6 relative">
                      <Input
                        id="file-upload"
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                      />
                      <div className="text-center">
                        <FilePlus className="mx-auto h-12 w-12 text-muted-foreground" />
                        <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-semibold text-primary"
                          >
                            <span>Upload a file</span>
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Images, documents, or files up to 10MB
                        </p>
                      </div>

                      {mediaFile && (
                        <div className="mt-4 flex items-center">
                          <div className="text-sm text-muted-foreground">
                            Selected file: <span className="font-medium">{mediaFile.name}</span> ({(mediaFile.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-auto"
                            onClick={() => {
                              setMediaFile(null);
                              setPreviewUrl(null);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {previewUrl && mediaFile?.type.startsWith("image/") && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                          <div className="relative aspect-video max-h-48 overflow-hidden rounded-md">
                            <img 
                              src={previewUrl} 
                              alt="Preview" 
                              className="object-contain w-full h-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <FormLabel>Post Settings</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="downloadable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Allow Downloads</FormLabel>
                              <FormDescription>
                                Let users download attached files
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="shareable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Allow Sharing</FormLabel>
                              <FormDescription>
                                Let users share this post
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseDialog}
                      className="mt-4 sm:mt-0"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="mt-4 sm:mt-0"
                      disabled={createPostMutation.isPending || updatePostMutation.isPending}
                    >
                      {(createPostMutation.isPending || updatePostMutation.isPending) && (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isEditing ? "Update Post" : "Create Post"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}