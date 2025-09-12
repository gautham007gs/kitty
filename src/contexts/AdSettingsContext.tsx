'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { AdSettings } from '@/types';
import { defaultAdSettings } from '@/config/ai';
import { supabase } from '@/lib/supabaseClient';
import { toast } from "@/hooks/use-toast";

interface AdSettingsContextType {
  adSettings: AdSettings | null;
  isLoading: boolean;
  isLoadingAdSettings: boolean;
  refreshAdSettings: () => Promise<void>;
  updateAdSettings: (settings: AdSettings) => Promise<void>;
}

const AdSettingsContext = createContext<AdSettingsContextType | undefined>(undefined);

const AD_SETTINGS_CONFIG_KEY = 'ad_settings_kruthika_chat_v1';

// Map ad_settings table columns to AdSettings interface
const mapDbToSettings = (data: any): AdSettings => {
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
    messagesPerAdTrigger: data.messages_per_ad_trigger ?? 7,
    inactivityAdTimeoutMs: data.inactivity_ad_timeout_ms ?? 45000,
    inactivityAdChance: data.inactivity_ad_chance ?? 0.25,
    userMediaInterstitialChance: data.user_media_interstitial_chance ?? 0.15,
  };
};

export const AdSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adSettings, setAdSettings] = useState<AdSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdSettings = useCallback(async () => {
    if (!supabase) {
      console.warn('[AdSettingsContext] Supabase not configured, using defaults');
      setAdSettings(defaultAdSettings);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // First try ad_settings table (primary source)
      const { data: adSettingsData, error: adSettingsError } = await supabase
        .from('ad_settings')
        .select('*')
        .limit(1)
        .single();

      if (adSettingsData && !adSettingsError) {
        console.log('[AdSettingsContext] Ad settings loaded from ad_settings table');
        const settings = mapDbToSettings(adSettingsData);
        setAdSettings(settings);
        return;
      }

      // Fallback to app_configurations table
      const { data: configData, error: configError } = await supabase
        .from('app_configurations')
        .select('settings')
        .eq('id', AD_SETTINGS_CONFIG_KEY)
        .single();

      if (configData && !configError && configData.settings) {
        console.log('[AdSettingsContext] Ad settings loaded from app_configurations fallback');
        const settings = { ...defaultAdSettings, ...configData.settings };
        setAdSettings(settings);
      } else {
        console.log('[AdSettingsContext] Using default ad settings');
        setAdSettings(defaultAdSettings);
      }

    } catch (error: any) {
      console.error('[AdSettingsContext] Error loading ad settings:', error);
      setAdSettings(defaultAdSettings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAdSettings = useCallback(async () => {
    await fetchAdSettings();
  }, [fetchAdSettings]);

  const updateAdSettings = useCallback(async (newSettings: AdSettings) => {
    if (!supabase) {
      console.warn('[AdSettingsContext] Supabase not available for updating');
      return;
    }

    try {
      setIsLoading(true);

      // Update ad_settings table first
      const { error: adTableError } = await supabase
        .from('ad_settings')
        .update({
          ads_enabled_globally: newSettings.adsEnabledGlobally,
          max_direct_link_ads_per_day: newSettings.maxDirectLinkAdsPerDay,
          max_direct_link_ads_per_session: newSettings.maxDirectLinkAdsPerSession,
          adsterraDirectLink: newSettings.adsterraDirectLink,
          adsterraDirectLinkEnabled: newSettings.adsterraDirectLinkEnabled,
          adsterraBannerCode: newSettings.adsterraBannerCode,
          adsterraBannerEnabled: newSettings.adsterraBannerEnabled,
          adsterraNativeBannerCode: newSettings.adsterraNativeBannerCode,
          adsterraNativeBannerEnabled: newSettings.adsterraNativeBannerEnabled,
          adsterraSocialBarCode: newSettings.adsterraSocialBarCode,
          adsterraSocialBarEnabled: newSettings.adsterraSocialBarEnabled,
          adsterraPopunderCode: newSettings.adsterraPopunderCode,
          adsterraPopunderEnabled: newSettings.adsterraPopunderEnabled,
          monetagDirectLink: newSettings.monetagDirectLink,
          monetagDirectLinkEnabled: newSettings.monetagDirectLinkEnabled,
          monetagBannerCode: newSettings.monetagBannerCode,
          monetagBannerEnabled: newSettings.monetagBannerEnabled,
          monetagNativeBannerCode: newSettings.monetagNativeBannerCode,
          monetagNativeBannerEnabled: newSettings.monetagNativeBannerEnabled,
          monetagSocialBarCode: newSettings.monetagSocialBarCode,
          monetagSocialBarEnabled: newSettings.monetagSocialBarEnabled,
          monetagPopunderCode: newSettings.monetagPopunderCode,
          monetagPopunderEnabled: newSettings.monetagPopunderEnabled,
          messages_per_ad_trigger: newSettings.messagesPerAdTrigger,
          inactivity_ad_timeout_ms: newSettings.inactivityAdTimeoutMs,
          inactivity_ad_chance: newSettings.inactivityAdChance,
          user_media_interstitial_chance: newSettings.userMediaInterstitialChance,
          updated_at: new Date().toISOString()
        })
        .eq('id', (await supabase.from('ad_settings').select('id').limit(1).single())?.data?.id);

      // Also update app_configurations for compatibility
      const { error: configError } = await supabase
        .from('app_configurations')
        .upsert({
          id: AD_SETTINGS_CONFIG_KEY,
          settings: newSettings,
          updated_at: new Date().toISOString()
        });

      if (adTableError && configError) {
        throw new Error(`Both updates failed: ${adTableError.message}, ${configError.message}`);
      }

      await refreshAdSettings();

      if (typeof toast !== 'undefined') {
        toast({
          title: "Success",
          description: "Ad settings updated successfully.",
        });
      }

    } catch (err: any) {
      console.error('[AdSettingsContext] Error updating ad settings:', err);
      if (typeof toast !== 'undefined') {
        toast({
          title: "Error",
          description: `Failed to update ad settings: ${err.message}`,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [refreshAdSettings]);

  useEffect(() => {
    fetchAdSettings();
  }, [fetchAdSettings]);

  return (
    <AdSettingsContext.Provider value={{
      adSettings,
      isLoading,
      isLoadingAdSettings: isLoading,
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