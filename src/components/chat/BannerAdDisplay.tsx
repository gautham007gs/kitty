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

    // Logic to select ad code based on adType and currentAdProvider
    if (adType === "banner") {
      if (currentAdProvider === 'adsterra') {
        selectedAdCode = adSettings.adsterraBannerCode || '';
        selectedNetworkEnabled = adSettings.adsterraBannerEnabled;
      } else {
        selectedAdCode = adSettings.monetagBannerCode || '';
        selectedNetworkEnabled = adSettings.monetagBannerEnabled;
      }
    } else if (adType === "native") {
      if (currentAdProvider === 'adsterra') {
        selectedAdCode = adSettings.adsterraNativeBannerCode || '';
        selectedNetworkEnabled = adSettings.adsterraNativeBannerEnabled;
      } else {
        selectedAdCode = adSettings.monetagNativeBannerCode || '';
        selectedNetworkEnabled = adSettings.monetagNativeBannerEnabled;
      }
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

  useEffect(() => {
    // Inject script only when adCodeToInject is set and container is available
    // and script hasn't been injected yet for this specific code.
    if (adCodeToInject && adContainerRef.current && !scriptInjectedRef.current) {
      // Clear previous content
      adContainerRef.current.innerHTML = '';

      try {
        // Using a more robust way to append script tags
        const fragment = document.createRange().createContextualFragment(adCodeToInject);
        adContainerRef.current.appendChild(fragment);
        scriptInjectedRef.current = true;
      } catch (e) {
        console.error(`Error injecting ${adType} ad script for placement ${placementKey}:`, e);
        scriptInjectedRef.current = false; // Allow retry if code changes
      }
    } else if (!adCodeToInject && adContainerRef.current) {
      adContainerRef.current.innerHTML = ''; // Clear if no ad code
      scriptInjectedRef.current = false;
    }
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
    setCurrentAdProvider(availableAds[currentAdIndex % availableAds.length]);

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
        "kruthika-chat-banner-ad-container my-2 flex justify-center items-center bg-secondary/10 min-h-[50px] w-full overflow-hidden",
        className,
        contextual && "kruthika-chat-contextual-ad" // Apply contextual class if true
      )}
      key={`${placementKey}-${adType}-${currentAdProvider}-${adCodeToInject.substring(0, 30)}`}
    >
      {/* Fallback content while ad loads */}
      <div className="flex items-center justify-center h-[90px] text-gray-400 text-sm">
        Loading advertisement...
      </div>
    </div>
  );
};

export default BannerAdDisplay;