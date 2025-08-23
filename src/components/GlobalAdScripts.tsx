"use client";

import React, { useEffect, useRef } from 'react';
import type { AdSettings } from '@/types';
import { useAdSettings } from '@/contexts/AdSettingsContext'; // Import useAdSettings

const GlobalAdScripts: React.FC = () => {
  const { adSettings, isLoadingAdSettings } = useAdSettings(); // Consume context
  const adsterraPopunderInjected = useRef(false);
  const monetagPopunderInjected = useRef(false);

  useEffect(() => {
    if (isLoadingAdSettings || !adSettings?.adsEnabledGlobally) {
      console.log('GlobalAdScripts: Ads disabled or still loading', { 
        isLoadingAdSettings, 
        adsEnabled: adSettings?.adsEnabledGlobally 
      });
      return;
    }

    console.log('GlobalAdScripts: Checking ad settings', {
      adsterraPopunderEnabled: adSettings.adsterraPopunderEnabled,
      monetagPopunderEnabled: adSettings.monetagPopunderEnabled,
      adsterraCodeExists: !!adSettings.adsterraPopunderCode,
      monetagCodeExists: !!adSettings.monetagPopunderCode
    });

    // Inject Adsterra pop-under if enabled
    if (adSettings.adsterraPopunderEnabled && adSettings.adsterraPopunderCode && 
        !adSettings.adsterraPopunderCode.toLowerCase().includes("placeholder")) {

      if (!adsterraPopunderInjected.current) {
        try {
          const script = document.createElement('script');
          script.type = 'text/javascript';

          // Handle both inline script content and src URLs
          if (adSettings.adsterraPopunderCode.includes('src=')) {
            // Extract src URL if it's a script tag
            const srcMatch = adSettings.adsterraPopunderCode.match(/src=["'](.*?)["']/);
            if (srcMatch) {
              script.src = srcMatch[1];
            } else {
              script.innerHTML = adSettings.adsterraPopunderCode;
            }
          } else {
            script.innerHTML = adSettings.adsterraPopunderCode;
          }

          document.head.appendChild(script);
          adsterraPopunderInjected.current = true;
          console.log('Adsterra pop-under script injected.');
        } catch (e) {
          console.error('Error injecting Adsterra pop-under script:', e);
        }
      }
    }

    // Inject Monetag pop-under if enabled
    if (adSettings.monetagPopunderEnabled && adSettings.monetagPopunderCode && 
        !adSettings.monetagPopunderCode.toLowerCase().includes("placeholder")) {

      if (!monetagPopunderInjected.current) {
        try {
          const script = document.createElement('script');
          script.type = 'text/javascript';

          // Handle both inline script content and src URLs
          if (adSettings.monetagPopunderCode.includes('src=')) {
            // Extract src URL if it's a script tag
            const srcMatch = adSettings.monetagPopunderCode.match(/src=["'](.*?)["']/);
            if (srcMatch) {
              script.src = srcMatch[1];
            } else {
              script.innerHTML = adSettings.monetagPopunderCode;
            }
          } else {
            script.innerHTML = adSettings.monetagPopunderCode;
          }

          document.head.appendChild(script);
          monetagPopunderInjected.current = true;
          console.log('Monetag pop-under script injected.');
        } catch (e) {
          console.error('Error injecting Monetag pop-under script:', e);
        }
      }
    }
  }, [adSettings, isLoadingAdSettings]);

  return null; 
};

export default GlobalAdScripts;