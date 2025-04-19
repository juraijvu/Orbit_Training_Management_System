import { FC, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  CreditCard,
  ArrowLeft,
  Check,
  Copy,
  X,
  AlertCircle,
  EyeOff,
  Eye,
  CreditCardIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Switch,
} from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import React from 'react';

// Form schemas
const stripeConfigSchema = z.object({
  enabled: z.boolean().default(false),
  testMode: z.boolean().default(true),
  publicKey: z.string().min(5, "Public key is required"),
  secretKey: z.string().min(5, "Secret key is required"),
  webhookSecret: z.string().optional(),
});

const tabbyConfigSchema = z.object({
  enabled: z.boolean().default(false),
  testMode: z.boolean().default(true),
  merchantCode: z.string().min(2, "Merchant code is required"),
  apiKey: z.string().min(5, "API key is required"),
  publicKey: z.string().min(5, "Public key is required"),
});

const tamaraConfigSchema = z.object({
  enabled: z.boolean().default(false),
  testMode: z.boolean().default(true),
  merchantCode: z.string().min(2, "Merchant code is required"),
  apiKey: z.string().min(5, "API key is required"),
  notificationKey: z.string().min(5, "Notification key is required"),
});

type StripeFormValues = z.infer<typeof stripeConfigSchema>;
type TabbyFormValues = z.infer<typeof tabbyConfigSchema>;
type TamaraFormValues = z.infer<typeof tamaraConfigSchema>;

interface PaymentGatewayConfig {
  stripe: {
    enabled: boolean;
    testMode: boolean;
    publicKey: string;
    secretKey: string;
    webhookSecret?: string;
  };
  tabby: {
    enabled: boolean;
    testMode: boolean;
    merchantCode: string;
    apiKey: string;
    publicKey: string;
  };
  tamara: {
    enabled: boolean;
    testMode: boolean;
    merchantCode: string;
    apiKey: string;
    notificationKey: string;
  };
}

const PaymentGatewaySettingsPage: FC = () => {
  const [activeTab, setActiveTab] = useState('stripe');
  const [showSecrets, setShowSecrets] = useState({
    stripe: false,
    tabby: false,
    tamara: false
  });
  const { toast } = useToast();

  // Fetch configuration data
  const { data: configData, isLoading } = useQuery<PaymentGatewayConfig>({
    queryKey: ['/api/settings/payment-gateway'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return {
        stripe: {
          enabled: true,
          testMode: true,
          publicKey: 'pk_test_51NxySFKV6QnxmKLr...',
          secretKey: 'sk_test_51NxySFKV6QnxmKLr...',
          webhookSecret: 'whsec_...'
        },
        tabby: {
          enabled: true,
          testMode: true,
          merchantCode: 'ORBIT_INSTITUTE',
          apiKey: 'api_key_...',
          publicKey: 'public_key_...'
        },
        tamara: {
          enabled: false,
          testMode: true,
          merchantCode: 'ORBIT_INST',
          apiKey: 'api_key_...',
          notificationKey: 'notification_key_...'
        }
      };
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Form setup
  const stripeForm = useForm<StripeFormValues>({
    resolver: zodResolver(stripeConfigSchema),
    defaultValues: {
      enabled: false,
      testMode: true,
      publicKey: '',
      secretKey: '',
      webhookSecret: ''
    },
  });

  const tabbyForm = useForm<TabbyFormValues>({
    resolver: zodResolver(tabbyConfigSchema),
    defaultValues: {
      enabled: false,
      testMode: true,
      merchantCode: '',
      apiKey: '',
      publicKey: ''
    },
  });

  const tamaraForm = useForm<TamaraFormValues>({
    resolver: zodResolver(tamaraConfigSchema),
    defaultValues: {
      enabled: false,
      testMode: true,
      merchantCode: '',
      apiKey: '',
      notificationKey: ''
    },
  });

  // Update forms when data is loaded
  React.useEffect(() => {
    if (configData) {
      stripeForm.reset({
        enabled: configData.stripe.enabled,
        testMode: configData.stripe.testMode,
        publicKey: configData.stripe.publicKey,
        secretKey: configData.stripe.secretKey,
        webhookSecret: configData.stripe.webhookSecret
      });
      
      tabbyForm.reset({
        enabled: configData.tabby.enabled,
        testMode: configData.tabby.testMode,
        merchantCode: configData.tabby.merchantCode,
        apiKey: configData.tabby.apiKey,
        publicKey: configData.tabby.publicKey
      });
      
      tamaraForm.reset({
        enabled: configData.tamara.enabled,
        testMode: configData.tamara.testMode,
        merchantCode: configData.tamara.merchantCode,
        apiKey: configData.tamara.apiKey,
        notificationKey: configData.tamara.notificationKey
      });
    }
  }, [configData]);

  // Update payment gateway config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async ({ type, values }: { type: string, values: any }) => {
      console.log('Updating config for type:', type, 'with values:', values);
      // Replace with actual API call
      return await apiRequest('PUT', `/api/settings/payment-gateway/${type}`, values);
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Payment gateway settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings/payment-gateway'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update settings",
        description: error.message || "An error occurred while saving the payment gateway settings.",
        variant: "destructive",
      });
    }
  });

  // Generate payment link mutation
  const generatePaymentLinkMutation = useMutation({
    mutationFn: async (data: { 
      gateway: string, 
      amount: number, 
      invoiceId: string,
      customerEmail: string,
      customerName: string,
      description: string
    }) => {
      // Replace with actual API call
      return await apiRequest('POST', '/api/payment/generate-link', data);
    },
    onSuccess: (data) => {
      toast({
        title: "Payment link generated",
        description: "Payment link has been created successfully.",
      });
      // Copy to clipboard
      navigator.clipboard.writeText(data.paymentUrl);
      toast({
        title: "Link copied to clipboard",
        description: "The payment link has been copied to your clipboard.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate payment link",
        description: error.message || "An error occurred while creating the payment link.",
        variant: "destructive",
      });
    }
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (gateway: string) => {
      // Replace with actual API call
      return await apiRequest('POST', `/api/settings/payment-gateway/${gateway}/test`);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Connection successful",
        description: `Successfully connected to ${variables.charAt(0).toUpperCase() + variables.slice(1)} payment gateway.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to the payment gateway. Please check your credentials.",
        variant: "destructive",
      });
    }
  });

  // Handle form submissions
  const onStripeSubmit = (values: StripeFormValues) => {
    updateConfigMutation.mutate({ type: 'stripe', values });
  };

  const onTabbySubmit = (values: TabbyFormValues) => {
    updateConfigMutation.mutate({ type: 'tabby', values });
  };

  const onTamaraSubmit = (values: TamaraFormValues) => {
    updateConfigMutation.mutate({ type: 'tamara', values });
  };

  // Handle testing connection
  const handleTestConnection = (gateway: string) => {
    testConnectionMutation.mutate(gateway);
  };

  // Handle toggle secret visibility
  const toggleShowSecrets = (gateway: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [gateway]: !prev[gateway]
    }));
  };

  // Handle generating sample payment link
  const handleGeneratePaymentLink = (gateway: string) => {
    generatePaymentLinkMutation.mutate({
      gateway,
      amount: 1000, // AED 1000
      invoiceId: "INV-" + Math.floor(Math.random() * 10000),
      customerEmail: "test@example.com",
      customerName: "Test Customer",
      description: "Test payment for " + gateway
    });
  };

  // Copy value to clipboard
  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied to clipboard",
      description: "Value has been copied to clipboard.",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Payment Gateway Settings</h1>
          <p className="text-muted-foreground">
            Configure payment gateway integrations for invoices and online payments
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/settings/crm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to CRM Settings
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <Card>
          <CardContent className="p-4 pt-6">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="stripe" className="flex items-center gap-2">
                <CreditCardIcon className="h-4 w-4" />
                Stripe
                {configData?.stripe.enabled && (
                  <Badge variant="default" className="ml-auto">Active</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="tabby" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Tabby
                {configData?.tabby.enabled && (
                  <Badge variant="default" className="ml-auto">Active</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="tamara" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Tamara
                {configData?.tamara.enabled && (
                  <Badge variant="default" className="ml-auto">Active</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        <TabsContent value="stripe">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Stripe Payment Gateway
              </CardTitle>
              <CardDescription>
                Configure Stripe for credit card payments and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading Stripe configuration...</div>
              ) : (
                <>
                  <div className="mb-6">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Integration Information</AlertTitle>
                      <AlertDescription>
                        <p className="mb-2">Stripe is used for processing credit card payments. You'll need your Stripe API keys to set up the integration.</p>
                        <p>You can find your API keys in the <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-primary underline">Stripe Dashboard</a>.</p>
                      </AlertDescription>
                    </Alert>
                  </div>

                  <Form {...stripeForm}>
                    <form onSubmit={stripeForm.handleSubmit(onStripeSubmit)} className="space-y-6">
                      <FormField
                        control={stripeForm.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Stripe</FormLabel>
                              <FormDescription>
                                Activate Stripe payment gateway integration
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
                        control={stripeForm.control}
                        name="testMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Test Mode</FormLabel>
                              <FormDescription>
                                Use Stripe in test mode (no real payments)
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

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={stripeForm.control}
                          name="publicKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Publishable Key</FormLabel>
                              <div className="flex">
                                <FormControl>
                                  <div className="relative flex-1">
                                    <Input 
                                      placeholder={field.value ? "••••••••••••••••••••••••••••••" : "pk_test_..."}
                                      type={showSecrets.stripe ? "text" : "password"}
                                      {...field} 
                                    />
                                    <button 
                                      type="button"
                                      className="absolute right-10 top-0 h-full px-3 py-2 text-gray-400"
                                      onClick={() => toggleShowSecrets('stripe')}
                                    >
                                      {showSecrets.stripe ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </button>
                                    <button 
                                      type="button"
                                      className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                                      onClick={() => copyToClipboard(field.value)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </button>
                                  </div>
                                </FormControl>
                              </div>
                              <FormDescription>
                                Your Stripe publishable key (starts with pk_)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={stripeForm.control}
                          name="secretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Secret Key</FormLabel>
                              <div className="flex">
                                <FormControl>
                                  <div className="relative flex-1">
                                    <Input 
                                      placeholder={field.value ? "••••••••••••••••••••••••••••••" : "sk_test_..."}
                                      type={showSecrets.stripe ? "text" : "password"}
                                      {...field} 
                                    />
                                    <button 
                                      type="button"
                                      className="absolute right-10 top-0 h-full px-3 py-2 text-gray-400"
                                      onClick={() => toggleShowSecrets('stripe')}
                                    >
                                      {showSecrets.stripe ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </button>
                                    <button 
                                      type="button"
                                      className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                                      onClick={() => copyToClipboard(field.value)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </button>
                                  </div>
                                </FormControl>
                              </div>
                              <FormDescription>
                                Your Stripe secret key (starts with sk_)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={stripeForm.control}
                        name="webhookSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Webhook Secret (Optional)</FormLabel>
                            <div className="flex">
                              <FormControl>
                                <div className="relative flex-1">
                                  <Input 
                                    placeholder={field.value ? "••••••••••••••••••••••••••••••" : "whsec_..."}
                                    type={showSecrets.stripe ? "text" : "password"}
                                    {...field} 
                                    value={field.value || ""}
                                  />
                                  <button 
                                    type="button"
                                    className="absolute right-10 top-0 h-full px-3 py-2 text-gray-400"
                                    onClick={() => toggleShowSecrets('stripe')}
                                  >
                                    {showSecrets.stripe ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                  <button 
                                    type="button"
                                    className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                                    onClick={() => field.value && copyToClipboard(field.value)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                </div>
                              </FormControl>
                            </div>
                            <FormDescription>
                              Webhook signing secret for verifying Stripe events
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-between pt-4">
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => handleTestConnection('stripe')}
                            disabled={!stripeForm.getValues().enabled || testConnectionMutation.isPending}
                          >
                            {testConnectionMutation.isPending ? (
                              <>Testing...</>
                            ) : (
                              <>Test Connection</>
                            )}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => handleGeneratePaymentLink('stripe')}
                            disabled={!stripeForm.getValues().enabled || generatePaymentLinkMutation.isPending}
                          >
                            {generatePaymentLinkMutation.isPending ? (
                              <>Generating...</>
                            ) : (
                              <>Generate Test Payment Link</>
                            )}
                          </Button>
                        </div>
                        <Button type="submit" disabled={updateConfigMutation.isPending}>
                          {updateConfigMutation.isPending ? "Saving..." : "Save Settings"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tabby">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Tabby Payment Gateway
              </CardTitle>
              <CardDescription>
                Configure Tabby for "Buy Now, Pay Later" installment payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading Tabby configuration...</div>
              ) : (
                <>
                  <div className="mb-6">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Integration Information</AlertTitle>
                      <AlertDescription>
                        <p className="mb-2">Tabby allows customers to split payments into installments. You'll need your Tabby merchant ID and API keys.</p>
                        <p>You can find your API keys in the <a href="https://merchant.tabby.ai/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Tabby Merchant Portal</a>.</p>
                      </AlertDescription>
                    </Alert>
                  </div>

                  <Form {...tabbyForm}>
                    <form onSubmit={tabbyForm.handleSubmit(onTabbySubmit)} className="space-y-6">
                      <FormField
                        control={tabbyForm.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Tabby</FormLabel>
                              <FormDescription>
                                Activate Tabby payment gateway integration
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
                        control={tabbyForm.control}
                        name="testMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Test Mode</FormLabel>
                              <FormDescription>
                                Use Tabby in test mode (no real payments)
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
                        control={tabbyForm.control}
                        name="merchantCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Merchant Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter merchant code" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your Tabby merchant code or ID
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={tabbyForm.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <div className="flex">
                                <FormControl>
                                  <div className="relative flex-1">
                                    <Input 
                                      placeholder={field.value ? "••••••••••••••••••••••••••••••" : "Enter API key"}
                                      type={showSecrets.tabby ? "text" : "password"}
                                      {...field} 
                                    />
                                    <button 
                                      type="button"
                                      className="absolute right-10 top-0 h-full px-3 py-2 text-gray-400"
                                      onClick={() => toggleShowSecrets('tabby')}
                                    >
                                      {showSecrets.tabby ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </button>
                                    <button 
                                      type="button"
                                      className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                                      onClick={() => copyToClipboard(field.value)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </button>
                                  </div>
                                </FormControl>
                              </div>
                              <FormDescription>
                                Your Tabby API key for server-side operations
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={tabbyForm.control}
                          name="publicKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Public Key</FormLabel>
                              <div className="flex">
                                <FormControl>
                                  <div className="relative flex-1">
                                    <Input 
                                      placeholder={field.value ? "••••••••••••••••••••••••••••••" : "Enter public key"}
                                      type={showSecrets.tabby ? "text" : "password"}
                                      {...field} 
                                    />
                                    <button 
                                      type="button"
                                      className="absolute right-10 top-0 h-full px-3 py-2 text-gray-400"
                                      onClick={() => toggleShowSecrets('tabby')}
                                    >
                                      {showSecrets.tabby ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </button>
                                    <button 
                                      type="button"
                                      className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                                      onClick={() => copyToClipboard(field.value)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </button>
                                  </div>
                                </FormControl>
                              </div>
                              <FormDescription>
                                Your Tabby public key for client-side operations
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-between pt-4">
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => handleTestConnection('tabby')}
                            disabled={!tabbyForm.getValues().enabled || testConnectionMutation.isPending}
                          >
                            {testConnectionMutation.isPending ? (
                              <>Testing...</>
                            ) : (
                              <>Test Connection</>
                            )}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => handleGeneratePaymentLink('tabby')}
                            disabled={!tabbyForm.getValues().enabled || generatePaymentLinkMutation.isPending}
                          >
                            {generatePaymentLinkMutation.isPending ? (
                              <>Generating...</>
                            ) : (
                              <>Generate Test Payment Link</>
                            )}
                          </Button>
                        </div>
                        <Button type="submit" disabled={updateConfigMutation.isPending}>
                          {updateConfigMutation.isPending ? "Saving..." : "Save Settings"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tamara">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Tamara Payment Gateway
              </CardTitle>
              <CardDescription>
                Configure Tamara for "Buy Now, Pay Later" installment payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading Tamara configuration...</div>
              ) : (
                <>
                  <div className="mb-6">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Integration Information</AlertTitle>
                      <AlertDescription>
                        <p className="mb-2">Tamara provides flexible payment options including "Pay Later" and installments. You'll need your Tamara merchant ID and API keys.</p>
                        <p>You can find your API keys in the <a href="https://merchant.tamara.co" target="_blank" rel="noopener noreferrer" className="text-primary underline">Tamara Merchant Dashboard</a>.</p>
                      </AlertDescription>
                    </Alert>
                  </div>

                  <Form {...tamaraForm}>
                    <form onSubmit={tamaraForm.handleSubmit(onTamaraSubmit)} className="space-y-6">
                      <FormField
                        control={tamaraForm.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Tamara</FormLabel>
                              <FormDescription>
                                Activate Tamara payment gateway integration
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
                        control={tamaraForm.control}
                        name="testMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Test Mode</FormLabel>
                              <FormDescription>
                                Use Tamara in test mode (no real payments)
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
                        control={tamaraForm.control}
                        name="merchantCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Merchant Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter merchant code" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your Tamara merchant code or ID
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={tamaraForm.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <div className="flex">
                                <FormControl>
                                  <div className="relative flex-1">
                                    <Input 
                                      placeholder={field.value ? "••••••••••••••••••••••••••••••" : "Enter API key"}
                                      type={showSecrets.tamara ? "text" : "password"}
                                      {...field} 
                                    />
                                    <button 
                                      type="button"
                                      className="absolute right-10 top-0 h-full px-3 py-2 text-gray-400"
                                      onClick={() => toggleShowSecrets('tamara')}
                                    >
                                      {showSecrets.tamara ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </button>
                                    <button 
                                      type="button"
                                      className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                                      onClick={() => copyToClipboard(field.value)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </button>
                                  </div>
                                </FormControl>
                              </div>
                              <FormDescription>
                                Your Tamara API key for server-side operations
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={tamaraForm.control}
                          name="notificationKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notification Key</FormLabel>
                              <div className="flex">
                                <FormControl>
                                  <div className="relative flex-1">
                                    <Input 
                                      placeholder={field.value ? "••••••••••••••••••••••••••••••" : "Enter notification key"}
                                      type={showSecrets.tamara ? "text" : "password"}
                                      {...field} 
                                    />
                                    <button 
                                      type="button"
                                      className="absolute right-10 top-0 h-full px-3 py-2 text-gray-400"
                                      onClick={() => toggleShowSecrets('tamara')}
                                    >
                                      {showSecrets.tamara ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </button>
                                    <button 
                                      type="button"
                                      className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                                      onClick={() => copyToClipboard(field.value)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </button>
                                  </div>
                                </FormControl>
                              </div>
                              <FormDescription>
                                Your Tamara notification key for webhooks
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-between pt-4">
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => handleTestConnection('tamara')}
                            disabled={!tamaraForm.getValues().enabled || testConnectionMutation.isPending}
                          >
                            {testConnectionMutation.isPending ? (
                              <>Testing...</>
                            ) : (
                              <>Test Connection</>
                            )}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => handleGeneratePaymentLink('tamara')}
                            disabled={!tamaraForm.getValues().enabled || generatePaymentLinkMutation.isPending}
                          >
                            {generatePaymentLinkMutation.isPending ? (
                              <>Generating...</>
                            ) : (
                              <>Generate Test Payment Link</>
                            )}
                          </Button>
                        </div>
                        <Button type="submit" disabled={updateConfigMutation.isPending}>
                          {updateConfigMutation.isPending ? "Saving..." : "Save Settings"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentGatewaySettingsPage;