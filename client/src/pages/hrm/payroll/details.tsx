import { FC } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Eye, Printer } from 'lucide-react';

interface PayrollDetailRecord {
  id: number;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  month: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'Paid' | 'Pending' | 'Processing' | 'Failed';
  paymentDate?: string;
  paymentMethod?: string;
  processedBy?: string;
  processedAt?: string;
  notes?: string;
}

const PayrollDetailsPage: FC = () => {
  const params = useParams();
  const recordId = params.id;

  // Fetch payroll record details
  const { data: record, isLoading } = useQuery<PayrollDetailRecord>({
    queryKey: ['/api/hrm/payroll/records', recordId],
    queryFn: async () => {
      // Mock data for now - replace with actual API call
      return {
        id: parseInt(recordId as string),
        employeeId: 'EMP001',
        employeeName: 'Ahmed Abdullah',
        department: 'Training',
        position: 'Lead Trainer',
        month: 'April 2025',
        baseSalary: 12000,
        allowances: 3000,
        deductions: 1500,
        netSalary: 13500,
        status: 'Paid',
        paymentDate: '2025-04-01',
        paymentMethod: 'Bank Transfer',
        processedBy: 'HR Manager',
        processedAt: '2025-04-01T10:30:00',
        notes: 'Regular monthly payroll processing'
      };
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Failed': 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading payroll details...</div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Payroll Record Not Found</h2>
          <Button asChild>
            <Link href="/hrm/payroll">Back to Payroll</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/hrm/payroll">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payroll
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Payroll Details</h1>
            <p className="text-muted-foreground">
              {record.employeeName} - {record.month}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Information */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Employee ID</p>
              <p className="font-medium">{record.employeeId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{record.employeeName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{record.department}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Position</p>
              <p className="font-medium">{record.position}</p>
            </div>
          </CardContent>
        </Card>

        {/* Salary Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Salary Breakdown</CardTitle>
            <CardDescription>{record.month}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Basic Salary</span>
              <span className="font-medium">{formatCurrency(record.baseSalary)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Allowances</span>
              <span className="font-medium text-green-600">+{formatCurrency(record.allowances)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deductions</span>
              <span className="font-medium text-red-600">-{formatCurrency(record.deductions)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Net Salary</span>
              <span className="font-bold">{formatCurrency(record.netSalary)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-1">{getStatusBadge(record.status)}</div>
            </div>
            {record.paymentDate && (
              <div>
                <p className="text-sm text-muted-foreground">Payment Date</p>
                <p className="font-medium">{new Date(record.paymentDate).toLocaleDateString()}</p>
              </div>
            )}
            {record.paymentMethod && (
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium">{record.paymentMethod}</p>
              </div>
            )}
            {record.processedBy && (
              <div>
                <p className="text-sm text-muted-foreground">Processed By</p>
                <p className="font-medium">{record.processedBy}</p>
              </div>
            )}
            {record.processedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Processed At</p>
                <p className="font-medium">{new Date(record.processedAt).toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes Section */}
      {record.notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{record.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PayrollDetailsPage;