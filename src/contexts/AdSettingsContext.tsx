'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { AdSettings } from '@/types';
import { defaultAdSettings } from '@/config/ai';
import { supabase } from '@/lib/supabaseClient';
import { toast } from "@/hooks/use-toast";

interface AdSettingsContextType {
  adSettings: AdSettings | null;
  isLoading: boolean;
  isLoadingAdSettings: boolean;  // Alias for compatibility
  refreshAdSettings: () => Promise<void>;
  updateAdSettings: (settings: AdSettings) => Promise<void>;  // Add missing method
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

  const updateAdSettings = useCallback(async (newSettings: AdSettings) => {
    if (!supabase) {
      console.warn('[AdSettingsContext] Supabase not available for updating settings.');
      return;
    }

    try {
      setIsLoading(true);
      const mappedData = {
        ads_enabled_globally: newSettings.adsEnabledGlobally,
        max_direct_link_ads_per_day: newSettings.maxDirectLinkAdsPerDay,
        max_direct_link_ads_per_session: newSettings.maxDirectLinkAdsPerSession,
        adsterra_direct_link: newSettings.adsterraDirectLink,
        adsterra_direct_link_enabled: newSettings.adsterraDirectLinkEnabled,
        adsterra_banner_code: newSettings.adsterraBannerCode,
        adsterra_banner_enabled: newSettings.adsterraBannerEnabled,
        adsterra_native_banner_code: newSettings.adsterraNativeBannerCode,
        adsterra_native_banner_enabled: newSettings.adsterraNativeBannerEnabled,
        adsterra_social_bar_code: newSettings.adsterraSocialBarCode,
        adsterra_social_bar_enabled: newSettings.adsterraSocialBarEnabled,
        adsterra_popunder_code: newSettings.adsterraPopunderCode,
        adsterra_popunder_enabled: newSettings.adsterraPopunderEnabled,
        monetag_direct_link: newSettings.monetagDirectLink,
        monetag_direct_link_enabled: newSettings.monetagDirectLinkEnabled,
        monetag_banner_code: newSettings.monetagBannerCode,
        monetag_banner_enabled: newSettings.monetagBannerEnabled,
        monetag_native_banner_code: newSettings.monetagNativeBannerCode,
        monetag_native_banner_enabled: newSettings.monetagNativeBannerEnabled,
        monetag_social_bar_code: newSettings.monetagSocialBarCode,
        monetag_social_bar_enabled: newSettings.monetagSocialBarEnabled,
        monetag_popunder_code: newSettings.monetagPopunderCode,
        monetag_popunder_enabled: newSettings.monetagPopunderEnabled,
      };

      const { error } = await supabase
        .from('ad_settings')
        .update(mappedData)
        .eq('id', 'default');

      if (error) throw error;
      await fetchAdSettings(); // Refresh after update
      toast({
        title: "Success",
        description: "Ad settings updated successfully.",
      });
    } catch (err: any) {
      console.error('[AdSettingsContext] Error updating ad settings:', err);
      toast({
        title: "Error",
        description: `Failed to update ad settings: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchAdSettings]);

  return (
    <AdSettingsContext.Provider value={{ 
      adSettings, 
      isLoading, 
      isLoadingAdSettings: isLoading,  // Alias for compatibility
      refreshAdSettings,
      updateAdSettings
    }}>
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
