import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusCircle, Search, FileText, BarChart2, Download, Pencil, Trash2, Filter, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Expense categories
const EXPENSE_CATEGORIES = [
  'Rent',
  'Utilities',
  'Salaries',
  'Marketing',
  'Office Supplies',
  'Equipment',
  'Maintenance',
  'Insurance',
  'Travel',
  'Training',
  'Software',
  'Miscellaneous'
];

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#F25C5C', '#A459D1'];

// Interfaces
interface Expense {
  id: number;
  date: string;
  category: string;
  amount: number;
  description: string;
  paymentMethod: string;
  approvedBy: string;
  receipt?: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

interface ExpenseSummary {
  totalExpenses: number;
  byCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  byMonth: {
    month: string;
    amount: number;
  }[];
}

const ExpensesPage: FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('thisMonth');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addExpenseOpen, setAddExpenseOpen] = useState<boolean>(false);

  // Fetch expenses - this will be replaced with actual API call
  const { data: expenses, isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ['/api/expenses', selectedPeriod],
    queryFn: async () => {
      // Mock data for now
      return [
        {
          id: 1,
          date: '2025-04-15',
          category: 'Rent',
          amount: 12000,
          description: 'Office rent for April 2025',
          paymentMethod: 'Bank Transfer',
          approvedBy: 'Ahmed Al Falasi',
          receipt: 'receipt_1.pdf',
          status: 'Approved'
        },
        {
          id: 2,
          date: '2025-04-12',
          category: 'Utilities',
          amount: 2500,
          description: 'Electricity and water bill for March',
          paymentMethod: 'Credit Card',
          approvedBy: 'Sara Ali',
          receipt: 'receipt_2.pdf',
          status: 'Approved'
        },
        {
          id: 3,
          date: '2025-04-10',
          category: 'Marketing',
          amount: 5000,
          description: 'Google Ads campaign for Q2',
          paymentMethod: 'Credit Card',
          approvedBy: 'Mohamed Hassan',
          receipt: 'receipt_3.pdf',
          status: 'Approved'
        },
        {
          id: 4,
          date: '2025-04-05',
          category: 'Office Supplies',
          amount: 1200,
          description: 'Office stationery and supplies',
          paymentMethod: 'Cash',
          approvedBy: 'Pending',
          status: 'Pending'
        },
        {
          id: 5,
          date: '2025-04-02',
          category: 'Salaries',
          amount: 45000,
          description: 'Staff salaries for March 2025',
          paymentMethod: 'Bank Transfer',
          approvedBy: 'Ahmed Al Falasi',
          receipt: 'receipt_5.pdf',
          status: 'Approved'
        },
        {
          id: 6,
          date: '2025-03-28',
          category: 'Equipment',
          amount: 8500,
          description: 'New projector for training room',
          paymentMethod: 'Credit Card',
          approvedBy: 'Sara Ali',
          receipt: 'receipt_6.pdf',
          status: 'Approved'
        },
        {
          id: 7,
          date: '2025-03-25',
          category: 'Software',
          amount: 3600,
          description: 'Annual subscription for Adobe Creative Cloud',
          paymentMethod: 'Credit Card',
          approvedBy: 'Mohamed Hassan',
          receipt: 'receipt_7.pdf',
          status: 'Approved'
        }
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch expense summary - this will be replaced with actual API call
  const { data: summary, isLoading: summaryLoading } = useQuery<ExpenseSummary>({
    queryKey: ['/api/expenses/summary', selectedPeriod],
    queryFn: async () => {
      // Mock data for now
      return {
        totalExpenses: 77800,
        byCategory: [
          { category: 'Rent', amount: 12000, percentage: 15.4 },
          { category: 'Utilities', amount: 2500, percentage: 3.2 },
          { category: 'Salaries', amount: 45000, percentage: 57.8 },
          { category: 'Marketing', amount: 5000, percentage: 6.4 },
          { category: 'Office Supplies', amount: 1200, percentage: 1.5 },
          { category: 'Equipment', amount: 8500, percentage: 10.9 },
          { category: 'Software', amount: 3600, percentage: 4.6 }
        ],
        byMonth: [
          { month: 'Jan', amount: 72000 },
          { month: 'Feb', amount: 75500 },
          { month: 'Mar', amount: 73200 },
          { month: 'Apr', amount: 77800 }
        ]
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter expenses based on search query
  const filteredExpenses = expenses?.filter(expense => 
    expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString()}`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Company Expenses</h1>
            <p className="text-muted-foreground">Track, manage, and analyze all institute expenses</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new expense. All fields marked with * are required.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input id="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (AED) *</Label>
                      <Input id="amount" type="number" min="0" step="0.01" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Input id="description" placeholder="Brief description of the expense" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment Method *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="creditCard">Credit Card</SelectItem>
                          <SelectItem value="bankTransfer">Bank Transfer</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receipt">Receipt</Label>
                      <Input id="receipt" type="file" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddExpenseOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Expense
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <CardDescription>
                {selectedPeriod === 'thisMonth' ? 'Current month' : 
                 selectedPeriod === 'lastMonth' ? 'Previous month' : 
                 selectedPeriod === 'quarter' ? 'Last 3 months' : 
                 selectedPeriod === 'year' ? 'Current year' : 'Selected period'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryLoading ? 'Loading...' : formatCurrency(summary?.totalExpenses || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Largest Expense Category</CardTitle>
              <CardDescription>Highest spending area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryLoading ? 'Loading...' : 
                  summary?.byCategory.sort((a, b) => b.amount - a.amount)[0]?.category || 'N/A'}
              </div>
              <p className="text-sm text-muted-foreground">
                {summaryLoading ? '' : 
                  formatCurrency(summary?.byCategory.sort((a, b) => b.amount - a.amount)[0]?.amount || 0)}
                {' '}
                ({summaryLoading ? '' : 
                  summary?.byCategory.sort((a, b) => b.amount - a.amount)[0]?.percentage.toFixed(1) || 0}% of total)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Trend</CardTitle>
              <CardDescription>Compared to previous month</CardDescription>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="text-2xl font-bold">Loading...</div>
              ) : summary?.byMonth.length && summary.byMonth.length >= 2 ? (
                <>
                  <div className="text-2xl font-bold">
                    {summary.byMonth[summary.byMonth.length - 1].amount > 
                     summary.byMonth[summary.byMonth.length - 2].amount ? (
                      <span className="text-red-500">↑ Increased</span>
                    ) : (
                      <span className="text-green-500">↓ Decreased</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {Math.abs(
                      ((summary.byMonth[summary.byMonth.length - 1].amount - 
                        summary.byMonth[summary.byMonth.length - 2].amount) / 
                        summary.byMonth[summary.byMonth.length - 2].amount) * 100
                    ).toFixed(1)}% from previous month
                  </p>
                </>
              ) : (
                <div className="text-2xl font-bold">Insufficient data</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="list" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="list">Expense List</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="list">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>All Expenses</CardTitle>
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input 
                      placeholder="Search expenses..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-[300px]"
                    />
                    <Button type="submit" size="icon" variant="ghost">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">
                        <div className="flex items-center space-x-1">
                          <span>Date</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expensesLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">Loading expenses...</TableCell>
                      </TableRow>
                    ) : filteredExpenses && filteredExpenses.length > 0 ? (
                      filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">{formatDate(expense.date)}</TableCell>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
                          <TableCell>{expense.paymentMethod}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              expense.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              expense.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {expense.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">No expenses found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredExpenses?.length || 0} expense records
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="h-[500px] flex flex-col">
                <CardHeader>
                  <CardTitle>Expenses by Category</CardTitle>
                  <CardDescription>
                    Distribution of expenses across different categories
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {summaryLoading ? (
                    <div className="h-full flex items-center justify-center">
                      Loading chart data...
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summary?.byCategory}
                          cx="50%"
                          cy="50%"
                          labelLine
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={130}
                          fill="#8884d8"
                          dataKey="amount"
                          nameKey="category"
                        >
                          {summary?.byCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend layout="vertical" verticalAlign="bottom" align="center" />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="h-[500px] flex flex-col">
                <CardHeader>
                  <CardTitle>Monthly Expense Trend</CardTitle>
                  <CardDescription>
                    How expenses have changed over recent months
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {summaryLoading ? (
                    <div className="h-full flex items-center justify-center">
                      Loading chart data...
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={summary?.byMonth}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                        <Bar dataKey="amount" name="Total Expenses" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                  <CardDescription>
                    Detailed breakdown of expenses by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">% of Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaryLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">Loading breakdown data...</TableCell>
                        </TableRow>
                      ) : summary?.byCategory.sort((a, b) => b.amount - a.amount).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              ></div>
                              {item.category}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                          <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">View Details</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">{formatCurrency(summary?.totalExpenses || 0)}</TableCell>
                        <TableCell className="text-right">100%</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ExpensesPage;