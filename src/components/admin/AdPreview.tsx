'use client';

import React from 'react';
import { useAdSettings } from '@/contexts/AdSettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface AdPreviewProps {
  adType: 'banner' | 'native_banner' | 'social_bar' | 'popunder';
  network: 'adsterra' | 'monetag';
}

const AdPreview: React.FC<AdPreviewProps> = ({ adType, network }) => {
  const { adSettings, isLoading } = useAdSettings();
  
  // Guard against SSR and ensure client-only rendering until data is ready
  if (typeof window === 'undefined' || isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Loading ad preview...</div>
        </CardContent>
      </Card>
    );
  }
  
  if (!adSettings) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Error</CardTitle>
            <Badge variant="secondary">Disabled</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Ad settings not available</div>
        </CardContent>
      </Card>
    );
  }

  // Get ad code and enabled state directly from settings
  const getAdData = () => {
    let code = '';
    let enabled = false;

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

    return { code, enabled };
  };

  const { code: adCode, enabled: isEnabled } = getAdData();
  const isVisible = isEnabled && adCode.trim() !== '' && !adCode.toLowerCase().includes('placeholder');

  const getTitle = () => {
    const typeMap = {
      banner: 'Banner Ad',
      native_banner: 'Native Banner',
      social_bar: 'Social Bar',
      popunder: 'Popunder Ad'
    };
    return `${network.charAt(0).toUpperCase() + network.slice(1)} ${typeMap[adType]}`;
  };

  // Pure React rendering with safe ad code preview
  const renderAdPreview = () => {
    if (!adCode.trim()) {
      return (
        <div className="text-center py-8 text-gray-500">
          No ad code configured
        </div>
      );
    }

    if (adType === 'popunder') {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Popunder Ad Preview</strong><br/>
            This ad runs in the background and opens a new window/tab when triggered.
            Preview not shown to avoid unwanted popups.
          </p>
          <pre className="text-xs mt-2 p-2 bg-white rounded overflow-x-auto whitespace-pre-wrap break-all">
            {adCode}
          </pre>
        </div>
      );
    }

    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Ad Code Preview</strong><br/>
          This shows the ad code structure without executing scripts.
        </p>
        <pre className="text-xs mt-2 p-2 bg-white rounded overflow-x-auto whitespace-pre-wrap break-all">
          {adCode}
        </pre>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{getTitle()}</CardTitle>
          <div className="flex gap-2">
            <Badge variant={isEnabled ? "default" : "secondary"}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
            <Badge variant={isVisible ? "default" : "outline"}>
              {isVisible ? 'Preview Available' : 'No Preview'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="min-h-[120px] w-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center"
          style={{ minHeight: adType === 'banner' ? '90px' : '120px' }}
        >
          {renderAdPreview()}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdPreview;