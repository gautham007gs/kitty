
"use client";

import React, { useEffect, useRef } from 'react';
import type { AdSettings } from '@/types';
import { useAdSettings } from '@/contexts/AdSettingsContext';

const GlobalAdScripts: React.FC = () => {
  const { adSettings, isLoadingAdSettings } = useAdSettings();
  const adsterraPopunderInjected = useRef(false);
  const monetagPopunderInjected = useRef(false);
  const adsterraSocialBarInjected = useRef(false);
  
  // Check if we're in admin panel to prevent ads
  const isAdminPanel = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

  useEffect(() => {
    console.log('GlobalAdScripts: Checking ad settings', { 
      isLoadingAdSettings, 
      adSettingsNull: !adSettings, 
      adsEnabledGlobally: adSettings?.adsEnabledGlobally,
      isAdminPanel 
    });

    if (isLoadingAdSettings || !adSettings) {
      console.log('GlobalAdScripts: Ads disabled or still loading', { isLoadingAdSettings, adSettingsNull: !adSettings });
      return;
    }

    if (isAdminPanel) {
      console.log('GlobalAdScripts: In admin panel, skipping ads');
      return;
    }

    if (typeof document === 'undefined') {
      return;
    }

    /**
     * Injects a script into the document body.
     * WARNING: Using innerHTML to parse script code from an untrusted source can be a security risk (XSS).
     * Ensure that the source of `scriptCode` (i.e., your ad settings) is strictly controlled and sanitized.
     *
     * Consider alternative, safer methods for injecting external scripts provided by ad networks.
     * Consult the specific ad network documentation for recommended integration methods in modern web applications.
     *
     * @param scriptCode The script code to inject.
     */
    const injectScript = (scriptCode: string, networkName: string, injectedRef: React.MutableRefObject<boolean>) => {
      if (injectedRef.current || !scriptCode || !scriptCode.trim() || scriptCode.toLowerCase().includes('placeholder')) {
        return; 
      }

      try {
        const scriptContainer = document.createElement('div');
        scriptContainer.innerHTML = scriptCode; 
        
        let hasValidScriptTag = false;
        Array.from(scriptContainer.childNodes).forEach(node => {
          if (node.nodeName === "SCRIPT") {
            const scriptTag = document.createElement('script');
            const originalScript = node as HTMLScriptElement;
            
            for (let i = 0; i < originalScript.attributes.length; i++) {
              const attr = originalScript.attributes[i];
              scriptTag.setAttribute(attr.name, attr.value);
            }
            scriptTag.innerHTML = originalScript.innerHTML;
            
            if (scriptTag.src || scriptTag.innerHTML.trim()) {
              hasValidScriptTag = true;
              document.body.appendChild(scriptTag);
            }
          } else {
            // Append other nodes like comments, noscript tags, etc.
            // Check if it's not just whitespace text node
            if (node.nodeType !== Node.TEXT_NODE || node.textContent?.trim()) {
                document.body.appendChild(node.cloneNode(true));
            }
          }
        });

        if(hasValidScriptTag){
            injectedRef.current = true;
            console.log(`${networkName} script injected successfully.`);
        }

      } catch (e) {
        console.error(`Error injecting ${networkName} script:`, e);
      }
    };

    console.log('GlobalAdScripts: Checking ad settings', adSettings);

    if (adSettings.adsEnabledGlobally) {
      // Adsterra Pop-under
      if (adSettings.adsterraPopunderEnabled && !adsterraPopunderInjected.current) {
        injectScript(adSettings.adsterraPopunderCode, "Adsterra Popunder", adsterraPopunderInjected);
      }

      // Monetag Pop-under
      if (adSettings.monetagPopunderEnabled && !monetagPopunderInjected.current) {
        injectScript(adSettings.monetagPopunderCode, "Monetag Popunder", monetagPopunderInjected);
      }

      // Adsterra Social Bar
      if (adSettings.adsterraSocialBarEnabled && !adsterraSocialBarInjected.current) {
        injectScript(adSettings.adsterraSocialBarCode, "Adsterra Social Bar", adsterraSocialBarInjected);
      }
    }

  }, [adSettings, isLoadingAdSettings, isAdminPanel]);

  return null; 
};

export default GlobalAdScripts;
