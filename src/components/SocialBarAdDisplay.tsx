
"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { AdSettings } from '@/types';
import { useAdSettings } from '@/contexts/AdSettingsContext';
import { cn } from '@/lib/utils';

interface SocialBarAdDisplayProps {
  className?: string;
  placementKey?: string;
}

const SocialBarAdDisplay: React.FC<SocialBarAdDisplayProps> = ({ 
  className,
  placementKey = 'social-bar'
}) => {
  const { adSettings, isLoading } = useAdSettings();
  const [isVisible, setIsVisible] = useState(false);
  const [adCodeToInject, setAdCodeToInject] = useState<string | null>(null);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const scriptInjectedRef = useRef(false);

  useEffect(() => {
    // Early return if still loading or adSettings is null
    if (isLoading || !adSettings) {
      setIsVisible(false);
      setAdCodeToInject(null);
      scriptInjectedRef.current = false;
      return;
    }

    // Check if ads are globally enabled and social bar is enabled
    if (!adSettings.adsEnabledGlobally || !adSettings.adsterraSocialBarEnabled) {
      setIsVisible(false);
      setAdCodeToInject(null);
      scriptInjectedRef.current = false;
      return;
    }

    // Check if we have valid ad code
    if (adSettings.adsterraSocialBarCode && 
        !adSettings.adsterraSocialBarCode.toLowerCase().includes("placeholder") &&
        adSettings.adsterraSocialBarCode.trim()) {
      setAdCodeToInject(adSettings.adsterraSocialBarCode);
      setIsVisible(true);
    } else {
      setAdCodeToInject(null);
      setIsVisible(false);
      scriptInjectedRef.current = false;
    }
  }, [adSettings, isLoading]);

  useEffect(() => {
    // Inject script only when adCodeToInject is set and container is available
    if (adCodeToInject && adContainerRef.current && !scriptInjectedRef.current) {
      // Clear previous content
      adContainerRef.current.innerHTML = '';

      try {
        // Using a more robust way to append script tags
        const fragment = document.createRange().createContextualFragment(adCodeToInject);
        adContainerRef.current.appendChild(fragment);
        scriptInjectedRef.current = true;
      } catch (e) {
        console.error(`Error injecting social bar ad script for placement ${placementKey}:`, e);
        scriptInjectedRef.current = false;
      }
    } else if (!adCodeToInject && adContainerRef.current) {
      adContainerRef.current.innerHTML = '';
      scriptInjectedRef.current = false;
    }
  }, [adCodeToInject, placementKey]);

  if (isLoading || !isVisible || !adCodeToInject) {
    return null;
  }

  return (
    <div
      ref={adContainerRef}
      className={cn(
        "kruthika-social-bar-ad fixed bottom-0 left-0 w-full z-40 bg-white/95 backdrop-blur-sm border-t border-gray-200",
        className
      )}
      key={`${placementKey}-socialbar-${adCodeToInject.substring(0, 30)}`}
    />
  );
};

export default SocialBarAdDisplay;

const SocialBarAdDisplay: React.FC = () => {
  const { adSettings, isLoadingAdSettings } = useAdSettings();
  const [isVisible, setIsVisible] = useState(false);
  const [adCodeToInject, setAdCodeToInject] = useState<string | null>(null);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const scriptInjectedRef = useRef(false); // To prevent re-injecting the same script

  useEffect(() => {
    if (isLoadingAdSettings || !adSettings || !adSettings.adsEnabledGlobally) {
      setIsVisible(false);
      setAdCodeToInject(null);
      scriptInjectedRef.current = false;
      return;
    }

    let selectedAdCode = "";
    let selectedNetworkEnabled = false;

    // Prioritize Adsterra Social Bar if both are enabled and have valid code
    if (adSettings.adsterraSocialBarEnabled && adSettings.adsterraSocialBarCode && !adSettings.adsterraSocialBarCode.toLowerCase().includes("placeholder")) {
      selectedAdCode = adSettings.adsterraSocialBarCode;
      selectedNetworkEnabled = true;
    } else if (adSettings.monetagSocialBarEnabled && adSettings.monetagSocialBarCode && !adSettings.monetagSocialBarCode.toLowerCase().includes("placeholder")) {
      selectedAdCode = adSettings.monetagSocialBarCode;
      selectedNetworkEnabled = true;
    }
    
    if (selectedNetworkEnabled && selectedAdCode.trim()) {
      // If the code changes, allow re-injection
      if (adCodeToInject !== selectedAdCode) {
        scriptInjectedRef.current = false;
      }
      setAdCodeToInject(selectedAdCode);
      setIsVisible(true);
    } else {
      setAdCodeToInject(null);
      setIsVisible(false);
      scriptInjectedRef.current = false;
    }
  }, [adSettings, isLoadingAdSettings, adCodeToInject]); // adCodeToInject in dep array for re-eval when it changes

  useEffect(() => {
    // Inject script only when adCodeToInject is set, container is available, and script hasn't been injected yet
    if (adCodeToInject && adContainerRef.current && !scriptInjectedRef.current) {
      // Clear previous content to handle potential ad code changes
      adContainerRef.current.innerHTML = '';
      
      try {
        const fragment = document.createRange().createContextualFragment(adCodeToInject);
        adContainerRef.current.appendChild(fragment);
        scriptInjectedRef.current = true; // Mark as injected for this specific code
      } catch (e) {
        console.error("Error injecting Social Bar ad script:", e);
        // Potentially allow retry if the code changes later by not setting injected to true
        // scriptInjectedRef.current = false; // Or keep true to prevent multiple failed attempts with same code
      }
    } else if (!adCodeToInject && adContainerRef.current) {
      // If no ad code is to be injected (e.g., disabled), clear the container
      adContainerRef.current.innerHTML = '';
      scriptInjectedRef.current = false;
    }
  }, [adCodeToInject]); // Re-run effect when adCodeToInject changes

  if (isLoadingAdSettings || !isVisible || !adCodeToInject) {
    return null; 
  }

  return (
    <div
      ref={adContainerRef}
      className={cn(
        "kruthika-social-bar-ad-container fixed left-0 right-0 z-[90] w-full", 
        "flex justify-center items-center transition-all duration-300",
        // Smart positioning: show at top on mobile, bottom on desktop
        "top-16 md:bottom-0", // Top on mobile (below header), bottom on desktop
        "md:mb-20" // Add margin bottom on desktop to avoid chat input
      )}
      key={`social-bar-${adCodeToInject.substring(0,30)}`}
    />
  );
};

export default SocialBarAdDisplay;
