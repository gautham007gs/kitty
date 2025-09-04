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

    if (adType === 'standard') {
      // Prioritize Adsterra for standard banners if both enabled
      if (adSettings.adsterraBannerEnabled && adSettings.adsterraBannerCode && !adSettings.adsterraBannerCode.toLowerCase().includes("placeholder")) {
        selectedAdCode = adSettings.adsterraBannerCode;
        selectedNetworkEnabled = true;
      } else if (adSettings.monetagBannerEnabled && adSettings.monetagBannerCode && !adSettings.monetagBannerCode.toLowerCase().includes("placeholder")) {
        selectedAdCode = adSettings.monetagBannerCode;
        selectedNetworkEnabled = true;
      }
    } else if (adType === 'native') {
      // Prioritize Adsterra for native banners if both enabled
      if (adSettings.adsterraNativeBannerEnabled && adSettings.adsterraNativeBannerCode && !adSettings.adsterraNativeBannerCode.toLowerCase().includes("placeholder")) {
        selectedAdCode = adSettings.adsterraNativeBannerCode;
        selectedNetworkEnabled = true;
      } else if (adSettings.monetagNativeBannerEnabled && adSettings.monetagNativeBannerCode && !adSettings.monetagNativeBannerCode.toLowerCase().includes("placeholder")) {
        selectedAdCode = adSettings.monetagNativeBannerCode;
        selectedNetworkEnabled = true;
      }
    }

    if (selectedNetworkEnabled && selectedAdCode.trim()) {
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
  }, [adSettings, isLoadingAdSettings, adType, delayMs]); // Include delayMs in dependency array

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
      availableAds.push('adsterra', 'adsterra'); // Double weight for higher revenue
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

    setCurrentAdProvider(availableAds[currentAdIndex % availableAds.length]);

    // Faster rotation for more impressions = more revenue
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % availableAds.length);
    }, AD_ROTATION_INTERVAL * 0.75); // 25% faster rotation

    return () => clearInterval(interval);
  }, [adSettings, currentAdIndex, isLoadingAdSettings]);


  if (isLoadingAdSettings || !isVisible || !adCodeToInject || !currentAdProvider) {
    return null; 
  }

  // Key includes adCodeToInject to attempt re-render if the code itself changes.
  // However, direct script injection might need more nuanced handling if the *same*
  // container is reused for *different* ad codes frequently.
  return (
    <div
      ref={adContainerRef}
      className={cn(
        "kruthika-chat-banner-ad-container my-2 flex justify-center items-center bg-secondary/10 min-h-[50px] w-full overflow-hidden",
        className,
        contextual && "kruthika-chat-contextual-ad" // Apply contextual class if true
      )}
      key={`${placementKey}-${adType}-${currentAdProvider}-${adCodeToInject.substring(0, 30)}`} 
    />
  );
};

export default BannerAdDisplay;