import { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import {
  BarChart,
  Building,
  CreditCard,
  Settings as SettingsIcon,
  User,
  Users,
  BookOpen,
  Briefcase,
  FileText,
  Mail,
  MessageCircle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const SettingsPage: FC = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and module options
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Building className="h-5 w-5 mr-2" />
              Institute Settings
            </CardTitle>
            <CardDescription>
              Configure core institute settings and options
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-2">
              <li>
                <Link href="/settings/institute/general">
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center">
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      <span>General Settings</span>
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/settings/institute/courses">
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>Course Configuration</span>
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/settings/institute/certificates">
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Certificate Templates</span>
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <BarChart className="h-5 w-5 mr-2" />
              CRM Settings
            </CardTitle>
            <CardDescription>
              Configure CRM module settings and options
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-2">
              <li>
                <Link href="/settings/crm">
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center">
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      <span>CRM Configuration</span>
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/settings/crm/payment-gateway">
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span>Payment Gateways</span>
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/email-settings">
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>Email Configuration</span>
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/whatsapp-settings">
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      <span>WhatsApp Integration</span>
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Briefcase className="h-5 w-5 mr-2" />
              HRM Settings
            </CardTitle>
            <CardDescription>
              Configure HR module settings and options
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-2">
              <li>
                <Link href="/settings/hrm">
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center">
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      <span>HRM Configuration</span>
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/settings/hrm/working-hours">
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Working Hours</span>
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ShieldCheck className="h-5 w-5 mr-2" />
              System Administration
            </CardTitle>
            <CardDescription>
              Manage system-level settings and access
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-2">
              <li>
                <Link href="/settings/users">
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>User Management</span>
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/settings/roles">
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Role Management</span>
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/settings/backup">
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Backup & Restore</span>
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;