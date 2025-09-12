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

// The correct config key to match your previous working system
const AD_SETTINGS_CONFIG_KEY = 'ad_settings_kruthika_chat_v1';

// Helper to map DB columns to the AdSettings object - use app_configurations table structure
const mapDataToSettings = (data: any): AdSettings => {
  // If data comes from app_configurations.settings (JSONB), use it directly
  if (data && typeof data === 'object' && data.adsEnabledGlobally !== undefined) {
    return {
      ...defaultAdSettings,
      ...data
    };
  }
  
  // Fallback for old ad_settings table structure
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
      // First try the app_configurations table like the previous working system
      const { data: configData, error: configError } = await supabase
        .from('app_configurations')
        .select('settings')
        .eq('id', AD_SETTINGS_CONFIG_KEY)
        .single();

      if (configData && configData.settings) {
        const newSettings = mapDataToSettings(configData.settings);
        setAdSettings(newSettings);
        console.log('[AdSettingsContext] Ad settings loaded successfully from app_configurations.');
        setIsLoading(false);
        return;
      }

      // Fallback to ad_settings table if app_configurations doesn't have data
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
        console.log('[AdSettingsContext] Ad settings loaded successfully from ad_settings table.');
      } else {
        // If no data in either table, use defaults
        console.warn('[AdSettingsContext] No ad settings found in either table, using default settings.');
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
        { event: '*', schema: 'public', table: 'app_configurations', filter: `id=eq.${AD_SETTINGS_CONFIG_KEY}` },
        (payload) => {
          console.log('[AdSettingsContext] Real-time change detected in app_configurations, refetching ad settings.', payload);
          fetchAdSettings();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ad_settings', filter: 'id=eq.default' },
        (payload) => {
          console.log('[AdSettingsContext] Real-time change detected in ad_settings, refetching ad settings.', payload);
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
      
      // Save to app_configurations table like the previous working system
      const { error } = await supabase
        .from('app_configurations')
        .upsert(
          { 
            id: AD_SETTINGS_CONFIG_KEY, 
            settings: newSettings, 
            updated_at: new Date().toISOString() 
          },
          { onConflict: 'id' }
        );

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
