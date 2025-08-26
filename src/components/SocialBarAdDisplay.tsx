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