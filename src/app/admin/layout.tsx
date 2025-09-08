'use client';
import { useEffect, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { AIProfileProvider } from '@/contexts/AIProfileContext';
import { AdSettingsProvider } from '@/contexts/AdSettingsContext';
import { AIMediaAssetsProvider } from '@/contexts/AIMediaAssetsContext';
import { GlobalStatusProvider } from '@/contexts/GlobalStatusContext';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';

// This component contains the core providers for the application.
// By separating it, we ensure these providers do not get re-rendered on route changes.
const AppProviders = ({ children }: { children: ReactNode }) => (
  <AIProfileProvider>
    <AdSettingsProvider>
      <AIMediaAssetsProvider>
        <GlobalStatusProvider>{children}</GlobalStatusProvider>
      </AIMediaAssetsProvider>
    </AdSettingsProvider>
  </AIProfileProvider>
);

// This component handles the authentication guard for the admin section.
// It ensures that only authenticated users can access the admin pages.
const AuthGuard = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // EFFECT 1: Manages authentication state. Runs only ONCE.
  useEffect(() => {
    // First, check the current session to set the initial state.
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsLoading(false);
    };

    checkInitialSession();

    // Then, set up a listener for real-time auth changes (login/logout).
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setIsLoading(false); // Update loading state on auth change as well.
    });

    // Cleanup the listener when the component unmounts.
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // The empty dependency array is crucial. This effect runs only once.

  // EFFECT 2: Manages routing based on authentication state. Runs on state/path changes.
  useEffect(() => {
    // Don't do anything while the initial auth check is running.
    if (isLoading) {
      return;
    }

    // If the user is NOT authenticated and is not on the login page, redirect them.
    if (!isAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }

    // If the user IS authenticated and they land on the login page, redirect to admin home.
    if (isAuthenticated && pathname === '/admin/login') {
      router.replace('/admin');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Render a loading screen while we check for an active session.
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-gray-100">Loading...</div>;
  }

  // If the user is authenticated and on a protected page, render the admin UI.
  if (isAuthenticated && pathname !== '/admin/login') {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
            <div className="container mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // If the user is not authenticated and on the login page, render the login form.
  if (!isAuthenticated && pathname === '/admin/login') {
    return <>{children}</>;
  }

  // In all other cases (like during a redirect), render nothing to prevent content flashing.
  return null;
};

// The final AdminLayout composes the providers and the auth guard.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <AuthGuard>{children}</AuthGuard>
    </AppProviders>
  );
}