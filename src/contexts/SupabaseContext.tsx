'''
'use client';

import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

// Define the shape of our application's state
interface AppState {
  aiProfile: any;
  adSettings: any;
  aiMediaAssets: any[];
  globalStatus: any;
  loading: boolean;
  error: any;
}

// Define the actions that can be dispatched to update the state
type Action = 
  | { type: 'SET_ALL_DATA'; payload: Partial<AppState> }
  | { type: 'SET_AI_PROFILE'; payload: any }
  | { type: 'SET_AD_SETTINGS'; payload: any }
  | { type: 'SET_AI_MEDIA_ASSETS'; payload: any[] }
  | { type: 'SET_GLOBAL_STATUS'; payload: any }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: any };

// Initial state of the application
const initialState: AppState = {
  aiProfile: null,
  adSettings: null,
  aiMediaAssets: [],
  globalStatus: null,
  loading: true,
  error: null,
};

// The reducer function handles state updates based on dispatched actions
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_ALL_DATA':
      return { ...state, ...action.payload, loading: false };
    case 'SET_AI_PROFILE':
      return { ...state, aiProfile: action.payload };
    case 'SET_AD_SETTINGS':
      return { ...state, adSettings: action.payload };
    case 'SET_AI_MEDIA_ASSETS':
      return { ...state, aiMediaAssets: action.payload };
    case 'SET_GLOBAL_STATUS':
        return { ...state, globalStatus: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

// Create the context
const SupabaseContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

// The provider component that will wrap our application
export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Function to fetch all initial data
    const fetchInitialData = async () => {
      try {
        const [profileRes, adsRes, assetsRes, statusRes] = await Promise.all([
          supabase.from('ai_profile_settings').select('*').single(),
          supabase.from('ad_settings').select('*').single(),
          supabase.from('ai_media_assets').select('*'),
          supabase.from('admin_status_display').select('*').single(),
        ]);

        if (profileRes.error) throw profileRes.error;
        if (adsRes.error) throw adsRes.error;
        if (assetsRes.error) throw assetsRes.error;
        if (statusRes.error) throw statusRes.error;

        dispatch({ 
          type: 'SET_ALL_DATA', 
          payload: {
            aiProfile: profileRes.data,
            adSettings: adsRes.data,
            aiMediaAssets: assetsRes.data,
            globalStatus: statusRes.data
          }
        });

      } catch (error: any) {
        console.error("Error fetching initial data:", error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
        toast({ variant: "destructive", title: "Failed to load data", description: error.message });
      }
    };

    fetchInitialData();

    // Set up real-time subscriptions
    const channels = [
      supabase.channel('ai_profile_settings').on('postgres_changes', { event: '*', schema: 'public', table: 'ai_profile_settings' }, payload => {
        dispatch({ type: 'SET_AI_PROFILE', payload: payload.new });
      }).subscribe(),

      supabase.channel('ad_settings').on('postgres_changes', { event: '*', schema: 'public', table: 'ad_settings' }, payload => {
        dispatch({ type: 'SET_AD_SETTINGS', payload: payload.new });
      }).subscribe(),

      supabase.channel('ai_media_assets').on('postgres_changes', { event: '*', schema: 'public', table: 'ai_media_assets' }, async () => {
        const { data, error } = await supabase.from('ai_media_assets').select('*');
        if (error) console.error("Error refetching media assets:", error);
        else dispatch({ type: 'SET_AI_MEDIA_ASSETS', payload: data || [] });
      }).subscribe(),

      supabase.channel('admin_status_display').on('postgres_changes', { event: '*', schema: 'public', table: 'admin_status_display' }, payload => {
        dispatch({ type: 'SET_GLOBAL_STATUS', payload: payload.new });
      }).subscribe()
    ];

    // Cleanup function to remove subscriptions on unmount
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };

  }, []); // Empty dependency array ensures this runs only once

  return (
    <SupabaseContext.Provider value={{ state, dispatch }}>
      {children}
    </SupabaseContext.Provider>
  );
};

// Custom hook to easily access the context
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
'''