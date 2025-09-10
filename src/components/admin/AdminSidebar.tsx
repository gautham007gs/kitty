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
  Globe
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const AdminSidebar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, description: 'Overview & Analytics' },
    { name: 'Maya Profile', href: '/admin/profile', icon: User, description: 'AI Settings & Bio' },
    { name: 'Ad Management', href: '/admin/ads', icon: Megaphone, description: 'Revenue & Monetization' },
    { name: 'Media Assets', href: '/admin/media', icon: FileImage, description: 'Images & Files' },
  ];

  const quickActions = [
    { name: 'View Chat App', href: '/maya-chat', icon: MessageSquare, external: true },
    { name: 'View Status', href: '/status', icon: Activity, external: true },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

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
        fixed lg:relative top-0 left-0 z-40 h-full
        flex flex-col w-72 px-4 py-6 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-xl
        transform transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        max-h-screen overflow-y-auto
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-center mb-8 px-2">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Maya Admin
            </h2>
            <p className="text-xs text-gray-500 mt-1">AI Companion Control</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-3 mb-6">
          <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Main Navigation</h3>
          {navigation.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-4 py-3 mx-2 text-sm font-medium rounded-xl transition-all duration-200 group
                  ${active 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md'
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <IconComponent className={`h-5 w-5 mr-3 ${active ? 'text-white' : 'text-gray-400 group-hover:text-purple-500'}`} />
                <div className="flex-1">
                  <span className="block">{item.name}</span>
                  <span className={`text-xs ${active ? 'text-purple-100' : 'text-gray-400'}`}>
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 pt-6 space-y-3">
          <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Actions</h3>
          {quickActions.map((item) => {
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                className="flex items-center px-4 py-2 mx-2 text-sm text-gray-600 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <IconComponent className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500" />
                <span className="flex-1">{item.name}</span>
                {item.external && <Eye className="h-3 w-3 text-gray-400" />}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-gray-200 mt-6">
          <div className="flex items-center px-4 py-3 text-xs text-gray-500 bg-gray-50 rounded-lg">
            <Settings className="h-4 w-4 mr-2" />
            <div>
              <span className="block font-medium">Maya Chat v2.0</span>
              <span className="block text-gray-400">AI Companion System</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;