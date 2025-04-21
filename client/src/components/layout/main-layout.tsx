import React from "react";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Check if the current path is for authentication or public registration
  const isAuthPath = location === "/auth" || 
                    location.startsWith("/register/") ||
                    location.includes("/register-link/");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // If no user and not on an auth path, ProtectedRoute will handle redirecting
  // Only render children without layout for auth paths
  if (!user && isAuthPath) {
    return <>{children}</>;
  }
  
  // If there's no user and we're not on an auth path, still render just the children
  // (the ProtectedRoute will handle the redirect)
  if (!user) {
    return <>{children}</>;
  }

  // User is authenticated, show full layout with sidebar and content
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:flex md:flex-col md:w-64 md:border-r bg-white">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16">
          {children}
        </main>
        {/* Mobile Navigation - only shown on mobile */}
        <MobileNav />
      </div>
    </div>
  );
}