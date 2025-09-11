
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
          setIsAuthenticated(false);
          setIsLoading(false);
          router.push('/admin/login');
          return;
        }

        // Verify with Supabase that the session is still valid
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session || !session.user) {
          console.log('🔒 Supabase session invalid, clearing local auth and redirecting');
          sessionStorage.removeItem(ADMIN_AUTH_KEY);
          sessionStorage.removeItem('admin_user_id');
          setIsAuthenticated(false);
          setIsLoading(false);
          router.push('/admin/login');
          return;
        }

        // Verify the session user matches our stored admin user
        if (session.user.id !== adminUserId) {
          console.log('🔒 Session user mismatch, clearing auth and redirecting');
          sessionStorage.removeItem(ADMIN_AUTH_KEY);
          sessionStorage.removeItem('admin_user_id');
          setIsAuthenticated(false);
          setIsLoading(false);
          router.push('/admin/login');
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
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push('/admin/login');
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
          router.push('/admin/login');
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

  // Show unauthorized state if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">You must be logged in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
