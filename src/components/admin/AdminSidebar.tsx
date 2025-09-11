
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  User, 
  Megaphone, 
  FileImage, 
  MessageSquare, 
  Activity,
  Settings,
  Eye,
  Menu,
  X,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, description: 'Overview & Analytics' },
    { name: 'Maya Profile', href: '/admin/profile', icon: User, description: 'AI Settings & Bio' },
    { name: 'Status Management', href: '/admin/status', icon: Activity, description: 'Online Status & Presence' },
    { name: 'Ad Management', href: '/admin/ads', icon: Megaphone, description: 'Revenue & Monetization' },
    { name: 'Media Assets', href: '/admin/media', icon: FileImage, description: 'Images & Files' },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, description: 'Performance Metrics' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, description: 'System Configuration' },
  ];

  const quickActions = [
    { name: 'View Chat App', href: '/maya-chat', icon: MessageSquare, external: true },
    { name: 'View Public Status', href: '/status', icon: Activity, external: true },
  ];

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      sessionStorage.removeItem('isAdminLoggedIn_KruthikaChat');
      sessionStorage.removeItem('admin_user_id');
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-lg border-gray-300 hover:bg-gray-50"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          <span className="ml-2 text-xs">Menu</span>
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:fixed top-0 left-0 z-40 h-full
        flex flex-col w-72 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-xl
        transform transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        max-h-screen overflow-y-auto
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-center py-6 px-4 border-b border-gray-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Maya Admin
            </h2>
            <p className="text-xs text-gray-500 mt-1">AI Companion Control</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-3">
          <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Main Navigation</h3>
          {navigation.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                  ${active 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md'
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <IconComponent className={`h-5 w-5 mr-3 ${active ? 'text-white' : 'text-gray-400 group-hover:text-purple-500'}`} />
                <div className="flex-1 min-w-0">
                  <span className="block truncate">{item.name}</span>
                  <span className={`text-xs truncate block ${active ? 'text-purple-100' : 'text-gray-400'}`}>
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 px-4 py-4 space-y-3">
          <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Actions</h3>
          {quickActions.map((item) => {
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <IconComponent className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500" />
                <span className="flex-1 truncate">{item.name}</span>
                {item.external && <Eye className="h-3 w-3 text-gray-400" />}
              </Link>
            );
          })}
        </div>

        {/* Sign Out */}
        <div className="border-t border-gray-200 px-4 py-4">
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <div className="flex items-center px-3 py-2 text-xs text-gray-500 bg-gray-50 rounded-lg">
            <Settings className="h-4 w-4 mr-2 flex-shrink-0" />
            <div className="min-w-0">
              <span className="block font-medium truncate">Maya Chat v2.0</span>
              <span className="block text-gray-400 truncate">AI Companion System</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
