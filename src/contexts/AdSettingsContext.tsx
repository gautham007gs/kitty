'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { AdSettings } from '@/types';
import { defaultAdSettings } from '@/config/ai';
import { supabase } from '@/lib/supabaseClient';
import { toast } from "@/hooks/use-toast";

interface AdSettingsContextType {
  adSettings: AdSettings | null;
  isLoading: boolean;
  refreshAdSettings: () => Promise<void>;
}

const AdSettingsContext = createContext<AdSettingsContextType | undefined>(undefined);

// Helper to map DB columns to the AdSettings object
const mapDataToSettings = (data: any): AdSettings => {
  return {
    adsEnabledGlobally: data.ads_enabled_globally ?? defaultAdSettings.adsEnabledGlobally,
    maxDirectLinkAdsPerDay: data.max_direct_link_ads_per_day ?? defaultAdSettings.maxDirectLinkAdsPerDay,
    maxDirectLinkAdsPerSession: data.max_direct_link_ads_per_session ?? defaultAdSettings.maxDirectLinkAdsPerSession,
    adsterraDirectLink: data.adsterra_direct_link ?? defaultAdSettings.adsterraDirectLink,
    adsterraDirectLinkEnabled: data.adsterra_direct_link_enabled ?? defaultAdSettings.adsterraDirectLinkEnabled,
    adsterraBannerCode: data.adsterra_banner_code ?? defaultAdSettings.adsterraBannerCode,
    adsterraBannerEnabled: data.adsterra_banner_enabled ?? defaultAdSettings.adsterraBannerEnabled,
    adsterraNativeBannerCode: data.adsterra_native_banner_code ?? defaultAdSettings.adsterraNativeBannerCode,
    adsterraNativeBannerEnabled: data.adsterra_native_banner_enabled ?? defaultAdSettings.adsterraNativeBannerEnabled,
    adsterraSocialBarCode: data.adsterra_social_bar_code ?? defaultAdSettings.adsterraSocialBarCode,
    adsterraSocialBarEnabled: data.adsterra_social_bar_enabled ?? defaultAdSettings.adsterraSocialBarEnabled,
    adsterraPopunderCode: data.adsterra_popunder_code ?? defaultAdSettings.adsterraPopunderCode,
    adsterraPopunderEnabled: data.adsterra_popunder_enabled ?? defaultAdSettings.adsterraPopunderEnabled,
    monetagDirectLink: data.monetag_direct_link ?? defaultAdSettings.monetagDirectLink,
    monetagDirectLinkEnabled: data.monetag_direct_link_enabled ?? defaultAdSettings.monetagDirectLinkEnabled,
    monetagBannerCode: data.monetag_banner_code ?? defaultAdSettings.monetagBannerCode,
    monetagBannerEnabled: data.monetag_banner_enabled ?? defaultAdSettings.monetagBannerEnabled,
    monetagNativeBannerCode: data.monetag_native_banner_code ?? defaultAdSettings.monetagNativeBannerCode,
    monetagNativeBannerEnabled: data.monetag_native_banner_enabled ?? defaultAdSettings.monetagNativeBannerEnabled,
    monetagSocialBarCode: data.monetag_social_bar_code ?? defaultAdSettings.monetagSocialBarCode,
    monetagSocialBarEnabled: data.monetag_social_bar_enabled ?? defaultAdSettings.monetagSocialBarEnabled,
    monetagPopunderCode: data.monetag_popunder_code ?? defaultAdSettings.monetagPopunderCode,
    monetagPopunderEnabled: data.monetag_popunder_enabled ?? defaultAdSettings.monetagPopunderEnabled,
  };
};

export const AdSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adSettings, setAdSettings] = useState<AdSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdSettings = useCallback(async () => {
    if (!supabase) {
      console.warn('[AdSettingsContext] Supabase not available, using defaults.');
      setAdSettings(defaultAdSettings);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ad_settings')
        .select('*')
        .eq('id', 'default')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw new Error(error.message);
      }

      if (data) {
        const newSettings = mapDataToSettings(data);
        setAdSettings(newSettings);
        console.log('[AdSettingsContext] Ad settings loaded successfully.');
      } else {
        // If no data in ad_settings, use defaults. Fallback logic can be added here if needed.
        console.warn('[AdSettingsContext] No ad settings found in DB, using default settings.');
        setAdSettings(defaultAdSettings);
      }
    } catch (error: any) {
      console.error('[AdSettingsContext] Error fetching ad settings:', error);
      toast({ 
        title: "Error Loading Ad Settings", 
        description: "Could not load ad settings. Using default values.",
        variant: "destructive" 
      });
      setAdSettings(defaultAdSettings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect for initial fetch and real-time subscription
  useEffect(() => {
    fetchAdSettings();

    const channel = supabase
      .channel('ad-settings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ad_settings', filter: 'id=eq:default' },
        (payload) => {
          console.log('[AdSettingsContext] Real-time change detected, refetching ad settings.', payload);
          fetchAdSettings();
        }
      )
      .subscribe();

    // Cleanup function to remove the subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAdSettings]);

  const refreshAdSettings = useCallback(async () => {
    console.log('[AdSettingsContext] Force refreshing ad settings...');
    await fetchAdSettings();
  }, [fetchAdSettings]);

  return (
    <AdSettingsContext.Provider value={{ adSettings, isLoading, refreshAdSettings }}>
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
