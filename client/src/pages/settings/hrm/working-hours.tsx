import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, Save } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const workingHoursSchema = z.object({
  monday: z.object({
    enabled: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
    breakStartTime: z.string(),
    breakEndTime: z.string(),
  }),
  tuesday: z.object({
    enabled: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
    breakStartTime: z.string(),
    breakEndTime: z.string(),
  }),
  wednesday: z.object({
    enabled: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
    breakStartTime: z.string(),
    breakEndTime: z.string(),
  }),
  thursday: z.object({
    enabled: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
    breakStartTime: z.string(),
    breakEndTime: z.string(),
  }),
  friday: z.object({
    enabled: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
    breakStartTime: z.string(),
    breakEndTime: z.string(),
  }),
  saturday: z.object({
    enabled: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
    breakStartTime: z.string(),
    breakEndTime: z.string(),
  }),
  sunday: z.object({
    enabled: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
    breakStartTime: z.string(),
    breakEndTime: z.string(),
  }),
  overtimeRate: z.string(),
  maxOvertimeHours: z.string(),
});

type WorkingHoursData = z.infer<typeof workingHoursSchema>;

const WorkingHoursPage: FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<WorkingHoursData>({
    resolver: zodResolver(workingHoursSchema),
    defaultValues: {
      monday: {
        enabled: true,
        startTime: '09:00',
        endTime: '18:00',
        breakStartTime: '13:00',
        breakEndTime: '14:00',
      },
      tuesday: {
        enabled: true,
        startTime: '09:00',
        endTime: '18:00',
        breakStartTime: '13:00',
        breakEndTime: '14:00',
      },
      wednesday: {
        enabled: true,
        startTime: '09:00',
        endTime: '18:00',
        breakStartTime: '13:00',
        breakEndTime: '14:00',
      },
      thursday: {
        enabled: true,
        startTime: '09:00',
        endTime: '18:00',
        breakStartTime: '13:00',
        breakEndTime: '14:00',
      },
      friday: {
        enabled: true,
        startTime: '09:00',
        endTime: '15:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
      },
      saturday: {
        enabled: false,
        startTime: '09:00',
        endTime: '18:00',
        breakStartTime: '13:00',
        breakEndTime: '14:00',
      },
      sunday: {
        enabled: false,
        startTime: '09:00',
        endTime: '18:00',
        breakStartTime: '13:00',
        breakEndTime: '14:00',
      },
      overtimeRate: '1.5',
      maxOvertimeHours: '20',
    },
  });

  const onSubmit = async (data: WorkingHoursData) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Success',
        description: 'Working hours settings have been saved successfully.',
      });
      setIsLoading(false);
    }, 1000);
  };

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ] as const;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings/hrm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to HRM Settings
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Working Hours
            </h1>
            <p className="text-muted-foreground">
              Configure standard working hours and overtime policies
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Daily Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Working Hours</CardTitle>
              <CardDescription>
                Set working hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {days.map((day) => (
                <div key={day.key} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">{day.label}</Label>
                    <FormField
                      control={form.control}
                      name={`${day.key}.enabled`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm">Working Day</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {form.watch(`${day.key}.enabled`) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pl-4">
                      <FormField
                        control={form.control}
                        name={`${day.key}.startTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`${day.key}.endTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`${day.key}.breakStartTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Break Start</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`${day.key}.breakEndTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Break End</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  {day.key !== 'sunday' && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Overtime Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Overtime Settings</CardTitle>
              <CardDescription>
                Configure overtime rates and limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="overtimeRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overtime Rate Multiplier</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="1.5" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Multiplier for overtime hours (e.g., 1.5 for time and a half)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxOvertimeHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Overtime Hours (per month)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="20" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum allowed overtime hours per employee per month
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Working Hours'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default WorkingHoursPage;