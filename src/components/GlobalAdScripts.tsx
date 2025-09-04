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
  const { adSettings, isLoadingAdSettings } = useAdSettings();

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
    if (isLoadingAdSettings || !adSettings) {
      console.log("GlobalAdScripts: Ads disabled or still loading", { isLoadingAdSettings, adSettingsNull: !adSettings });
      return;
    }

    console.log("GlobalAdScripts: Checking ad settings", {
      adsterraPopunderEnabled: adSettings.adsterraPopunderEnabled,
      adsterraSocialBarEnabled: adSettings.adsterraSocialBarEnabled,
      adsterraDirectLinkEnabled: adSettings.adsterraDirectLinkEnabled,
      adsterraBannerEnabled: adSettings.adsterraBannerEnabled,
      adsterraDirectLink: adSettings.adsterraDirectLink,
      version: adSettings.version || 'unknown',
      adsEnabledGlobally: adSettings.adsEnabledGlobally,
      maxDirectLinkAdsPerDay: adSettings.maxDirectLinkAdsPerDay,
      maxDirectLinkAdsPerSession: adSettings.maxDirectLinkAdsPerSession,
    });

    if (!adSettings.adsEnabledGlobally) {
      console.log("GlobalAdScripts: Ads globally disabled");
      return;
    }

    // Inject Adsterra Banner if enabled
    if (adSettings.adsterraBannerEnabled && adSettings.adsterraBannerCode) {
      console.log("GlobalAdScripts: Injecting Adsterra Banner");
      const bannerScript = document.createElement('script');
      bannerScript.type = 'text/javascript';
      bannerScript.innerHTML = `
        (function() {
          var atOptions = {
            'key': '2dc1e58e3be02dd1e015a64b5d1d7d69',
            'format': 'iframe',
            'height': 90,
            'width': 728,
            'params': {}
          };
          var script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = 'https://www.highrevenuegate.com/2dc1e58e3be02dd1e015a64b5d1d7d69/invoke.js';
          document.head.appendChild(script);
        })();
      `;
      document.head.appendChild(bannerScript);
    }

    // Inject Adsterra Popunder if enabled
    if (adSettings.adsterraPopunderEnabled && adSettings.adsterraPopunderCode) {
      console.log("GlobalAdScripts: Injecting Adsterra Popunder");
      const popunderScript = document.createElement('script');
      popunderScript.type = 'text/javascript';
      popunderScript.innerHTML = `
        (function() {
          var atOptions = {
            'key': '2dc1e58e3be02dd1e015a64b5d1d7d69',
            'format': 'iframe',
            'height': 50,
            'width': 320,
            'params': {}
          };
          var script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = 'https://www.highrevenuegate.com/2dc1e58e3be02dd1e015a64b5d7d69/invoke.js';
          document.head.appendChild(script);
        })();
      `;
      document.head.appendChild(popunderScript);
    }

    // Inject Adsterra Social Bar if enabled
    if (adSettings.adsterraSocialBarEnabled && adSettings.adsterraSocialBarCode) {
      console.log("GlobalAdScripts: Injecting Adsterra Social Bar");
      const socialBarScript = document.createElement('script');
      socialBarScript.type = 'text/javascript';
      socialBarScript.innerHTML = `
        (function() {
          var atOptions = {
            'key': '2dc1e58e3be02dd1e015a64b5d7d69',
            'format': 'iframe',
            'height': 250,
            'width': 300,
            'params': {}
          };
          var script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = 'https://www.highrevenuegate.com/2dc1e58e3be02dd1e015a64b5d1d7d69/invoke.js';
          document.head.appendChild(script);
        })();
      `;
      document.head.appendChild(socialBarScript);
    }

    // Direct link ads handling
    if (adSettings.adsterraDirectLinkEnabled && adSettings.adsterraDirectLink) {
      console.log("GlobalAdScripts: Direct link ads enabled", adSettings.adsterraDirectLink);
    }

  }, [adSettings, isLoadingAdSettings]);

  return null;
}