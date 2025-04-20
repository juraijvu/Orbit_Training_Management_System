import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  Settings as SettingsIcon,
  Building,
  Globe,
  CreditCard,
  Lock,
  Trash2,
  Edit,
  Plus,
} from "lucide-react";

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string;
}

interface NewUser {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

interface Institute {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
}

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phone: "",
    role: "counselor",
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [institute, setInstitute] = useState<Institute>({
    name: "Orbit Institute",
    address: "Dubai, UAE",
    phone: "+971 50 123 4567",
    email: "info@orbitinstitute.com",
    website: "www.orbitinstitute.com",
    logo: "",
  });

  // Fetch users
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/users");
        if (!response.ok) throw new Error("Failed to fetch users");
        return await response.json();
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
    },
    enabled: user?.role === "superadmin" || user?.role === "admin",
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: NewUser) => {
      const response = await apiRequest("POST", "/api/users", userData);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create user");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User created successfully",
      });
      setIsUserDialogOpen(false);
      resetNewUserForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const { id, ...updateData } = userData;
      const response = await apiRequest(
        "PATCH",
        `/api/users/${id}`,
        updateData
      );
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update user");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsUserDialogOpen(false);
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/users/${userId}`);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to delete user");
      }
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Update institute settings mutation
  const updateInstituteMutation = useMutation({
    mutationFn: async (instituteData: Institute) => {
      const response = await apiRequest(
        "POST",
        "/api/settings/institute",
        instituteData
      );
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update institute settings");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Institute settings updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update institute settings",
        variant: "destructive",
      });
    },
  });

  const resetNewUserForm = () => {
    setNewUser({
      username: "",
      password: "",
      fullName: "",
      email: "",
      phone: "",
      role: "counselor",
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(newUser);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        fullName: editingUser.fullName,
        email: editingUser.email || "",
        phone: editingUser.phone || "",
        role: editingUser.role,
      });
    }
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsUserDialogOpen(true);
  };

  const handleUpdateInstitute = (e: React.FormEvent) => {
    e.preventDefault();
    updateInstituteMutation.mutate(institute);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof NewUser
  ) => {
    setNewUser({ ...newUser, [field]: e.target.value });
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof User
  ) => {
    if (editingUser) {
      setEditingUser({ ...editingUser, [field]: e.target.value });
    }
  };

  const handleInstituteChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Institute
  ) => {
    setInstitute({ ...institute, [field]: e.target.value });
  };

  // Check if user has permission to view settings
  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to access settings.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">
            <SettingsIcon className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="institute">
            <Building className="h-4 w-4 mr-2" />
            Institute
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Globe className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="gst">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gst">GST (Gulf Standard Time)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select defaultValue="dd/mm/yyyy">
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue="aed">
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aed">AED (UAE Dirham)</SelectItem>
                      <SelectItem value="usd">USD (US Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="mt-6">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Management */}
        <TabsContent value="users">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">User Management</h2>
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingUser(null);
                    resetNewUserForm();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? "Edit User" : "Add New User"}
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
                >
                  <div className="grid gap-4 py-4">
                    {!editingUser && (
                      <>
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={newUser.username}
                            onChange={(e) => handleInputChange(e, "username")}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => handleInputChange(e, "password")}
                            required
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={editingUser ? editingUser.fullName : newUser.fullName}
                        onChange={(e) =>
                          editingUser
                            ? handleEditInputChange(e, "fullName")
                            : handleInputChange(e, "fullName")
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editingUser ? editingUser.email || "" : newUser.email}
                        onChange={(e) =>
                          editingUser
                            ? handleEditInputChange(e, "email")
                            : handleInputChange(e, "email")
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={editingUser ? editingUser.phone || "" : newUser.phone}
                        onChange={(e) =>
                          editingUser
                            ? handleEditInputChange(e, "phone")
                            : handleInputChange(e, "phone")
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={editingUser ? editingUser.role : newUser.role}
                        onValueChange={(value) =>
                          editingUser
                            ? setEditingUser({ ...editingUser, role: value })
                            : setNewUser({ ...newUser, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="counselor">Counselor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          {user?.role === "superadmin" && (
                            <SelectItem value="superadmin">Super Admin</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={createUserMutation.isPending}>
                      {createUserMutation.isPending
                        ? "Saving..."
                        : editingUser
                        ? "Update User"
                        : "Add User"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUsers ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : usersError ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-red-500">
                        Error loading users
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Link href={`/profile/${user.id}`} className="text-primary hover:underline">
                            {user.fullName}
                          </Link>
                        </TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              user.role === "superadmin"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "admin"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Institute Settings */}
        <TabsContent value="institute">
          <Card>
            <CardHeader>
              <CardTitle>Institute Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateInstitute}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="instituteName">Institute Name</Label>
                    <Input
                      id="instituteName"
                      value={institute.name}
                      onChange={(e) => handleInstituteChange(e, "name")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="instituteEmail">Email</Label>
                    <Input
                      id="instituteEmail"
                      type="email"
                      value={institute.email}
                      onChange={(e) => handleInstituteChange(e, "email")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="institutePhone">Phone</Label>
                    <Input
                      id="institutePhone"
                      value={institute.phone}
                      onChange={(e) => handleInstituteChange(e, "phone")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="instituteWebsite">Website</Label>
                    <Input
                      id="instituteWebsite"
                      value={institute.website}
                      onChange={(e) => handleInstituteChange(e, "website")}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <Label htmlFor="instituteAddress">Address</Label>
                    <Input
                      id="instituteAddress"
                      value={institute.address}
                      onChange={(e) => handleInstituteChange(e, "address")}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <Label htmlFor="instituteLogo">Logo</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="instituteLogo"
                        value={institute.logo}
                        onChange={(e) => handleInstituteChange(e, "logo")}
                        placeholder="Enter logo URL or upload"
                      />
                      <Button type="button" variant="outline">
                        Upload Logo
                      </Button>
                    </div>
                  </div>
                </div>

                <Button className="mt-6" type="submit" disabled={updateInstituteMutation.isPending}>
                  {updateInstituteMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Website Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">WordPress / Elementor</h3>
                  <p className="text-sm mb-4">
                    Connect your WordPress website with Elementor to sync leads and
                    registrations.
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="wpSite1">Website URL</Label>
                      <Input
                        id="wpSite1"
                        placeholder="https://your-website.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wpKey1">API Key</Label>
                      <Input id="wpKey1" placeholder="Enter API key" />
                    </div>
                  </div>
                  <Button className="mt-4" variant="outline">
                    Connect Website
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">
                    MetaBusiness Suite
                  </h3>
                  <p className="text-sm mb-4">
                    Connect Meta Business Suite to import leads from Facebook and
                    Instagram.
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="metaAccount">Account ID</Label>
                      <Input id="metaAccount" placeholder="Enter account ID" />
                    </div>
                    <div>
                      <Label htmlFor="metaToken">Access Token</Label>
                      <Input id="metaToken" placeholder="Enter access token" />
                    </div>
                  </div>
                  <Button className="mt-4" variant="outline">
                    Connect Meta Business
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">LinkedIn</h3>
                  <p className="text-sm mb-4">
                    Connect LinkedIn to import leads from LinkedIn Lead Gen Forms.
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linkedinId">Client ID</Label>
                      <Input id="linkedinId" placeholder="Enter client ID" />
                    </div>
                    <div>
                      <Label htmlFor="linkedinSecret">Client Secret</Label>
                      <Input
                        id="linkedinSecret"
                        placeholder="Enter client secret"
                      />
                    </div>
                  </div>
                  <Button className="mt-4" variant="outline">
                    Connect LinkedIn
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Stripe</h3>
                  <p className="text-sm mb-4">
                    Connect Stripe to accept credit card payments and generate
                    payment links.
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stripePublic">Publishable Key</Label>
                      <Input
                        id="stripePublic"
                        placeholder="pk_test_..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="stripeSecret">Secret Key</Label>
                      <Input
                        id="stripeSecret"
                        placeholder="sk_test_..."
                        type="password"
                      />
                    </div>
                  </div>
                  <Button className="mt-4" variant="outline">
                    Connect Stripe
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Tabby</h3>
                  <p className="text-sm mb-4">
                    Connect Tabby to offer "Buy Now, Pay Later" payment options.
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tabbyPublic">Public Key</Label>
                      <Input
                        id="tabbyPublic"
                        placeholder="Enter Tabby public key"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tabbySecret">Secret Key</Label>
                      <Input
                        id="tabbySecret"
                        placeholder="Enter Tabby secret key"
                        type="password"
                      />
                    </div>
                  </div>
                  <Button className="mt-4" variant="outline">
                    Connect Tabby
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Tamara</h3>
                  <p className="text-sm mb-4">
                    Connect Tamara to offer installment payment options.
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tamaraPublic">Public Key</Label>
                      <Input
                        id="tamaraPublic"
                        placeholder="Enter Tamara public key"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tamaraSecret">Secret Key</Label>
                      <Input
                        id="tamaraSecret"
                        placeholder="Enter Tamara secret key"
                        type="password"
                      />
                    </div>
                  </div>
                  <Button className="mt-4" variant="outline">
                    Connect Tamara
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="2fa">Two-Factor Authentication</Label>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Enhance security by requiring a second form of authentication.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="passwordPolicy">Password Policy</Label>
                    <Select defaultValue="strong">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="strong">Strong</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-gray-500">
                    Set minimum password requirements for all users.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="sessionTimeout">Session Timeout</Label>
                    <Select defaultValue="60">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select timeout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-gray-500">
                    Automatically log out inactive users after the specified time.
                  </p>
                </div>

                <Button className="mt-4">Save Security Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}