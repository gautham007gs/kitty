
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AdSettings } from '@/types';
import { AD_SETTINGS_CONFIG_KEY } from '@/types'; // Corrected import path
import { defaultAdSettings } from '@/config/ai'; // defaultAdSettings is still from config/ai
import { supabase } from '@/lib/supabaseClient';

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
    setIsLoadingAdSettings(true);
    if (!supabase) {
      console.warn("Supabase client not available for fetching ad settings. Using defaults.");
      setAdSettings(defaultAdSettings);
      setIsLoadingAdSettings(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('app_configurations')
        .select('settings')
        .eq('id', AD_SETTINGS_CONFIG_KEY)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: ' relazione «app_configurations» non trovata o nessuna riga corrisponde al filtro' (no rows found)
        console.error('Error fetching ad settings from Supabase:', error);
        setAdSettings(defaultAdSettings); // Fallback to defaults on error
      } else if (data && data.settings) {
        // Merge fetched settings with defaults to ensure all keys are present
        const mergedSettings = { ...defaultAdSettings, ...(data.settings as AdSettings) };
        setAdSettings(mergedSettings);
      } else {
        // No settings found in Supabase, use defaults (admin might save them later)
        setAdSettings(defaultAdSettings);
      }
    } catch (e) {
      console.error('Unexpected error fetching ad settings:', e);
      setAdSettings(defaultAdSettings); // Fallback to defaults
    } finally {
      setIsLoadingAdSettings(false);
    }
  };

  useEffect(() => {
    fetchAdSettings();
    
    // Set up real-time subscription for ad settings changes
    if (supabase && typeof supabase.channel === 'function') {
      const channel = supabase
        .channel('ad_settings_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'app_configurations',
            filter: `id=eq.${AD_SETTINGS_CONFIG_KEY}`,
          },
          (payload) => {
            console.log('Ad settings changed:', payload);
            fetchAdSettings(); // Refetch when settings change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

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
