
'use client';

import React from 'react';

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

    // Add mobile-specific meta tags
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    }

    // Prevent zoom on inputs for iOS
    const addNoZoomClass = () => {
      document.body.classList.add('admin-no-zoom');
    };

    const removeNoZoomClass = () => {
      document.body.classList.remove('admin-no-zoom');
    };

    addNoZoomClass();

    return () => {
      sessionStorage.removeItem('isAdminPanel');
      removeNoZoomClass();
      // Restore ad elements when leaving admin
      adElements.forEach(element => {
        (element as HTMLElement).style.display = '';
      });
    };
  }, []);

  return (
    <div className="admin-panel-wrapper min-h-screen w-full" data-admin-panel="true">
      <style jsx global>{`
        .admin-panel-wrapper [data-ad],
        .admin-panel-wrapper .ad-banner,
        .admin-panel-wrapper .ad-container,
        .admin-panel-wrapper .banner-ad,
        .admin-panel-wrapper .social-bar-ad {
          display: none !important;
        }
        
        /* Mobile optimizations */
        .admin-no-zoom input,
        .admin-no-zoom textarea,
        .admin-no-zoom select {
          font-size: 16px !important;
        }
        
        @media (max-width: 768px) {
          .admin-panel-wrapper {
            overflow-x: hidden;
          }
          
          .admin-panel-wrapper * {
            -webkit-overflow-scrolling: touch;
          }
          
          /* Improve touch targets */
          .admin-panel-wrapper button,
          .admin-panel-wrapper [role="button"] {
            min-height: 44px;
            min-width: 44px;
          }
          
          /* Better spacing on mobile */
          .admin-panel-wrapper .container {
            padding-left: 16px;
            padding-right: 16px;
          }
        }
        
        /* Prevent horizontal scroll */
        .admin-panel-wrapper {
          overflow-x: hidden;
          width: 100%;
          max-width: 100vw;
        }
        
        /* Enhanced focus states for accessibility */
        .admin-panel-wrapper *:focus {
          outline: 2px solid hsl(var(--primary));
          outline-offset: 2px;
        }
      `}</style>
      {children}
    </div>
  );
};

export default AdminLayout;
