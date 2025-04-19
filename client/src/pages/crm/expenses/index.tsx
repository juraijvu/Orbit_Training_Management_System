import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  DollarSign,
  FileText,
  Filter,
  Search,
  Plus,
  MoreHorizontal,
  FileDown,
  Trash2,
  PencilLine,
  Calendar,
  BarChart,
  PieChart,
  Tags
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';

// Types
interface Expense {
  id: number;
  date: string;
  category: string;
  amount: number;
  description: string;
  paymentMethod: string;
  receipt?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  addedBy: string;
}

interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
  budget?: number;
}

// Status Badge component
const StatusBadge = ({ status }: { status: Expense['approvalStatus'] }) => {
  const statusConfig = {
    pending: { color: 'bg-amber-100 text-amber-800', label: 'Pending' },
    approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
    rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={`${config.color} border-0`}>
      {config.label}
    </Badge>
  );
};

// Add Expense Dialog Component
const AddExpenseDialog = ({ 
  isOpen, 
  setIsOpen 
}: { 
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Expense Added",
      description: "The expense has been recorded successfully",
    });
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Record a new company expense. Required fields are marked with an asterisk.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <DatePicker
                  date={date}
                  setDate={setDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (AED) *</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">Office Supplies</SelectItem>
                  <SelectItem value="marketing">Marketing & Advertising</SelectItem>
                  <SelectItem value="rent">Rent & Utilities</SelectItem>
                  <SelectItem value="equipment">Equipment & Maintenance</SelectItem>
                  <SelectItem value="travel">Travel & Transportation</SelectItem>
                  <SelectItem value="meals">Meals & Entertainment</SelectItem>
                  <SelectItem value="software">Software & Subscriptions</SelectItem>
                  <SelectItem value="training">Training & Development</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea 
                id="description" 
                placeholder="Detailed description of the expense" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="creditCard">Credit Card</SelectItem>
                  <SelectItem value="bankTransfer">Bank Transfer</SelectItem>
                  <SelectItem value="companyCard">Company Card</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt">Receipt (Optional)</Label>
              <Input id="receipt" type="file" />
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: JPG, PNG, PDF. Max file size: 5MB
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">
              Save Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Add Category Dialog Component
const AddCategoryDialog = ({ 
  isOpen, 
  setIsOpen 
}: { 
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const { toast } = useToast();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Category Added",
      description: "The expense category has been added successfully",
    });
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Expense Category</DialogTitle>
          <DialogDescription>
            Create a new category for classifying expenses
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input 
                id="name" 
                placeholder="e.g., Office Supplies" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Brief description of this expense category" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">
                Monthly Budget (AED)
                <span className="text-muted-foreground ml-1 text-sm">(Optional)</span>
              </Label>
              <Input 
                id="budget" 
                type="number" 
                placeholder="0.00" 
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">
              Add Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main component
const ExpensesManagement: React.FC<{ showAddDialog?: boolean }> = ({ showAddDialog = false }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('current-month');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(showAddDialog);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState<boolean>(false);
  
  // Example expense data
  const expenseData: Expense[] = [
    { 
      id: 1, 
      date: '2025-04-15', 
      category: 'Office Supplies', 
      amount: 1250.00, 
      description: 'Monthly office supplies - paper, pens, notebooks, printer ink', 
      paymentMethod: 'Company Card',
      approvalStatus: 'approved',
      addedBy: 'Aisha Khan'
    },
    { 
      id: 2, 
      date: '2025-04-12', 
      category: 'Marketing & Advertising', 
      amount: 4500.00, 
      description: 'Google Ads campaign for new courses - April', 
      paymentMethod: 'Credit Card',
      approvalStatus: 'approved',
      addedBy: 'Mohammed Rahman'
    },
    { 
      id: 3, 
      date: '2025-04-10', 
      category: 'Software & Subscriptions', 
      amount: 1899.00, 
      description: 'Annual subscription for Adobe Creative Cloud', 
      paymentMethod: 'Bank Transfer',
      approvalStatus: 'approved',
      addedBy: 'Sara Al Jaber'
    },
    { 
      id: 4, 
      date: '2025-04-08', 
      category: 'Travel & Transportation', 
      amount: 875.50, 
      description: 'Taxi expenses for corporate client meetings', 
      paymentMethod: 'Cash',
      approvalStatus: 'pending',
      addedBy: 'Fatima Ali'
    },
    { 
      id: 5, 
      date: '2025-04-05', 
      category: 'Equipment & Maintenance', 
      amount: 7899.00, 
      description: 'New projector for training room B', 
      paymentMethod: 'Company Card',
      approvalStatus: 'pending',
      addedBy: 'Rahul Patel'
    },
  ];

  // Example category data
  const categories: ExpenseCategory[] = [
    { id: 1, name: 'Office Supplies', budget: 2000 },
    { id: 2, name: 'Marketing & Advertising', budget: 10000 },
    { id: 3, name: 'Rent & Utilities', budget: 15000 },
    { id: 4, name: 'Equipment & Maintenance', budget: 5000 },
    { id: 5, name: 'Travel & Transportation', budget: 3000 },
    { id: 6, name: 'Meals & Entertainment', budget: 2000 },
    { id: 7, name: 'Software & Subscriptions', budget: 3500 },
    { id: 8, name: 'Training & Development', budget: 4000 },
    { id: 9, name: 'Other', budget: 1000 },
  ];
  
  // Filter expenses
  const filteredExpenses = expenseData.filter(expense => {
    const matchesSearch = 
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.addedBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || expense.category.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || expense.approvalStatus === statusFilter;
    
    // For date range filtering (simplified for this example)
    let matchesDateRange = true;
    if (dateRange !== 'all') {
      // In a real implementation, this would check the actual date range
      matchesDateRange = true;
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDateRange;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', { 
      style: 'currency', 
      currency: 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Calculate expense statistics
  const totalExpenses = expenseData.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = expenseData
    .filter(expense => expense.approvalStatus === 'pending')
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  // Get top spending categories
  const categorySpending = categories.map(category => {
    const total = expenseData
      .filter(expense => expense.category === category.name)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      name: category.name,
      total,
      budget: category.budget || 0,
      percentage: category.budget ? (total / category.budget) * 100 : 0
    };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Company Expenses</h1>
          <p className="text-muted-foreground">
            Manage and track all company expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/crm/dashboard">
              <span className="mr-2">Back to Dashboard</span>
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setIsAddCategoryOpen(true)}>
            <Tags className="mr-2 h-4 w-4" />
            Add Category
          </Button>
          <Button onClick={() => setIsAddExpenseOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="py-3">
            <CardDescription>Total Expenses (April 2025)</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{formatCurrency(totalExpenses)}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardDescription>Pending Approval</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-amber-600">{formatCurrency(pendingExpenses)}</CardTitle>
              <FileText className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardDescription>Largest Expense Category</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{categorySpending[0]?.name || 'N/A'}</CardTitle>
              <PieChart className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="expenses" className="mb-6">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="categories">Categories & Budgets</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 md:justify-between">
                <div className="flex flex-1 gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search expenses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select 
                    value={dateRange} 
                    onValueChange={setDateRange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current-month">Current Month</SelectItem>
                      <SelectItem value="previous-month">Previous Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={categoryFilter} 
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.name.toLowerCase()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={statusFilter} 
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Table */}
          <Card>
            <CardHeader className="py-4">
              <div className="flex justify-between items-center">
                <CardTitle>Expense Records</CardTitle>
                <Button variant="outline" size="sm">
                  <FileDown className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{expense.description}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(expense.amount)}</TableCell>
                        <TableCell>{expense.paymentMethod}</TableCell>
                        <TableCell>
                          <StatusBadge status={expense.approvalStatus} />
                        </TableCell>
                        <TableCell>{expense.addedBy}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <PencilLine className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                View Receipt
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No expense records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          {/* Categories & Budgets */}
          <Card>
            <CardHeader className="py-4">
              <div className="flex justify-between items-center">
                <CardTitle>Expense Categories & Budgets</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsAddCategoryOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Monthly Budget</TableHead>
                    <TableHead>Current Spending</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => {
                    const spending = categorySpending.find(cs => cs.name === category.name);
                    return (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{category.description || '-'}</TableCell>
                        <TableCell>{category.budget ? formatCurrency(category.budget) : 'No budget set'}</TableCell>
                        <TableCell>{formatCurrency(spending?.total || 0)}</TableCell>
                        <TableCell>
                          {category.budget ? (
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    (spending?.percentage || 0) > 90 
                                      ? 'bg-red-600' 
                                      : (spending?.percentage || 0) > 70 
                                      ? 'bg-amber-600' 
                                      : 'bg-green-600'
                                  }`} 
                                  style={{ width: `${Math.min(spending?.percentage || 0, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm">{Math.round(spending?.percentage || 0)}%</span>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <PencilLine className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BarChart className="mr-2 h-4 w-4" />
                                View Spending
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          {/* Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Expense Summary</CardTitle>
                <CardDescription>Total expenses by month for the current year</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="mb-2">Monthly expense trend charts will appear here</p>
                  <p className="text-sm">Showing data for January - December 2025</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Expense Distribution</CardTitle>
                <CardDescription>Breakdown of expenses by category</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <PieChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="mb-2">Category distribution chart will appear here</p>
                  <p className="text-sm">Showing current month's data</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Budget vs. Actual Spending</CardTitle>
                <CardDescription>Comparison of budgeted amounts against actual spending</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="mb-2">Budget comparison charts will appear here</p>
                  <p className="text-sm">Showing data for all categories with budgets</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddExpenseDialog 
        isOpen={isAddExpenseOpen} 
        setIsOpen={setIsAddExpenseOpen}
      />
      
      <AddCategoryDialog
        isOpen={isAddCategoryOpen}
        setIsOpen={setIsAddCategoryOpen}
      />
    </div>
  );
};

export default ExpensesManagement;