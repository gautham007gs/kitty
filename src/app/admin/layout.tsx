
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import AdminLayout from '@/components/admin/AdminLayout';

const ADMIN_AUTH_KEY = 'isAdminLoggedIn_KruthikaChat';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we're on the login page - allow access without auth
        if (pathname === '/admin/login') {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // Check sessionStorage first for quick auth state
        const isLoggedIn = sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
        const adminUserId = sessionStorage.getItem('admin_user_id');

        if (!isLoggedIn || !adminUserId) {
          console.log('🔒 Admin session not found, redirecting to login');
          setIsLoading(false);
          router.replace('/admin/login');
          return;
        }

        // Verify with Supabase that the session is still valid
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session || !session.user) {
          console.log('🔒 Supabase session invalid, clearing local auth and redirecting');
          sessionStorage.removeItem(ADMIN_AUTH_KEY);
          sessionStorage.removeItem('admin_user_id');
          setIsLoading(false);
          router.replace('/admin/login');
          return;
        }

        // Verify the session user matches our stored admin user
        if (session.user.id !== adminUserId) {
          console.log('🔒 Session user mismatch, clearing auth and redirecting');
          sessionStorage.removeItem(ADMIN_AUTH_KEY);
          sessionStorage.removeItem('admin_user_id');
          setIsLoading(false);
          router.replace('/admin/login');
          return;
        }

        // All checks passed - user is authenticated
        console.log('✅ Admin authentication verified');
        setIsAuthenticated(true);
        setIsLoading(false);

      } catch (error) {
        console.error('❌ Auth check failed:', error);
        sessionStorage.removeItem(ADMIN_AUTH_KEY);
        sessionStorage.removeItem('admin_user_id');
        setIsLoading(false);
        router.replace('/admin/login');
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        console.log('🔒 Auth state changed to signed out');
        sessionStorage.removeItem(ADMIN_AUTH_KEY);
        sessionStorage.removeItem('admin_user_id');
        setIsAuthenticated(false);
        if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // For login page, render directly without auth check
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // For other admin pages, require authentication
  if (!isAuthenticated) {
    // Don't show access denied, just redirect
    if (typeof window !== 'undefined') {
      router.replace('/admin/login');
    }
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
