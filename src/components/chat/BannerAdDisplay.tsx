"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { AdSettings } from '@/types';
import { useAdSettings } from '@/contexts/AdSettingsContext';
import { cn } from '@/lib/utils';

interface BannerAdDisplayProps {
  adType: 'standard' | 'native'; // Specify banner type
  placementKey: string;
  className?: string;
  contextual?: boolean; // For conversation-aware placement
  delayMs?: number; // Optional delay before showing
}

const BannerAdDisplay: React.FC<BannerAdDisplayProps> = ({ adType, placementKey, className, contextual, delayMs }) => {
  const { adSettings, isLoadingAdSettings } = useAdSettings();
  const [isVisible, setIsVisible] = useState(false);
  const [adCodeToInject, setAdCodeToInject] = useState<string | null>(null);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const scriptInjectedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // State for ad rotation
  const [currentAdProvider, setCurrentAdProvider] = useState<'adsterra' | 'monetag' | null>(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const AD_ROTATION_INTERVAL = 15000; // 15 seconds interval, adjust as needed

  useEffect(() => {
    // Clear any existing timer when settings or delay change
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Early return if still loading or adSettings is null or ads are not enabled
    if (isLoadingAdSettings || !adSettings || !adSettings.adsEnabledGlobally) {
      setIsVisible(false);
      setAdCodeToInject(null);
      scriptInjectedRef.current = false;
      return;
    }

    let selectedAdCode = "";
    let selectedNetworkEnabled = false;

    // Get the appropriate ad code based on ad type
    switch (adType) {
      case 'standard':
        // Try Adsterra first
        if (adSettings.adsterraBannerEnabled && adSettings.adsterraBannerCode) {
          selectedAdCode = adSettings.adsterraBannerCode;
          selectedNetworkEnabled = adSettings.adsterraBannerEnabled;
          setCurrentAdProvider('adsterra');
        } 
        // Fallback to Monetag if available
        else if (adSettings.monetagBannerEnabled && adSettings.monetagBannerCode) {
          selectedAdCode = adSettings.monetagBannerCode;
          selectedNetworkEnabled = adSettings.monetagBannerEnabled;
          setCurrentAdProvider('monetag');
        }
        break;
      case 'native':
        // Try Adsterra first
        if (adSettings.adsterraNativeBannerEnabled && adSettings.adsterraNativeBannerCode) {
          selectedAdCode = adSettings.adsterraNativeBannerCode;
          selectedNetworkEnabled = adSettings.adsterraNativeBannerEnabled;
          setCurrentAdProvider('adsterra');
        } 
        // Fallback to Monetag if available
        else if (adSettings.monetagNativeBannerEnabled && adSettings.monetagNativeBannerCode) {
          selectedAdCode = adSettings.monetagNativeBannerCode;
          selectedNetworkEnabled = adSettings.monetagNativeBannerEnabled;
          setCurrentAdProvider('monetag');
        }
        break;
      default:
        selectedAdCode = "";
        selectedNetworkEnabled = false;
        break;
    }

    // Only proceed if we have valid ad code and network is enabled
    if (!selectedAdCode || !selectedNetworkEnabled) {
      console.log(`[BannerAdDisplay] No valid ad code for ${adType} ad type. Code: ${!!selectedAdCode}, Enabled: ${selectedNetworkEnabled}`);
      setIsVisible(false);
      setAdCodeToInject(null);
      return;
    }

    // Validate that we have actual ad code, not just placeholder text
    const isValidAdCode = selectedAdCode.trim() !== '' &&
                         !selectedAdCode.toLowerCase().includes('placeholder') &&
                         selectedAdCode.includes('<script');


    if (selectedNetworkEnabled && isValidAdCode) {
      setAdCodeToInject(selectedAdCode);
      if (delayMs !== undefined && delayMs > 0) {
        // Set visibility after a delay if specified
        timerRef.current = setTimeout(() => {
          setIsVisible(true);
        }, delayMs);
      } else {
        setIsVisible(true);
      }
    } else {
      setAdCodeToInject(null);
      setIsVisible(false);
      scriptInjectedRef.current = false;
    }

    // Cleanup timer on unmount or when dependencies change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [adSettings, isLoadingAdSettings, adType, delayMs, currentAdProvider]); // Include currentAdProvider in dependency array

  // Effect to inject ad script when adCodeToInject changes
  useEffect(() => {
    if (!adCodeToInject || !adContainerRef.current) {
      return;
    }

    const container = adContainerRef.current;

    // Clear previous content safely
    const cleanup = () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      // Clean up any scripts we may have added
      const existingScripts = document.head.querySelectorAll(`script[id^="banner-ad-script-${placementKey}-"]`);
      existingScripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
    
    cleanup();

    try {
      // Create a temporary div to parse the ad code
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = adCodeToInject.trim();

      console.log(`[BannerAdDisplay] Injecting ad code:`, adCodeToInject.substring(0, 100) + '...');

      // Find all script tags in the ad code
      const scriptTags = tempDiv.querySelectorAll('script');

      // Create a wrapper div for the ad
      const adWrapper = document.createElement('div');
      adWrapper.className = 'banner-ad-wrapper';
      adWrapper.style.cssText = 'width: 100%; display: flex; justify-content: center; align-items: center; min-height: 90px;';

      // Inject non-script elements first
      const nonScriptNodes = Array.from(tempDiv.childNodes).filter(node => 
        node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName !== 'SCRIPT'
      );

      nonScriptNodes.forEach(node => {
        adWrapper.appendChild(node.cloneNode(true));
      });

      container.appendChild(adWrapper);

      // Then execute scripts
      let scriptLoadPromises: Promise<void>[] = [];

      scriptTags.forEach((script, index) => {
        const scriptPromise = new Promise<void>((resolve, reject) => {
          const newScript = document.createElement('script');
          const scriptId = `banner-ad-script-${placementKey}-${index}-${Date.now()}`;
          newScript.id = scriptId;

          newScript.onload = () => {
            console.log(`[BannerAdDisplay] Script ${index + 1} loaded successfully`);
            resolve();
          };

          newScript.onerror = () => {
            console.error(`[BannerAdDisplay] Script ${index + 1} failed to load`);
            reject(new Error(`Script ${index + 1} failed to load`));
          };

          if (script.src) {
            newScript.src = script.src;
            newScript.async = true;
          } else if (script.innerHTML) {
            newScript.innerHTML = script.innerHTML;
            // For inline scripts, resolve immediately
            setTimeout(resolve, 10);
          }

          // Copy attributes
          Array.from(script.attributes).forEach(attr => {
            if (attr.name !== 'id') {
              newScript.setAttribute(attr.name, attr.value);
            }
          });

          document.head.appendChild(newScript);
        });

        scriptLoadPromises.push(scriptPromise);
      });

      // Wait for all scripts to load
      Promise.allSettled(scriptLoadPromises).then((results) => {
        const successful = results.filter(r => r.status === 'fulfilled').length;
        console.log(`[BannerAdDisplay] ${successful}/${scriptTags.length} scripts loaded successfully for ${adType} ad`);

        // Force a small delay to allow ad to render
        setTimeout(() => {
          if (adWrapper.children.length === 0) {
            adWrapper.innerHTML = '<div style="background: #f0f0f0; padding: 10px; text-align: center; color: #666; border-radius: 4px;">Ad Loading...</div>';
          }
        }, 1000);
      });

      scriptInjectedRef.current = true;
      console.log(`[BannerAdDisplay] Successfully set up ${adType} ad for placement ${placementKey}`);

    } catch (error) {
      console.error(`[BannerAdDisplay] Error injecting ad script for ${adType}:`, error);
      // Show fallback content on error
      if (container) {
        container.innerHTML = '<div style="background: #f9f9f9; padding: 10px; text-align: center; color: #999; border: 1px dashed #ddd; border-radius: 4px;">Ad failed to load</div>';
      }
    }

    // Return cleanup function for proper React DOM management
    return () => {
      if (adContainerRef.current) {
        while (adContainerRef.current.firstChild) {
          adContainerRef.current.removeChild(adContainerRef.current.firstChild);
        }
      }
      // Clean up any scripts we added
      const scriptsToClean = document.head.querySelectorAll(`script[id^="banner-ad-script-${placementKey}-"]`);
      scriptsToClean.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [adCodeToInject, placementKey, adType]);

  // REVENUE-OPTIMIZED rotation - prioritize higher-paying providers
  useEffect(() => {
    // Return early if adSettings is null or still loading
    if (!adSettings || isLoadingAdSettings) {
      setCurrentAdProvider(null);
      return;
    }

    const availableAds = [];

    // Prioritize Adsterra (typically higher CPM)
    if (adSettings.adsterraBannerEnabled && adSettings.adsterraBannerCode &&
        !adSettings.adsterraBannerCode.includes("Placeholder")) {
      availableAds.push('adsterra');
    }

    // Add Monetag for diversity and fallback
    if (adSettings.monetagBannerEnabled && adSettings.monetagBannerCode &&
        !adSettings.monetagBannerCode.includes("Placeholder")) {
      availableAds.push('monetag');
    }

    if (availableAds.length === 0) {
      setCurrentAdProvider(null);
      return;
    }

    // Set the initial ad provider based on the current index
    setCurrentAdProvider(availableAds[currentAdIndex % availableAds.length] as 'adsterra' | 'monetag');

    // Faster rotation for more impressions = more revenue
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => prev + 1);
    }, AD_ROTATION_INTERVAL * 0.75); // 25% faster rotation

    return () => clearInterval(interval);
  }, [adSettings, currentAdIndex, isLoadingAdSettings]);


  if (isLoadingAdSettings) {
    return (
      <div className={cn("w-full animate-pulse", className)}>
        <div className="bg-gray-200 rounded h-[90px]"></div>
      </div>
    );
  }

  if (!isVisible || !adCodeToInject) {
    return null;
  }

  return (
    <div
      ref={adContainerRef}
      className={cn(
        "kruthika-chat-banner-ad-container my-2 flex justify-center items-center min-h-[90px] w-full overflow-hidden",
        "bg-white border border-gray-200 rounded-md shadow-sm",
        className,
        contextual && "kruthika-chat-contextual-ad"
      )}
      key={`${placementKey}-${adType}-${currentAdProvider}-${adCodeToInject?.substring(0, 30)}`}
    >
      {/* Container for actual ad content - no fallback that blocks the ad */}
    </div>
  );
};

export default BannerAdDisplay;