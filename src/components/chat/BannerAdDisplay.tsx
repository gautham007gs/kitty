"use client";

import React, { useEffect, useRef } from 'react';
import { useAdSettings } from '@/contexts/AdSettingsContext';

interface BannerAdDisplayProps {
  className?: string;
  placement?: 'top' | 'bottom' | 'middle';
}

const BannerAdDisplay: React.FC<BannerAdDisplayProps> = ({ 
  className = '',
  placement = 'bottom'
}) => {
  const { adSettings, isLoadingAdSettings } = useAdSettings();
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoadingAdSettings || !adSettings?.adsEnabledGlobally || !adSettings?.adsterraBannerEnabled) {
      return;
    }

    const container = adContainerRef.current;
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    // Create a unique container for this ad
    const adDiv = document.createElement('div');
    adDiv.id = `adsterra-banner-${Date.now()}`;
    container.appendChild(adDiv);

    // Create configuration script
    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.innerHTML = `
      (function() {
        var atOptions = {
          'key': '2dc1e58e3be02dd1e015a64b5d1d7d69',
          'format': 'iframe',
          'height': 90,
          'width': 728,
          'params': {}
        };
        window.atOptions = atOptions;

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = 'https://www.highrevenuegate.com/2dc1e58e3be02dd1e015a64b5d1d7d69/invoke.js';
        script.onload = function() {
          console.log('Adsterra banner script loaded successfully');
        };
        script.onerror = function() {
          console.error('Failed to load Adsterra banner script');
        };
        document.head.appendChild(script);
      })();
    `;

    document.head.appendChild(configScript);

    // Cleanup function
    return () => {
      if (configScript.parentNode) {
        configScript.parentNode.removeChild(configScript);
      }
    };

  }, [adSettings, isLoadingAdSettings]);

  if (isLoadingAdSettings || !adSettings?.adsEnabledGlobally || !adSettings?.adsterraBannerEnabled) {
    return null;
  }

  return (
    <div className={`w-full text-center py-4 ${className}`}>
      <div className="text-xs text-muted-foreground mb-2">Advertisement</div>
      <div 
        ref={adContainerRef}
        className="inline-block bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
        style={{ minHeight: '90px', width: '100%', maxWidth: '728px' }}
      />
    </div>
  );
};

export default BannerAdDisplay;