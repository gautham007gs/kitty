'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      // Skip auth check for login page
      if (pathname === '/admin/login') {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Check for admin session cookie
      const hasAdminSession = document.cookie
        .split(';')
        .some(cookie => cookie.trim().startsWith('admin-session=true'));

      if (!hasAdminSession) {
        console.log('🔒 Admin session not found, redirecting to login');
        router.push('/admin/login');
        return;
      }

      console.log('🔓 Admin authenticated');
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">Please log in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}