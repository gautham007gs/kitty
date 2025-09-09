'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel - Kruthika Chat',
  description: 'Administrative dashboard for managing AI chatbot settings',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Skip auth check for login page
        if (pathname === '/admin/login') {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // Check session storage first (for immediate feedback)
        const sessionAuth = sessionStorage.getItem('isAdminLoggedIn_KruthikaChat');

        if (!sessionAuth) {
          console.log('No session found, redirecting to login');
          router.push('/admin/login');
          return;
        }

        // Verify with Supabase
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth verification error:', error);
          sessionStorage.removeItem('isAdminLoggedIn_KruthikaChat');
          sessionStorage.removeItem('admin_user_id');
          router.push('/admin/login');
          return;
        }

        if (!session?.user) {
          console.log('No valid session, redirecting to login');
          sessionStorage.removeItem('isAdminLoggedIn_KruthikaChat');
          sessionStorage.removeItem('admin_user_id');
          router.push('/admin/login');
          return;
        }

        console.log('Admin authenticated successfully');
        setIsAuthenticated(true);

      } catch (error) {
        console.error('Authentication check failed:', error);
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);

      if (event === 'SIGNED_OUT' && pathname !== '/admin/login') {
        sessionStorage.removeItem('isAdminLoggedIn_KruthikaChat');
        sessionStorage.removeItem('admin_user_id');
        router.push('/admin/login');
      } else if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated (will redirect, but show loading in the meantime)
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}