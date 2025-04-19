import { FC, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  ArrowLeft,
  CreditCard,
  Copy,
  Share2,
  Check,
  RefreshCw,
  Send,
  Mail,
  Phone
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Payment link form schema
const paymentLinkSchema = z.object({
  amount: z.coerce.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number",
  }).positive({
    message: "Amount must be positive",
  }),
  invoiceId: z.string().optional(),
  customerName: z.string().min(2, {
    message: "Customer name is required",
  }),
  customerEmail: z.string().email({
    message: "Valid email is required",
  }),
  customerPhone: z.string().optional(),
  paymentMethod: z.string({
    required_error: "Payment method is required",
  }),
  description: z.string().min(2, {
    message: "Description is required",
  }),
  expiresInDays: z.coerce.number().positive().default(7),
  sendEmail: z.boolean().default(false),
  sendSMS: z.boolean().default(false),
});

type PaymentLinkFormValues = z.infer<typeof paymentLinkSchema>;

interface PaymentLinkResponse {
  id: string;
  paymentUrl: string;
  amount: number;
  currency: string;
  status: string;
  expiresAt: string;
}

const PaymentLinkGeneratorPage: FC = () => {
  const [activeTab, setActiveTab] = useState('standard');
  const [generatedLink, setGeneratedLink] = useState<PaymentLinkResponse | null>(null);
  const { toast } = useToast();

  // Form setup
  const form = useForm<PaymentLinkFormValues>({
    resolver: zodResolver(paymentLinkSchema),
    defaultValues: {
      amount: 0,
      customerName: '',
      customerEmail: '',
      paymentMethod: 'card',
      description: '',
      expiresInDays: 7,
      sendEmail: true,
      sendSMS: false,
    },
  });

  // Generate payment link mutation
  const generatePaymentLinkMutation = useMutation({
    mutationFn: async (values: PaymentLinkFormValues) => {
      console.log('Generating payment link with:', values);
      // Mock response - replace with actual API call
      return {
        id: `link_${Math.random().toString(36).substring(2, 11)}`,
        paymentUrl: `https://pay.orbit-institute.com/${Math.random().toString(36).substring(2, 11)}`,
        amount: values.amount,
        currency: 'AED',
        status: 'active',
        expiresAt: new Date(Date.now() + values.expiresInDays * 24 * 60 * 60 * 1000).toISOString(),
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Payment link generated",
        description: "Payment link has been successfully created.",
      });
      setGeneratedLink(data);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate payment link",
        description: error.message || "An error occurred while creating the payment link.",
        variant: "destructive",
      });
    }
  });

  // Send payment link mutation
  const sendPaymentLinkMutation = useMutation({
    mutationFn: async ({ method, destination }: { method: string, destination: string }) => {
      console.log(`Sending payment link via ${method} to ${destination}`);
      // Mock response - replace with actual API call
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Payment link sent",
        description: "The payment link has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send payment link",
        description: error.message || "An error occurred while sending the payment link.",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = (values: PaymentLinkFormValues) => {
    generatePaymentLinkMutation.mutate(values);
  };

  // Copy link to clipboard
  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied to clipboard",
      description: "Payment link has been copied to clipboard.",
    });
  };

  // Handle sending link via email or SMS
  const handleSendLink = (method: 'email' | 'sms') => {
    const destination = method === 'email' 
      ? form.getValues().customerEmail
      : form.getValues().customerPhone;
    
    if (!destination) {
      toast({
        title: "Missing information",
        description: `Customer ${method === 'email' ? 'email' : 'phone'} is required to send the link.`,
        variant: "destructive",
      });
      return;
    }
    
    sendPaymentLinkMutation.mutate({ method, destination });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Payment Link Generator</h1>
          <p className="text-muted-foreground">
            Create and share payment links with customers
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Create Payment Link</CardTitle>
              <CardDescription>
                Generate a payment link to send to customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="standard">Standard</TabsTrigger>
                  <TabsTrigger value="installment">Installment</TabsTrigger>
                  <TabsTrigger value="bulk">Bulk Generation</TabsTrigger>
                </TabsList>

                <TabsContent value="standard">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount (AED)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    placeholder="0.00" 
                                    className="pl-8" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                The amount to be paid in AED
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="invoiceId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Invoice ID (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="INV-12345" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormDescription>
                                Associated invoice number if applicable
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter customer name" {...field} />
                              </FormControl>
                              <FormDescription>
                                Full name of the customer
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="customer@example.com" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Email address for the payment confirmation
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="+971 50 123 4567" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormDescription>
                                Phone number for SMS notifications
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Method</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="card">Credit Card</SelectItem>
                                  <SelectItem value="tabby">Tabby (Installments)</SelectItem>
                                  <SelectItem value="tamara">Tamara (Installments)</SelectItem>
                                  <SelectItem value="any">Any Method</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Select the payment method for this link
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Payment for..."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Brief description of what this payment is for
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="expiresInDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiry (Days)</FormLabel>
                              <Select 
                                onValueChange={(value) => field.onChange(parseInt(value))} 
                                defaultValue={field.value.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select expiry days" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1 day</SelectItem>
                                  <SelectItem value="3">3 days</SelectItem>
                                  <SelectItem value="7">7 days</SelectItem>
                                  <SelectItem value="14">14 days</SelectItem>
                                  <SelectItem value="30">30 days</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Link will expire after this period
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sendEmail"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Send via Email</FormLabel>
                                <FormDescription>
                                  Send payment link via email
                                </FormDescription>
                              </div>
                              <FormControl>
                                <div>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="mr-2 h-4 w-4"
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sendSMS"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Send via SMS</FormLabel>
                                <FormDescription>
                                  Send payment link via SMS
                                </FormDescription>
                              </div>
                              <FormControl>
                                <div>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="mr-2 h-4 w-4"
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={generatePaymentLinkMutation.isPending}
                      >
                        {generatePaymentLinkMutation.isPending ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Generate Payment Link
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="installment">
                  <div className="space-y-4">
                    <Alert>
                      <AlertTitle>Installment Payments</AlertTitle>
                      <AlertDescription>
                        Create payment links for installment options like Tabby or Tamara. Customers will be able to pay in installments.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">Select Payment Provider</h3>
                        <RadioGroup defaultValue="tabby" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="tabby" id="tabby" />
                            <label
                              htmlFor="tabby"
                              className="flex items-center space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              <img src="/assets/tabby-logo.png" alt="Tabby" className="h-6 w-auto" />
                              <span>Tabby (Pay in 4)</span>
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="tamara" id="tamara" />
                            <label
                              htmlFor="tamara"
                              className="flex items-center space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              <img src="/assets/tamara-logo.png" alt="Tamara" className="h-6 w-auto" />
                              <span>Tamara (Pay Later)</span>
                            </label>
                          </div>
                        </RadioGroup>
                      </div>

                      <p className="text-sm text-muted-foreground mt-4">
                        Installment options will be automatically configured based on the payment amount and provider policies. The standard payment link form will be used with the selected provider.
                      </p>

                      <Button 
                        onClick={() => {
                          form.setValue("paymentMethod", "tabby");
                          setActiveTab("standard");
                        }}
                      >
                        Continue to Payment Link Form
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="bulk">
                  <div className="space-y-4">
                    <Alert>
                      <AlertTitle>Bulk Payment Links</AlertTitle>
                      <AlertDescription>
                        Generate multiple payment links at once by uploading a CSV file or entering customer data manually.
                      </AlertDescription>
                    </Alert>

                    <div className="text-center py-12 border-2 border-dashed rounded-md">
                      <p className="text-muted-foreground mb-4">This feature is coming soon</p>
                      <Button onClick={() => setActiveTab("standard")}>
                        Use Standard Link Generator
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Generated Payment Link</CardTitle>
              <CardDescription>
                Share this link with your customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedLink ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      readOnly
                      value={generatedLink.paymentUrl}
                      className="pr-20"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() => copyToClipboard(generatedLink.paymentUrl)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy to clipboard</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <span className="font-medium">{generatedLink.amount.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Link ID:</span>
                      <span className="font-medium">{generatedLink.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className="font-medium capitalize">{generatedLink.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Expires:</span>
                      <span className="font-medium">
                        {new Date(generatedLink.expiresAt).toLocaleDateString('en-AE', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Share payment link</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSendLink('email')}
                        disabled={sendPaymentLinkMutation.isPending}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSendLink('sms')}
                        disabled={sendPaymentLinkMutation.isPending}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        SMS
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: 'Payment Link',
                              text: `Please complete your payment of ${generatedLink.amount.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })}`,
                              url: generatedLink.paymentUrl,
                            });
                          } else {
                            copyToClipboard(generatedLink.paymentUrl);
                          }
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Fill out the form and generate a payment link to see it here
                  </p>
                </div>
              )}
            </CardContent>
            {generatedLink && (
              <CardFooter className="flex justify-center border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setGeneratedLink(null);
                    form.reset();
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Create New Link
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentLinkGeneratorPage;