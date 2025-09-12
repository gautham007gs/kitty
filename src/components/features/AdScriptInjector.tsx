
'use client';

import { useEffect, useRef } from 'react';
import { useAdSettings } from '@/contexts/AdSettingsContext';

const AdScriptInjector = () => {
  const { adSettings, isLoading } = useAdSettings();
  const injectedScripts = useRef(new Set<string>());

  useEffect(() => {
    if (isLoading || !adSettings || !adSettings.adsEnabledGlobally) {
      return;
    }

    const injectScript = (scriptContent: string, id: string) => {
        if (!scriptContent || document.getElementById(id) || injectedScripts.current.has(id)) {
            return; // Don't inject if script is empty or already present
        }

        try {
          // The script content from the database is a full <script> tag. 
          // We need to parse it to extract the src and other attributes.
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = scriptContent;
          const scriptTag = tempDiv.querySelector('script');

          if (scriptTag) {
              const newScript = document.createElement('script');
              newScript.id = id;
              newScript.async = scriptTag.async || true;
              newScript.defer = scriptTag.defer || false;
              
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
              injectedScripts.current.add(id);
              console.log(`Script ${id} injected successfully`);
          }
        } catch (error) {
          console.error(`Error injecting script ${id}:`, error);
        }
    };

    // --- Adsterra --- 
    if (adSettings.adsterraPopunderEnabled && adSettings.adsterraPopunderCode) {
      injectScript(adSettings.adsterraPopunderCode, 'adsterra-popunder-script');
    }
    if (adSettings.adsterraSocialBarEnabled && adSettings.adsterraSocialBarCode) {
      injectScript(adSettings.adsterraSocialBarCode, 'adsterra-social-bar-script');
    }

    // --- Monetag ---
    if (adSettings.monetagPopunderEnabled && adSettings.monetagPopunderCode) {
      injectScript(adSettings.monetagPopunderCode, 'monetag-popunder-script');
    }
    if (adSettings.monetagSocialBarEnabled && adSettings.monetagSocialBarCode) {
      injectScript(adSettings.monetagSocialBarCode, 'monetag-social-bar-script');
    }

  }, [adSettings, isLoading]);

  // This component does not render anything itself
  return null; 
};

export default AdScriptInjector;
