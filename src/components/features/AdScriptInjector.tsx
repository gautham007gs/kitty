
'use client';

import { useEffect } from 'react';
import { useAdSettings } from '@/contexts/AdSettingsContext';
import Head from 'next/head';

const AdScriptInjector = () => {
  const { settings, isLoading } = useAdSettings();

  useEffect(() => {
    if (isLoading || !settings || !settings.ads_enabled_globally) {
      return;
    }

    const injectScript = (scriptContent: string, id: string) => {
        if (!scriptContent || document.getElementById(id)) {
            return; // Don't inject if script is empty or already present
        }

        // The script content from the database is a full <script> tag. 
        // We need to parse it to extract the src and other attributes.
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = scriptContent;
        const scriptTag = tempDiv.querySelector('script');

        if (scriptTag) {
            const newScript = document.createElement('script');
            newScript.id = id;
            newScript.async = scriptTag.async;
            newScript.defer = scriptTag.defer;
            
            if (scriptTag.src) {
                 newScript.src = scriptTag.src;
            } else if (scriptTag.innerHTML) {
                newScript.innerHTML = scriptTag.innerHTML;
            }

            // Copy over any other attributes like data-*
            for (const attr of scriptTag.attributes) {
                if (!['id', 'src', 'async', 'defer'].includes(attr.name)) {
                     newScript.setAttribute(attr.name, attr.value);
                }
            }
            
            document.head.appendChild(newScript);
        }
    };

    // --- Adsterra --- 
    if (settings.adsterra_popunder_enabled) {
      injectScript(settings.adsterra_popunder_code, 'adsterra-popunder-script');
    }
    if (settings.adsterra_social_bar_enabled) {
      injectScript(settings.adsterra_social_bar_code, 'adsterra-social-bar-script');
    }

    // --- Monetag ---
    if (settings.monetag_popunder_enabled) {
      injectScript(settings.monetag_popunder_code, 'monetag-popunder-script');
    }
    
    // Note: Banner and Native Banner codes are typically not injected into the head,
    // but are placed in specific components where the ad should appear. 
    // Direct links are used in specific onClick events.

  }, [settings, isLoading]);

  // This component does not render anything itself
  return null; 
};

export default AdScriptInjector;
