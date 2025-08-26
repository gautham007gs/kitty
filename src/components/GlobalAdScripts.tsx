
"use client";

import { useEffect } from 'react';
import { useAdSettings } from '@/contexts/AdSettingsContext';

export default function GlobalAdScripts() {
  const { adSettings, isLoading } = useAdSettings();

  useEffect(() => {
    // Return early if still loading or if adSettings is null
    if (isLoading || !adSettings) {
      console.log('GlobalAdScripts: Ads disabled or still loading', { 
        isLoadingAdSettings: isLoading, 
        adSettingsNull: !adSettings 
      });
      return;
    }

    console.log('GlobalAdScripts: Checking ad settings', adSettings);

    // Only inject scripts if ads are enabled and not already present
    const shouldInjectAdsterra = adSettings.adsterraPopunderEnabled && !document.querySelector('script[data-cfasync="false"][src*="suv4c1"]');
    const shouldInjectMonetag = adSettings.monetagPopunderEnabled && !document.querySelector('script[data-cfasync="false"][src*="monetag"]');

    if (shouldInjectAdsterra) {
      const adsterraScript = document.createElement('script');
      adsterraScript.setAttribute('data-cfasync', 'false');
      adsterraScript.src = '//suv4c1.com/c84a8af7a8a64a5eaf8c3f4c5b46b49b/invoke.js';
      adsterraScript.async = true;
      document.head.appendChild(adsterraScript);
      
      console.log('Adsterra pop-under script injected.');
    }

    if (shouldInjectMonetag) {
      const monetagScript = document.createElement('script');
      monetagScript.setAttribute('data-cfasync', 'false');
      monetagScript.src = '//thubanoa.com/1?z=7865873';
      monetagScript.async = true;
      document.head.appendChild(monetagScript);
      
      console.log('Monetag script injected.');
    }

  }, [adSettings, isLoading]);

  return null;
}
