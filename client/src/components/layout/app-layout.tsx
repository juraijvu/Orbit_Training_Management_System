import { FC, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

// This AppLayout is now a wrapper for MainLayout to ensure compatibility
// with older components that use AppLayout
const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Just render the children directly - sidebar is handled by MainLayout
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      {children}
    </div>
  );
};

export default AppLayout;
