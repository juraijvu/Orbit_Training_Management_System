import { FC, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { FilePlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ProposalsPage: FC = () => {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
  return (
    <AppLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Proposals</h1>
          <p className="text-gray-600">Create and manage training proposals for corporate clients</p>
        </div>
        <Button onClick={() => {}}>
          <FilePlus className="mr-2 h-4 w-4" />
          New Proposal
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-10">
            <FilePlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Proposals Yet</h3>
            <p className="text-gray-500 mb-6">
              You haven't created any proposals yet. Create your first proposal for a corporate client.
            </p>
            <Button>
              <FilePlus className="mr-2 h-4 w-4" />
              Create New Proposal
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default ProposalsPage;