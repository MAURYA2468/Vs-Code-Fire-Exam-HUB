"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

export default function AppLayout({ children, requiredRole }: AppLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/login/${requiredRole}`);
      } else if (user?.role !== requiredRole) {
        // Logged in, but wrong role. Redirect to their correct dashboard or home.
        router.push(user?.role ? `/${user.role}/dashboard` : '/');
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  if (isLoading || !isAuthenticated || user?.role !== requiredRole) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
      </main>
    </div>
  );
}
