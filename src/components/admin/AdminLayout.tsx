'use client';

import React from 'react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  // Override any global ad contexts for admin pages
  React.useEffect(() => {
    // Hide any global ad elements that might be injected
    const adElements = document.querySelectorAll('[data-ad], .ad-banner, .ad-container');
    adElements.forEach(element => {
      (element as HTMLElement).style.display = 'none';
    });

    // Set admin flag to prevent ad loading
    sessionStorage.setItem('isAdminPanel', 'true');

    return () => {
      sessionStorage.removeItem('isAdminPanel');
      // Restore ad elements when leaving admin
      adElements.forEach(element => {
        (element as HTMLElement).style.display = '';
      });
    };
  }, []);

  return (
    <div className="admin-panel-wrapper min-h-screen w-full bg-gray-50" data-admin-panel="true">
      <style jsx global>{`
        .admin-panel-wrapper [data-ad],
        .admin-panel-wrapper .ad-banner,
        .admin-panel-wrapper .ad-container,
        .admin-panel-wrapper .banner-ad,
        .admin-panel-wrapper .social-bar-ad {
          display: none !important;
        }

        /* Prevent horizontal scroll */
        .admin-panel-wrapper {
          overflow-x: hidden;
          width: 100%;
          max-width: 100vw;
        }

        /* Mobile optimizations */
        @media (max-width: 1024px) {
          .admin-panel-wrapper {
            overflow-x: hidden;
          }

          .admin-main-content {
            margin-left: 0 !important;
            width: 100% !important;
          }

          /* Better spacing on mobile */
          .admin-panel-wrapper .container {
            padding-left: 12px;
            padding-right: 12px;
          }

          /* Mobile responsive grids */
          .admin-panel-wrapper .grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }

          /* Mobile friendly inputs */
          .admin-panel-wrapper input,
          .admin-panel-wrapper textarea,
          .admin-panel-wrapper select {
            padding: 12px;
            border-radius: 8px;
            font-size: 16px;
          }
        }

        @media (max-width: 640px) {
          .admin-panel-wrapper .text-3xl {
            font-size: 1.5rem;
          }

          .admin-panel-wrapper .text-2xl {
            font-size: 1.25rem;
          }

          .admin-panel-wrapper .p-8 {
            padding: 16px;
          }

          .admin-panel-wrapper .p-6 {
            padding: 12px;
          }
        }

        /* Desktop layout */
        @media (min-width: 1024px) {
          .admin-main-content {
            margin-left: 288px; /* sidebar width */
            width: calc(100% - 288px);
          }
        }

        /* Enhanced focus states for accessibility */
        .admin-panel-wrapper *:focus {
          outline: 2px solid hsl(var(--primary));
          outline-offset: 2px;
        }
      `}</style>

      <div className="flex min-h-screen relative">
        <AdminSidebar />
        <main className="admin-main-content flex-1 min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 w-full max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;