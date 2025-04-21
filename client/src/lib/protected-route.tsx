import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import type { FC } from 'react';

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: FC | (() => React.JSX.Element);
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </Route>
    );
  }

  // Strictly enforce authentication - redirect if no user
  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to auth page');
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
