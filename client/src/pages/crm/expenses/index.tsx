import { FC, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  DollarSign,
  BarChart2,
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from '@/components/ui/progress';

interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  receiptUrl?: string;
}

interface ExpenseSummary {
  totalExpenses: number;
  monthlyExpenses: number;
  categorySummary: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  recentExpenses: Expense[];
}

interface ExpensesPageProps {
  showAddDialog?: boolean;
}

const ExpensesPage: FC<ExpensesPageProps> = ({ showAddDialog = false }) => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  // Fetch expense data
  const { data: expenseData, isLoading } = useQuery<ExpenseSummary>({
    queryKey: ['/api/crm/expenses/summary'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return {
        totalExpenses: 425650,
        monthlyExpenses: 68750,
        categorySummary: [
          { category: 'Marketing', amount: 152300, percentage: 35.8 },
          { category: 'Office Supplies', amount: 58200, percentage: 13.7 },
          { category: 'Rent', amount: 120000, percentage: 28.2 },
          { category: 'Utilities', amount: 35400, percentage: 8.3 },
          { category: 'Travel', amount: 25000, percentage: 5.9 },
          { category: 'Training', amount: 22000, percentage: 5.2 },
          { category: 'Miscellaneous', amount: 12750, percentage: 3 }
        ],
        recentExpenses: [
          {
            id: 1,
            date: '2025-04-15',
            category: 'Marketing',
            description: 'Social media advertising campaign',
            amount: 12500,
            paymentMethod: 'Credit Card',
            status: 'approved',
            submittedBy: 'Mohammed Rahman'
          },
          {
            id: 2,
            date: '2025-04-14',
            category: 'Office Supplies',
            description: 'Printer cartridges and paper',
            amount: 3200,
            paymentMethod: 'Cash',
            status: 'approved',
            submittedBy: 'Sara Al Jaber'
          },
          {
            id: 3,
            date: '2025-04-13',
            category: 'Travel',
            description: 'Flight tickets for conference',
            amount: 8500,
            paymentMethod: 'Corporate Card',
            status: 'pending',
            submittedBy: 'Ahmed Al Mansouri'
          },
          {
            id: 4,
            date: '2025-04-12',
            category: 'Training',
            description: 'Train the trainer workshop',
            amount: 15000,
            paymentMethod: 'Bank Transfer',
            status: 'approved',
            submittedBy: 'Jamal Hassan'
          },
          {
            id: 5,
            date: '2025-04-10',
            category: 'Utilities',
            description: 'Electricity and water bill',
            amount: 8750,
            paymentMethod: 'Direct Debit',
            status: 'approved',
            submittedBy: 'Sara Al Jaber'
          },
          {
            id: 6,
            date: '2025-04-08',
            category: 'Marketing',
            description: 'Brochure printing',
            amount: 5800,
            paymentMethod: 'Credit Card',
            status: 'rejected',
            submittedBy: 'Mohammed Rahman',
            receiptUrl: '/receipts/brochure-printing.pdf'
          },
          {
            id: 7,
            date: '2025-04-05',
            category: 'Miscellaneous',
            description: 'Staff lunch event',
            amount: 3200,
            paymentMethod: 'Cash',
            status: 'approved',
            submittedBy: 'Fatima Ali'
          },
          {
            id: 8,
            date: '2025-04-01',
            category: 'Rent',
            description: 'Monthly office rent',
            amount: 30000,
            paymentMethod: 'Bank Transfer',
            status: 'approved',
            submittedBy: 'Ahmed Al Mansouri'
          }
        ]
      };
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch all expenses
  const { data: expenses, isLoading: isLoadingExpenses } = useQuery<Expense[]>({
    queryKey: ['/api/crm/expenses', { startDate, endDate, category, status }],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        {
          id: 1,
          date: '2025-04-15',
          category: 'Marketing',
          description: 'Social media advertising campaign',
          amount: 12500,
          paymentMethod: 'Credit Card',
          status: 'approved',
          submittedBy: 'Mohammed Rahman'
        },
        {
          id: 2,
          date: '2025-04-14',
          category: 'Office Supplies',
          description: 'Printer cartridges and paper',
          amount: 3200,
          paymentMethod: 'Cash',
          status: 'approved',
          submittedBy: 'Sara Al Jaber'
        },
        {
          id: 3,
          date: '2025-04-13',
          category: 'Travel',
          description: 'Flight tickets for conference',
          amount: 8500,
          paymentMethod: 'Corporate Card',
          status: 'pending',
          submittedBy: 'Ahmed Al Mansouri'
        },
        {
          id: 4,
          date: '2025-04-12',
          category: 'Training',
          description: 'Train the trainer workshop',
          amount: 15000,
          paymentMethod: 'Bank Transfer',
          status: 'approved',
          submittedBy: 'Jamal Hassan'
        },
        {
          id: 5,
          date: '2025-04-10',
          category: 'Utilities',
          description: 'Electricity and water bill',
          amount: 8750,
          paymentMethod: 'Direct Debit',
          status: 'approved',
          submittedBy: 'Sara Al Jaber'
        },
        {
          id: 6,
          date: '2025-04-08',
          category: 'Marketing',
          description: 'Brochure printing',
          amount: 5800,
          paymentMethod: 'Credit Card',
          status: 'rejected',
          submittedBy: 'Mohammed Rahman',
          receiptUrl: '/receipts/brochure-printing.pdf'
        },
        {
          id: 7,
          date: '2025-04-05',
          category: 'Miscellaneous',
          description: 'Staff lunch event',
          amount: 3200,
          paymentMethod: 'Cash',
          status: 'approved',
          submittedBy: 'Fatima Ali'
        },
        {
          id: 8,
          date: '2025-04-01',
          category: 'Rent',
          description: 'Monthly office rent',
          amount: 30000,
          paymentMethod: 'Bank Transfer',
          status: 'approved',
          submittedBy: 'Ahmed Al Mansouri'
        },
        {
          id: 9,
          date: '2025-03-28',
          category: 'Marketing',
          description: 'Digital billboard advertisement',
          amount: 18500,
          paymentMethod: 'Credit Card',
          status: 'approved',
          submittedBy: 'Mohammed Rahman'
        },
        {
          id: 10,
          date: '2025-03-25',
          category: 'Office Supplies',
          description: 'Furniture for meeting room',
          amount: 12000,
          paymentMethod: 'Corporate Card',
          status: 'approved',
          submittedBy: 'Sara Al Jaber'
        },
        {
          id: 11,
          date: '2025-03-20',
          category: 'Training',
          description: 'Online course subscriptions',
          amount: 5500,
          paymentMethod: 'Credit Card',
          status: 'approved',
          submittedBy: 'Jamal Hassan'
        },
        {
          id: 12,
          date: '2025-03-15',
          category: 'Utilities',
          description: 'Internet and phone services',
          amount: 4200,
          paymentMethod: 'Direct Debit',
          status: 'approved',
          submittedBy: 'Sara Al Jaber'
        }
      ];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Filter records based on search query
  const filteredExpenses = expenses?.filter(expense => {
    const matchesSearch = 
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.submittedBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = category === 'all' || expense.category === category;
    const matchesStatus = status === 'all' || expense.status === status;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Company Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage all company expenses
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/crm/expenses/reports">
              <BarChart2 className="mr-2 h-4 w-4" />
              Reports
            </Link>
          </Button>
          <Button asChild>
            <Link href="/crm/expenses/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Link>
          </Button>
        </div>
      </div>

      {/* Expense Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Expenses</CardTitle>
            <CardDescription>All time expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-primary mr-2" />
              <p className="text-2xl font-bold">
                {isLoading ? "..." : formatCurrency(expenseData?.totalExpenses || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Monthly Expenses</CardTitle>
            <CardDescription>Current month spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-2xl font-bold text-blue-600">
                {isLoading ? "..." : formatCurrency(expenseData?.monthlyExpenses || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Approvals</CardTitle>
            <CardDescription>Expenses awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-amber-600 mr-2" />
              <p className="text-2xl font-bold text-amber-600">
                {isLoading ? "..." : expenses?.filter(e => e.status === 'pending').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Expense List</TabsTrigger>
          <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>All Expenses</CardTitle>
              <CardDescription>View and manage expense records</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search expenses..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:flex gap-2">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full md:w-[160px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                      <SelectItem value="Rent">Rent</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full md:w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="flex gap-2 whitespace-nowrap">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </div>

              {/* Date Range Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Start Date</p>
                  <DatePicker date={startDate} setDate={setStartDate} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">End Date</p>
                  <DatePicker date={endDate} setDate={setEndDate} />
                </div>
                <Button className="mt-auto" variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>

              {/* Expenses Table */}
              {isLoadingExpenses ? (
                <div className="text-center p-6">Loading expense data...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-3 px-2 font-medium text-muted-foreground">Date</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Description</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Category</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Amount</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Payment Method</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Status</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Submitted By</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses?.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-muted-foreground">
                            No expense records found for the selected filters
                          </td>
                        </tr>
                      ) : (
                        filteredExpenses?.map(expense => (
                          <tr key={expense.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="py-3 px-2">{formatDate(expense.date)}</td>
                            <td className="py-3 px-2 font-medium">{expense.description}</td>
                            <td className="py-3 px-2">{expense.category}</td>
                            <td className="py-3 px-2 font-medium">{formatCurrency(expense.amount)}</td>
                            <td className="py-3 px-2">{expense.paymentMethod}</td>
                            <td className="py-3 px-2">
                              <Badge variant={
                                expense.status === 'approved' ? 'default' :
                                expense.status === 'pending' ? 'outline' : 'destructive'
                              }>
                                {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="py-3 px-2">{expense.submittedBy}</td>
                            <td className="py-3 px-2 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/crm/expenses/${expense.id}`}>
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem asChild>
                                    <Link href={`/crm/expenses/edit/${expense.id}`}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  {expense.status === 'pending' && (
                                    <>
                                      <DropdownMenuItem className="text-green-600">
                                        <Check className="h-4 w-4 mr-2" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600">
                                        <X className="h-4 w-4 mr-2" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>Breakdown of expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center p-6">Loading category data...</div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-base font-medium mb-4">Expense Distribution</h3>
                      <div className="space-y-4">
                        {expenseData?.categorySummary.map((category) => (
                          <div key={category.category} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{category.category}</span>
                              <span className="font-medium">{formatCurrency(category.amount)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={category.percentage} className="h-2" />
                              <span className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-4">Top Expense Categories</h3>
                      <div className="relative aspect-square">
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <p className="text-sm text-muted-foreground">Total Expenses</p>
                          <p className="text-2xl font-bold">{formatCurrency(expenseData?.totalExpenses || 0)}</p>
                        </div>
                        <div className="text-center p-12 border border-dashed rounded-full w-full h-full flex items-center justify-center text-muted-foreground">
                          Pie chart visualization (placeholder)
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium mb-4">Recent Expenses by Category</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {expenseData?.recentExpenses.slice(0, 6).map((expense) => (
                        <Card key={expense.id} className="bg-muted/30">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{expense.category}</h4>
                                <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
                              </div>
                              <Badge variant={
                                expense.status === 'approved' ? 'default' :
                                expense.status === 'pending' ? 'outline' : 'destructive'
                              }>
                                {expense.status}
                              </Badge>
                            </div>
                            <p className="text-sm">{expense.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">{expense.submittedBy}</span>
                              <span className="font-medium">{formatCurrency(expense.amount)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpensesPage;