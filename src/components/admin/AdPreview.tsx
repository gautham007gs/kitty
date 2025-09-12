
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useAdSettings } from '@/contexts/AdSettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdPreviewProps {
  adType: 'banner' | 'native_banner' | 'social_bar' | 'popunder';
  network: 'adsterra' | 'monetag';
}

const AdPreview: React.FC<AdPreviewProps> = ({ adType, network }) => {
  const { adSettings, isLoading } = useAdSettings();
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [adCode, setAdCode] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (isLoading || !adSettings) return;

    let code = '';
    let enabled = false;

    // Get the appropriate ad code and enabled status
    if (network === 'adsterra') {
      switch (adType) {
        case 'banner':
          code = adSettings.adsterraBannerCode || '';
          enabled = adSettings.adsterraBannerEnabled;
          break;
        case 'native_banner':
          code = adSettings.adsterraNativeBannerCode || '';
          enabled = adSettings.adsterraNativeBannerEnabled;
          break;
        case 'social_bar':
          code = adSettings.adsterraSocialBarCode || '';
          enabled = adSettings.adsterraSocialBarEnabled;
          break;
        case 'popunder':
          code = adSettings.adsterraPopunderCode || '';
          enabled = adSettings.adsterraPopunderEnabled;
          break;
      }
    } else {
      switch (adType) {
        case 'banner':
          code = adSettings.monetagBannerCode || '';
          enabled = adSettings.monetagBannerEnabled;
          break;
        case 'native_banner':
          code = adSettings.monetagNativeBannerCode || '';
          enabled = adSettings.monetagNativeBannerEnabled;
          break;
        case 'social_bar':
          code = adSettings.monetagSocialBarCode || '';
          enabled = adSettings.monetagSocialBarEnabled;
          break;
        case 'popunder':
          code = adSettings.monetagPopunderCode || '';
          enabled = adSettings.monetagPopunderEnabled;
          break;
      }
    }

    setAdCode(code);
    setIsEnabled(enabled);
    setIsVisible(enabled && code.trim() !== '' && !code.toLowerCase().includes('placeholder'));
  }, [adSettings, isLoading, adType, network]);

  useEffect(() => {
    const container = adContainerRef.current;
    if (!container) return;

    // Cleanup function to remove all added content
    const cleanup = () => {
      // Remove all child elements safely
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };

    // Clear previous content
    cleanup();

    if (isVisible && adCode) {
      try {
        // For popunder ads, don't inject the script in preview (it would trigger)
        if (adType === 'popunder') {
          const previewDiv = document.createElement('div');
          previewDiv.className = 'p-4 bg-yellow-50 border border-yellow-200 rounded';
          previewDiv.innerHTML = `
            <p class="text-sm text-yellow-800">
              <strong>Popunder Ad Preview</strong><br/>
              This ad runs in the background and opens a new window/tab when triggered.
              Preview not shown to avoid unwanted popups.
            </p>
            <pre class="text-xs mt-2 p-2 bg-white rounded overflow-x-auto">${adCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          `;
          container.appendChild(previewDiv);
        } else {
          // For banner and other visible ads, show a safe preview
          const previewDiv = document.createElement('div');
          previewDiv.className = 'p-4 bg-blue-50 border border-blue-200 rounded';
          previewDiv.innerHTML = `
            <p class="text-sm text-blue-800">
              <strong>Ad Code Preview</strong><br/>
              This shows the ad code structure without executing scripts.
            </p>
            <pre class="text-xs mt-2 p-2 bg-white rounded overflow-x-auto">${adCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          `;
          container.appendChild(previewDiv);
        }
      } catch (error) {
        console.error('Error creating ad preview:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'p-4 bg-red-50 border border-red-200 rounded';
        errorDiv.innerHTML = `<p class="text-sm text-red-800">Error loading ad preview: ${String(error)}</p>`;
        container.appendChild(errorDiv);
      }
    }

    // Return cleanup function
    return cleanup;
  }, [isVisible, adCode, adType]);

  const getTitle = () => {
    const typeMap = {
      banner: 'Banner Ad',
      native_banner: 'Native Banner',
      social_bar: 'Social Bar',
      popunder: 'Popunder Ad'
    };
    return `${network.charAt(0).toUpperCase() + network.slice(1)} ${typeMap[adType]}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{getTitle()}</CardTitle>
          <div className="flex gap-2">
            <Badge variant={isEnabled ? 'default' : 'secondary'}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
            <Badge variant={isVisible ? 'default' : 'outline'}>
              {isVisible ? 'Active' : 'No Code'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={adContainerRef}
          className="min-h-[100px] border border-dashed border-gray-300 rounded p-4 bg-gray-50"
          style={{ 
            minHeight: adType === 'banner' ? '90px' : 
                       adType === 'social_bar' ? '60px' : '100px' 
          }}
        >
          {!isVisible && (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              {!isEnabled ? 'Ad is disabled' : 
               !adCode.trim() ? 'No ad code configured' :
               adCode.toLowerCase().includes('placeholder') ? 'Placeholder code detected' :
               'Ad not visible'}
            </div>
          )}
        </div>
        {isVisible && adType !== 'popunder' && (
          <div className="mt-2 text-xs text-gray-600">
            Ad should be visible above. If you see a blank box, check the ad code validity.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdPreview;
