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

  useEffect(() => {
    let isMounted = true;

    const fetchAdSettings = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);

        // First try to get from ad_settings table
        const { data: adSettingsData, error: adSettingsError } = await supabase
          .from('ad_settings')
          .select('*')
          .limit(1)
          .single();

        if (!isMounted) return;

        if (adSettingsData && !adSettingsError) {
          console.log('[AdSettingsContext] Ad settings loaded successfully from ad_settings table.');

          const settings: AdSettings = {
            adsEnabledGlobally: adSettingsData.ads_enabled_globally ?? true,
            adsterraDirectLink: adSettingsData.adsterra_direct_link ?? '',
            adsterraDirectLinkEnabled: adSettingsData.adsterra_direct_link_enabled ?? false,
            adsterraBannerCode: adSettingsData.adsterra_banner_code ?? '',
            adsterraBannerEnabled: adSettingsData.adsterra_banner_enabled ?? false,
            adsterraNativeBannerCode: adSettingsData.adsterra_native_banner_code ?? '',
            adsterraNativeBannerEnabled: adSettingsData.adsterra_native_banner_enabled ?? false,
            adsterraSocialBarCode: adSettingsData.adsterra_social_bar_code ?? '',
            adsterraSocialBarEnabled: adSettingsData.adsterra_social_bar_enabled ?? false,
            adsterraPopunderCode: adSettingsData.adsterra_popunder_code ?? '',
            adsterraPopunderEnabled: adSettingsData.adsterra_popunder_enabled ?? false,
            monetagDirectLink: adSettingsData.monetag_direct_link ?? '',
            monetagDirectLinkEnabled: adSettingsData.monetag_direct_link_enabled ?? false,
            monetagBannerCode: adSettingsData.monetag_banner_code ?? '',
            monetagBannerEnabled: adSettingsData.monetag_banner_enabled ?? false,
            monetagNativeBannerCode: adSettingsData.monetag_native_banner_code ?? '',
            monetagNativeBannerEnabled: adSettingsData.monetag_native_banner_enabled ?? false,
            monetagSocialBarCode: adSettingsData.monetag_social_bar_code ?? '',
            monetagSocialBarEnabled: adSettingsData.monetag_social_bar_enabled ?? false,
            monetagPopunderCode: adSettingsData.monetag_popunder_code ?? '',
            monetagPopunderEnabled: adSettingsData.monetag_popunder_enabled ?? false,
            maxDirectLinkAdsPerDay: adSettingsData.max_direct_link_ads_per_day ?? 6,
            maxDirectLinkAdsPerSession: adSettingsData.max_direct_link_ads_per_session ?? 3,
            messagesPerAdTrigger: adSettingsData.messages_per_ad_trigger ?? 7,
            inactivityAdTimeoutMs: adSettingsData.inactivity_ad_timeout_ms ?? 45000,
            inactivityAdChance: adSettingsData.inactivity_ad_chance ?? 0.25,
            userMediaInterstitialChance: adSettingsData.user_media_interstitial_chance ?? 0.15,
          };

          setAdSettings(settings);
          setIsLoading(false);
          return;
        }

        // Fallback to app_configurations table
        const { data: configData, error: configError } = await supabase
          .from('app_configurations')
          .select('settings')
          .eq('id', 'ad_settings_kruthika_chat_v1')
          .single();

        if (!isMounted) return;

        if (configData && !configError) {
          console.log('[AdSettingsContext] Ad settings loaded from app_configurations fallback.');
          const settings = configData.settings as AdSettings;
          setAdSettings(settings);
        } else {
          console.log('[AdSettingsContext] Using default ad settings due to database error.');
          setAdSettings(defaultAdSettings);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('[AdSettingsContext] Error loading ad settings:', error);
        setAdSettings(defaultAdSettings);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAdSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshAdSettings = useCallback(async () => {
    console.log('[AdSettingsContext] Force refreshing ad settings...');
    // Re-fetch logic needs to be here. The original code had a good structure.
    // Re-implementing fetchAdSettings logic within useCallback or calling it directly.
    // For now, let's assume fetchAdSettings is accessible here.

    // Direct call to fetchAdSettings defined within useEffect
    // This requires fetchAdSettings to be defined outside or passed as a dependency.
    // Given the structure, let's redefine fetchAdSettings here for clarity or ensure it's accessible.

    // To avoid re-defining the entire fetchAdSettings, we can rely on the useEffect's closure
    // or refactor fetchAdSettings to be outside useEffect.

    // For simplicity and to follow the original code's intent, let's re-invoke the logic.
    // A more robust solution would involve a separate useCallback for fetching.

    // Re-fetching logic:
    try {
      let isMounted = true; // Need to re-establish mount status if this were a standalone function.
      // As it's within the context, it should have access to the context's state.

      setIsLoading(true);

      // First try to get from ad_settings table
      const { data: adSettingsData, error: adSettingsError } = await supabase
        .from('ad_settings')
        .select('*')
        .limit(1)
        .single();

      if (adSettingsData && !adSettingsError) {
        console.log('[AdSettingsContext] Ad settings reloaded successfully from ad_settings table.');
        const settings: AdSettings = {
          adsEnabledGlobally: adSettingsData.ads_enabled_globally ?? true,
          adsterraDirectLink: adSettingsData.adsterra_direct_link ?? '',
          adsterraDirectLinkEnabled: adSettingsData.adsterra_direct_link_enabled ?? false,
          adsterraBannerCode: adSettingsData.adsterra_banner_code ?? '',
          adsterraBannerEnabled: adSettingsData.adsterra_banner_enabled ?? false,
          adsterraNativeBannerCode: adSettingsData.adsterra_native_banner_code ?? '',
          adsterraNativeBannerEnabled: adSettingsData.adsterra_native_banner_enabled ?? false,
          adsterraSocialBarCode: adSettingsData.adsterra_social_bar_code ?? '',
          adsterraSocialBarEnabled: adSettingsData.adsterra_social_bar_enabled ?? false,
          adsterraPopunderCode: adSettingsData.adsterra_popunder_code ?? '',
          adsterraPopunderEnabled: adSettingsData.adsterra_popunder_enabled ?? false,
          monetagDirectLink: adSettingsData.monetag_direct_link ?? '',
          monetagDirectLinkEnabled: adSettingsData.monetag_direct_link_enabled ?? false,
          monetagBannerCode: adSettingsData.monetag_banner_code ?? '',
          monetagBannerEnabled: adSettingsData.monetag_banner_enabled ?? false,
          monetagNativeBannerCode: adSettingsData.monetag_native_banner_code ?? '',
          monetagNativeBannerEnabled: adSettingsData.monetag_native_banner_enabled ?? false,
          monetagSocialBarCode: adSettingsData.monetag_social_bar_code ?? '',
          monetagSocialBarEnabled: adSettingsData.monetag_social_bar_enabled ?? false,
          monetagPopunderCode: adSettingsData.monetag_popunder_code ?? '',
          monetagPopunderEnabled: adSettingsData.monetag_popunder_enabled ?? false,
          maxDirectLinkAdsPerDay: adSettingsData.max_direct_link_ads_per_day ?? 6,
          maxDirectLinkAdsPerSession: adSettingsData.max_direct_link_ads_per_session ?? 3,
          messagesPerAdTrigger: adSettingsData.messages_per_ad_trigger ?? 7,
          inactivityAdTimeoutMs: adSettingsData.inactivity_ad_timeout_ms ?? 45000,
          inactivityAdChance: adSettingsData.inactivity_ad_chance ?? 0.25,
          userMediaInterstitialChance: adSettingsData.user_media_interstitial_chance ?? 0.15,
        };
        setAdSettings(settings);
        setIsLoading(false);
        return;
      }

      // Fallback to app_configurations table
      const { data: configData, error: configError } = await supabase
        .from('app_configurations')
        .select('settings')
        .eq('id', 'ad_settings_kruthika_chat_v1')
        .single();

      if (configData && !configError) {
        console.log('[AdSettingsContext] Ad settings reloaded from app_configurations fallback.');
        const settings = configData.settings as AdSettings;
        setAdSettings(settings);
      } else {
        console.log('[AdSettingsContext] Using default ad settings on refresh due to database error.');
        setAdSettings(defaultAdSettings);
      }
    } catch (error) {
      console.error('[AdSettingsContext] Error refreshing ad settings:', error);
      setAdSettings(defaultAdSettings);
    } finally {
      setIsLoading(false);
    }

  }, []); // Removed dependencies as fetchAdSettings is self-contained here for refresh

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
      await refreshAdSettings(); // Refresh after update
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
  }, [refreshAdSettings]); // Added refreshAdSettings as a dependency

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