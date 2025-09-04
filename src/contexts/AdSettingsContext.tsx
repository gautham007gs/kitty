"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AdSettings } from '@/types';
import { AD_SETTINGS_CONFIG_KEY } from '@/types'; // Corrected import path
import { defaultAdSettings } from '@/config/ai'; // defaultAdSettings is still from config/ai
import { supabase } from '@/lib/supabaseClient';
import { toast } from "@/components/ui/use-toast";


interface AdSettingsContextType {
  adSettings: AdSettings | null;
  isLoading: boolean;
  fetchAdSettings: () => Promise<void>; // Allow manual refetch if needed
  refreshAdSettings: () => Promise<void>; // Force refresh from server
}

const AdSettingsContext = createContext<AdSettingsContextType | undefined>(undefined);

export const AdSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adSettings, setAdSettings] = useState<AdSettings | null>(null);
  const [isLoadingAdSettings, setIsLoadingAdSettings] = useState(true);

  const fetchAdSettings = async () => {
    if (!supabase) {
      console.warn('[AdSettingsContext] Supabase client not available, using defaultAdSettings');
      setAdSettings(defaultAdSettings);
      setIsLoadingAdSettings(false);
      return;
    }

    try {
      setIsLoadingAdSettings(true);

      // Try new dedicated table first
      const { data, error } = await supabase
        .from('ad_settings')
        .select('*')
        .eq('id', 'default')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('[AdSettingsContext] Error fetching from ad_settings, trying fallback:', error);

        // Try backward compatibility with app_configurations
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('app_configurations')
          .select('settings')
          .eq('id', AD_SETTINGS_CONFIG_KEY)
          .single();

        if (fallbackError || !fallbackData?.settings) {
          console.error('[AdSettingsContext] Error fetching ad settings from both tables:', fallbackError);
          toast({ title: "Error Loading Ad Settings", description: `Could not load ad settings. Using defaults. ${error.message}`, variant: "destructive" });
          setAdSettings(defaultAdSettings);
          return;
        }

        // Process fallback data
        const fetchedSettings = fallbackData.settings as Partial<AdSettings>;
        const mergedSettings: AdSettings = {
          ...defaultAdSettings,
          ...fetchedSettings,
          maxDirectLinkAdsPerDay: fetchedSettings.maxDirectLinkAdsPerDay ?? defaultAdSettings.maxDirectLinkAdsPerDay,
          maxDirectLinkAdsPerSession: fetchedSettings.maxDirectLinkAdsPerSession ?? defaultAdSettings.maxDirectLinkAdsPerSession,
        };
        setAdSettings(mergedSettings);
        console.log('[AdSettingsContext] Successfully loaded ad settings from fallback');

      } else if (data) {
        // Process data from new table structure
        const fetchedSettings: AdSettings = {
          adsEnabledGlobally: data.ads_enabled_globally !== null ? data.ads_enabled_globally : defaultAdSettings.adsEnabledGlobally,
          maxDirectLinkAdsPerDay: data.max_direct_link_ads_per_day ?? defaultAdSettings.maxDirectLinkAdsPerDay,
          maxDirectLinkAdsPerSession: data.max_direct_link_ads_per_session ?? defaultAdSettings.maxDirectLinkAdsPerSession,
          adsterraDirectLink: data.adsterra_direct_link || defaultAdSettings.adsterraDirectLink,
          adsterraDirectLinkEnabled: data.adsterra_direct_link_enabled !== null ? data.adsterra_direct_link_enabled : defaultAdSettings.adsterraDirectLinkEnabled,
          adsterraBannerCode: data.adsterra_banner_code || defaultAdSettings.adsterraBannerCode,
          adsterraBannerEnabled: data.adsterra_banner_enabled !== null ? data.adsterra_banner_enabled : defaultAdSettings.adsterraBannerEnabled,
          adsterraNativeBannerCode: data.adsterra_native_banner_code || defaultAdSettings.adsterraNativeBannerCode,
          adsterraNativeBannerEnabled: data.adsterra_native_banner_enabled !== null ? data.adsterra_native_banner_enabled : defaultAdSettings.adsterraNativeBannerEnabled,
          adsterraSocialBarCode: data.adsterra_social_bar_code || defaultAdSettings.adsterraSocialBarCode,
          adsterraSocialBarEnabled: data.adsterra_social_bar_enabled !== null ? data.adsterra_social_bar_enabled : defaultAdSettings.adsterraSocialBarEnabled,
          adsterraPopunderCode: data.adsterra_popunder_code || defaultAdSettings.adsterraPopunderCode,
          adsterraPopunderEnabled: data.adsterra_popunder_enabled !== null ? data.adsterra_popunder_enabled : defaultAdSettings.adsterraPopunderEnabled,
          monetagDirectLink: data.monetag_direct_link || defaultAdSettings.monetagDirectLink,
          monetagDirectLinkEnabled: data.monetag_direct_link_enabled !== null ? data.monetag_direct_link_enabled : defaultAdSettings.monetagDirectLinkEnabled,
          monetagBannerCode: data.monetag_banner_code || defaultAdSettings.monetagBannerCode,
          monetagBannerEnabled: data.monetag_banner_enabled !== null ? data.monetag_banner_enabled : defaultAdSettings.monetagBannerEnabled,
          monetagNativeBannerCode: data.monetag_native_banner_code || defaultAdSettings.monetagNativeBannerCode,
          monetagNativeBannerEnabled: data.monetag_native_banner_enabled !== null ? data.monetag_native_banner_enabled : defaultAdSettings.monetagNativeBannerEnabled,
          monetagSocialBarCode: data.monetag_social_bar_code || defaultAdSettings.monetagSocialBarCode,
          monetagSocialBarEnabled: data.monetag_social_bar_enabled !== null ? data.monetag_social_bar_enabled : defaultAdSettings.monetagSocialBarEnabled,
          monetagPopunderCode: data.monetag_popunder_code || defaultAdSettings.monetagPopunderCode,
          monetagPopunderEnabled: data.monetag_popunder_enabled !== null ? data.monetag_popunder_enabled : defaultAdSettings.monetagPopunderEnabled
        };

        setAdSettings(fetchedSettings);
        console.log('[AdSettingsContext] Successfully loaded ad settings from new table');
      } else {
        console.log('[AdSettingsContext] No ad settings data found, using defaults');
        setAdSettings(defaultAdSettings);
      }
    } catch (error: any) {
      console.error('[AdSettingsContext] Unexpected error fetching ad settings:', error);
      toast({ title: "Unexpected Error", description: `Unexpected error loading ad settings. ${error.message || ''}`, variant: "destructive" });
      setAdSettings(defaultAdSettings);
    } finally {
      setIsLoadingAdSettings(false);
    }
  };

  useEffect(() => {
    fetchAdSettings();

    // Listen for real-time updates
    const handleGlobalUpdate = (event: CustomEvent) => {
      if (event.detail.type === 'AD_SETTINGS_UPDATED') {
        fetchAdSettings();
      }
    };

    window.addEventListener('globalSettingsUpdate', handleGlobalUpdate as EventListener);

    return () => {
      window.removeEventListener('globalSettingsUpdate', handleGlobalUpdate as EventListener);
    };
  }, [fetchAdSettings]);

  const refreshAdSettings = async () => {
    console.log('[AdSettingsContext] Force refreshing ad settings...');
    await fetchAdSettings();
  };

  return (
    <AdSettingsContext.Provider value={{ adSettings, isLoading: isLoadingAdSettings, fetchAdSettings, refreshAdSettings }}>
      {children}
    </AdSettingsContext.Provider>
  );
};

export const useAdSettings = (): AdSettingsContextType => {
  const context = useContext(AdSettingsContext);
  if (context === undefined) {
    throw new Error('useAdSettings must be used within an AdSettingsProvider');
  }
  return context;
};