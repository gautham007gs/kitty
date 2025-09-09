'''
'use client';

import { createContext, useContext, useEffect, useReducer, ReactNode, useRef } from 'react';
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
  const channelsRef = useRef<any[]>([]);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate initialization
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Function to fetch all initial data
    const fetchInitialData = async () => {
      try {
        console.log('[SupabaseContext] Fetching initial data...');
        
        // Fetch data with proper error handling
        const results = await Promise.allSettled([
          supabase.from('ai_profile_settings').select('*').single(),
          supabase.from('ad_settings').select('*').single(),
          supabase.from('ai_media_assets').select('*'),
          supabase.from('admin_status_display').select('*').single(),
        ]);

        const [profileRes, adsRes, assetsRes, statusRes] = results;

        const payload: Partial<AppState> = {};

        if (profileRes.status === 'fulfilled' && !profileRes.value.error) {
          payload.aiProfile = profileRes.value.data;
        }
        if (adsRes.status === 'fulfilled' && !adsRes.value.error) {
          payload.adSettings = adsRes.value.data;
        }
        if (assetsRes.status === 'fulfilled' && !assetsRes.value.error) {
          payload.aiMediaAssets = assetsRes.value.data || [];
        }
        if (statusRes.status === 'fulfilled' && !statusRes.value.error) {
          payload.globalStatus = statusRes.value.data;
        }

        dispatch({ type: 'SET_ALL_DATA', payload });
        console.log('[SupabaseContext] Initial data loaded successfully');

      } catch (error: any) {
        console.error("[SupabaseContext] Error fetching initial data:", error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    };

    // Setup realtime subscriptions with unique channel names
    const setupSubscriptions = () => {
      try {
        // Clear existing channels first
        channelsRef.current.forEach(channel => {
          try {
            supabase.removeChannel(channel);
          } catch (e) {
            console.warn('[SupabaseContext] Error removing channel:', e);
          }
        });
        channelsRef.current = [];

        // Create new subscriptions with unique names
        const profileChannel = supabase
          .channel(`main_ai_profile_${Date.now()}`)
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'ai_profile_settings' 
          }, (payload) => {
            console.log('[SupabaseContext] AI Profile updated:', payload);
            if (payload.new) {
              dispatch({ type: 'SET_AI_PROFILE', payload: payload.new });
            }
          })
          .subscribe((status, err) => {
            if (err) console.error('[SupabaseContext] Profile subscription error:', err);
            else console.log('[SupabaseContext] Profile subscription status:', status);
          });

        const adChannel = supabase
          .channel(`main_ad_settings_${Date.now()}`)
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'ad_settings' 
          }, (payload) => {
            console.log('[SupabaseContext] Ad Settings updated:', payload);
            if (payload.new) {
              dispatch({ type: 'SET_AD_SETTINGS', payload: payload.new });
            }
          })
          .subscribe((status, err) => {
            if (err) console.error('[SupabaseContext] Ad settings subscription error:', err);
            else console.log('[SupabaseContext] Ad settings subscription status:', status);
          });

        const mediaChannel = supabase
          .channel(`main_media_assets_${Date.now()}`)
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'ai_media_assets' 
          }, async () => {
            console.log('[SupabaseContext] Media assets updated, refetching...');
            try {
              const { data, error } = await supabase.from('ai_media_assets').select('*');
              if (error) {
                console.error("[SupabaseContext] Error refetching media assets:", error);
              } else {
                dispatch({ type: 'SET_AI_MEDIA_ASSETS', payload: data || [] });
              }
            } catch (e) {
              console.error('[SupabaseContext] Media refetch error:', e);
            }
          })
          .subscribe((status, err) => {
            if (err) console.error('[SupabaseContext] Media subscription error:', err);
            else console.log('[SupabaseContext] Media subscription status:', status);
          });

        const statusChannel = supabase
          .channel(`main_status_display_${Date.now()}`)
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'admin_status_display' 
          }, (payload) => {
            console.log('[SupabaseContext] Status updated:', payload);
            if (payload.new) {
              dispatch({ type: 'SET_GLOBAL_STATUS', payload: payload.new });
            }
          })
          .subscribe((status, err) => {
            if (err) console.error('[SupabaseContext] Status subscription error:', err);
            else console.log('[SupabaseContext] Status subscription status:', status);
          });

        channelsRef.current = [profileChannel, adChannel, mediaChannel, statusChannel];
        console.log('[SupabaseContext] Realtime subscriptions established');

      } catch (error) {
        console.error('[SupabaseContext] Subscription setup error:', error);
      }
    };

    // Initialize data and subscriptions
    fetchInitialData();
    setupSubscriptions();

    // Cleanup function
    return () => {
      console.log('[SupabaseContext] Cleaning up subscriptions...');
      channelsRef.current.forEach(channel => {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          console.warn('[SupabaseContext] Error removing channel during cleanup:', e);
        }
      });
      channelsRef.current = [];
      isInitializedRef.current = false;
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