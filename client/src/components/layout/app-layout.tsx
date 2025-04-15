import { FC, ReactNode, useState } from 'react';
import Sidebar from './sidebar';
import Header from './header';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - hidden on mobile unless toggled */}
      <Sidebar className={`${mobileSidebarOpen ? 'block' : 'hidden'} md:block fixed inset-y-0 left-0 z-50 md:relative md:z-0`} />
      
      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuToggle={toggleMobileSidebar} />
        
        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}
    </div>
  );
};

export default AppLayout;
