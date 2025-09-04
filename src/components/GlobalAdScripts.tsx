"use client";

import { useEffect } from 'react';
import { useAdSettings } from '@/contexts/AdSettingsContext';
// Assuming GlobalEventSystem and GLOBAL_EVENTS are imported from appropriate files
// For example:
// import { GlobalEventSystem, GLOBAL_EVENTS } from '@/lib/globalEventSystem'; 

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
    const shouldInjectAdsterra = adSettings.adsterraPopunderEnabled && !document.querySelector('script[src*="suv4c1"]');
    const shouldInjectMonetag = adSettings.monetagPopunderEnabled && !document.querySelector('script[src*="thubanoa"]');

    if (shouldInjectAdsterra) {
      const adsterraScript = document.createElement('script');
      adsterraScript.setAttribute('data-cfasync', 'false');
      adsterraScript.src = '//suv4c1.com/c84a8af7a8a64a5eaf8c3f4c5b46b49b/invoke.js';
      adsterraScript.async = true;
      document.head.appendChild(adsterraScript);

      console.log('Adsterra pop-under script injected.');
    }

    if (shouldInjectMonetag) {
      const monetagScript = document.createElement('script');
      monetagScript.setAttribute('data-cfasync', 'false');
      monetagScript.src = '//thubanoa.com/1?z=7865873';
      monetagScript.async = true;
      document.head.appendChild(monetagScript);

      console.log('Monetag script injected.');
    }

  }, [adSettings, isLoadingAdSettings]); // Dependency array includes isLoadingAdSettings

  return null;
}