"use client";

import React, { useEffect, useRef } from 'react';
import { useAdSettings } from '@/contexts/AdSettingsContext';
import { cn } from '@/lib/utils'; // Assuming cn is available for class merging

interface BannerAdDisplayProps {
  className?: string;
  placement?: 'top' | 'bottom' | 'middle';
  placementKey: string; // Added for unique ad placement identification
  isVisible: boolean; // Added to control ad visibility
}

const BannerAdDisplay: React.FC<BannerAdDisplayProps> = ({ 
  className = '',
  placement = 'bottom',
  placementKey, // Use the passed placementKey
  isVisible
}) => {
  const { adSettings, isLoadingAdSettings } = useAdSettings();
  const adContainerRef = useRef<HTMLDivElement>(null);

  // Removed the useEffect as the new changes inject the script directly via dangerouslySetInnerHTML

  if (isLoadingAdSettings || !adSettings?.adsEnabledGlobally || !adSettings?.adsterraBannerEnabled || !isVisible) {
    return null;
  }

  return (
    <div className={`w-full text-center py-4 ${className}`}>
      <div className="text-xs text-muted-foreground mb-2">Advertisement</div>
      {isVisible && (
        <div 
          className={cn(
            "banner-ad-container bg-gray-50 border border-gray-200 rounded-lg overflow-hidden",
            className
          )}
          style={{ minHeight: '60px' }}
        >
          {/* Adsterra Banner Ad Placeholder */}
          <div 
            id={`adsterra-banner-${placementKey}`}
            className="w-full h-full flex items-center justify-center"
          >
            {/* Fallback ad content when actual ads don't load */}
            <div className="text-xs text-center p-2 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded w-full">
              <div className="text-blue-600 font-semibold mb-1">🎯 WhatApp Premium</div>
              <div className="text-gray-600">Enjoy unlimited conversations!</div>
              <div className="text-xs text-blue-500 mt-1 cursor-pointer hover:underline">
                Learn More →
              </div>
            </div>
          </div>

          {/* Inject actual Adsterra script */}
          <script 
            dangerouslySetInnerHTML={{
              __html: `
                var atOptions = {
                  'key': '4a8dd7e19e3ca24fb02dc3dd4ce87ea9',
                  'format': 'iframe',
                  'height': 60,
                  'width': 468,
                  'params': {}
                };
                document.write('<scr' + 'ipt type="text/javascript" src="//www.topcreativeformat.com/4a8dd7e19e3ca24fb02dc3dd4ce87ea9/invoke.js"></scr' + 'ipt>');
              `
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BannerAdDisplay;