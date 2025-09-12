'use client';

import { useEffect, useRef } from 'react';
import { useAdSettings } from '@/contexts/AdSettingsContext';

// Mock implementations for demonstration purposes if not provided
const GLOBAL_EVENTS = {
  ADMIN_AD_SETTINGS_UPDATED: 'ADMIN_AD_SETTINGS_UPDATED',
  FORCE_REFRESH_ALL: 'FORCE_REFRESH_ALL',
};

class GlobalEventSystem {
  private static instance: GlobalEventSystem;
  private listeners: { [key: string]: ((...args: any[]) => void)[] } = {};

  private constructor() {}

  public static getInstance(): GlobalEventSystem {
    if (!GlobalEventSystem.instance) {
      GlobalEventSystem.instance = new GlobalEventSystem();
    }
    return GlobalEventSystem.instance;
  }

  public on(event: string, callback: (...args: any[]) => void): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(listener => listener !== callback);
    };
  }

  public emit(event: string, ...args: any[]): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}


export default function GlobalAdScripts() {
  const { adSettings, isLoading: isLoadingAdSettings, refreshAdSettings } = useAdSettings();
  const injectedScripts = useRef(new Set<string>());

  // Listen for admin updates
  useEffect(() => {
    const eventSystem = GlobalEventSystem.getInstance();

    const unsubscribeAdUpdate = eventSystem.on(GLOBAL_EVENTS.ADMIN_AD_SETTINGS_UPDATED, () => {
      console.log('[GlobalAdScripts] Admin updated ad settings, refreshing...');
      refreshAdSettings();
    });

    const unsubscribeForceRefresh = eventSystem.on(GLOBAL_EVENTS.FORCE_REFRESH_ALL, () => {
      console.log('[GlobalAdScripts] Force refresh triggered by admin');
      refreshAdSettings();
    });

    return () => {
      unsubscribeAdUpdate();
      unsubscribeForceRefresh();
    };
  }, [refreshAdSettings]);


  useEffect(() => {
    // Return early if still loading or if adSettings is null
    if (isLoadingAdSettings || !adSettings) {
      console.log('GlobalAdScripts: Ads disabled or still loading', { 
        isLoadingAdSettings: isLoadingAdSettings, 
        adSettingsNull: !adSettings 
      });
      return;
    }

    console.log('GlobalAdScripts: Checking ad settings', adSettings);

    // Only inject scripts if ads are enabled and not already present
    const shouldInjectAdsterra = adSettings.adsterraPopunderEnabled && adSettings.adsterraPopunderCode && !injectedScripts.current.has('adsterra-popunder');
    const shouldInjectMonetag = adSettings.monetagPopunderEnabled && adSettings.monetagPopunderCode && !injectedScripts.current.has('monetag-popunder');

    if (shouldInjectAdsterra) {
      const adsterraScript = document.createElement('script');
      adsterraScript.id = 'adsterra-popunder-global';
      adsterraScript.innerHTML = adSettings.adsterraPopunderCode;
      document.head.appendChild(adsterraScript);
      injectedScripts.current.add('adsterra-popunder');
      console.log('Adsterra pop-under script injected.');
    }

    if (shouldInjectMonetag) {
      const monetagScript = document.createElement('script');
      monetagScript.id = 'monetag-popunder-global';
      monetagScript.innerHTML = adSettings.monetagPopunderCode;
      document.head.appendChild(monetagScript);
      injectedScripts.current.add('monetag-popunder');
      console.log('Monetag script injected.');
    }

  }, [adSettings?.adsEnabledGlobally, adSettings?.adsterraPopunderEnabled, adSettings?.adsterraPopunderCode, adSettings?.monetagPopunderEnabled, adSettings?.monetagPopunderCode, isLoadingAdSettings]); // Dependency array includes necessary ad settings and loading state

  return null;
}