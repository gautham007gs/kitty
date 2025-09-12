
```tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useAdSettings } from '@/contexts/AdSettingsContext';

const GlobalAdScripts: React.FC = () => {
  const { adSettings, isLoadingAdSettings } = useAdSettings();
  const adsterraPopunderInjected = useRef(false);
  const monetagPopunderInjected = useRef(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if we're in admin panel
  const isAdminPanel = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

  useEffect(() => {
    // Clear any existing interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }

    // Early return conditions
    if (isLoadingAdSettings || !adSettings || isAdminPanel) {
      if (isAdminPanel) {
        console.log('GlobalAdScripts: In admin panel, skipping ads');
      }
      return;
    }

    // Only log once when settings are loaded
    console.log('GlobalAdScripts: Checking ad settings', {
      isLoadingAdSettings,
      adSettingsNull: !adSettings,
      adsEnabledGlobally: adSettings?.adsEnabledGlobally,
      isAdminPanel
    });

    if (!adSettings.adsEnabledGlobally) {
      console.log('GlobalAdScripts: Ads disabled or still loading', {
        isLoadingAdSettings,
        adSettingsNull: !adSettings
      });
      return;
    }

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
          } else if (node.nodeType !== Node.TEXT_NODE || node.textContent?.trim()) {
            document.body.appendChild(node.cloneNode(true));
          }
        });

        if (hasValidScriptTag) {
          injectedRef.current = true;
          console.log(`${networkName} script injected successfully`);
        }

      } catch (e) {
        console.error(`Error injecting ${networkName} script:`, e);
      }
    };

    // Inject popunder scripts if enabled
    if (adSettings.adsterraPopunderEnabled && !adsterraPopunderInjected.current) {
      injectScript(adSettings.adsterraPopunderCode, "Adsterra Popunder", adsterraPopunderInjected);
    }

    if (adSettings.monetagPopunderEnabled && !monetagPopunderInjected.current) {
      injectScript(adSettings.monetagPopunderCode, "Monetag Popunder", monetagPopunderInjected);
    }

  }, [adSettings, isLoadingAdSettings, isAdminPanel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  return null;
};

export default GlobalAdScripts;
```
