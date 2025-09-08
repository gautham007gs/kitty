
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { AIProfile, AdminStatusDisplay, ManagedContactStatus, AIMediaAssetsConfig } from '@/types';
import { defaultAIProfile, defaultAdminStatusDisplay, defaultManagedContactStatuses, defaultAIMediaAssetsConfig } from '@/config/ai';

interface AIProfileContextType {
  profile: AIProfile;
  loading: boolean;
  error: any;
  updateProfile: (newProfile: Partial<AIProfile>) => Promise<void>;
  adminOwnStatus: AdminStatusDisplay;
  managedDemoContacts: ManagedContactStatus[];
  mediaAssetsConfig: AIMediaAssetsConfig;
  fetchGlobalStatuses: () => Promise<void>;
  fetchMediaAssets: () => Promise<void>;
  setExternalIsLoadingAIProfile: (isLoading: boolean) => void;
}

const AIProfileContext = createContext<AIProfileContextType | undefined>(undefined);

let setExternalIsLoadingAIProfile = (isLoading: boolean) => {};

export const AIProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<AIProfile>(defaultAIProfile);
  const [adminOwnStatus, setAdminOwnStatus] = useState<AdminStatusDisplay>(defaultAdminStatusDisplay);
  const [managedDemoContacts, setManagedDemoContacts] = useState<ManagedContactStatus[]>(defaultManagedContactStatuses);
  const [mediaAssetsConfig, setMediaAssetsConfig] = useState<AIMediaAssetsConfig>(defaultAIMediaAssetsConfig);
  const [loading, setLoading] = useState(true);
  const [externalIsLoading, setExternalIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  setExternalIsLoadingAIProfile = setExternalIsLoading;

  const fetchAIProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_profile_settings')
        .select('*')
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Failed to load AI Profile",
        description: err.message,
      });
    }
  };

  const fetchGlobalStatuses = async () => {
    try {
      const { data: adminStatusData, error: adminStatusError } = await supabase
        .from('admin_status_display')
        .select('*')
        .single();

      if (adminStatusError) throw adminStatusError;
      setAdminOwnStatus(adminStatusData);

      const { data: managedContactsData, error: managedContactsError } = await supabase
        .from('managed_demo_contacts')
        .select('*');

      if (managedContactsError) throw managedContactsError;
      setManagedDemoContacts(managedContactsData);
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Failed to load global statuses",
        description: err.message,
      });
    }
  };

  const fetchMediaAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('app_configurations')
        .select('settings')
        .eq('id', 'ai_media_assets_config')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setMediaAssetsConfig(data.settings);
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Failed to load AI media assets",
        description: err.message,
      });
    }
  };


  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([fetchAIProfile(), fetchGlobalStatuses(), fetchMediaAssets()]);
      setLoading(false);
    };

    fetchAllData();

    const channel = supabase
      .channel('ai_profile_settings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_profile_settings' },
        (payload) => {
          setProfile(payload.new as AIProfile);
        }
      )
      .subscribe((status, err) => {
        if (err) {
            console.error("Subscription error:", err);
            setError(err.message);
        }
      });
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateProfile = async (newProfile: Partial<AIProfile>) => {
    try {
        setLoading(true);
        const { data, error } = await supabase
            .from('ai_profile_settings')
            .update(newProfile)
            .eq('id', profile.id)
            .select()
            .single();

        if (error) throw error;
        setProfile(data);
        toast({ title: "Success", description: "AI Profile updated successfully." });
    } catch (err:any) {
        setError(err.message);
        toast({
            variant: "destructive",
            title: "Failed to update profile",
            description: err.message,
        });
    } finally {
        setLoading(false);
    }
  };


  const value = {
      profile,
      loading: loading || externalIsLoading,
      error,
      updateProfile,
      adminOwnStatus,
      managedDemoContacts,
      mediaAssetsConfig,
      fetchGlobalStatuses,
      fetchMediaAssets,
      setExternalIsLoadingAIProfile,
  };

  return (
    <AIProfileContext.Provider value={value}>
      {children}
    </AIProfileContext.Provider>
  );
};

export const useAIProfile = () => {
  const context = useContext(AIProfileContext);
  if (context === undefined) {
    throw new Error('useAIProfile must be used within an AIProfileProvider');
  }
  return context;
};

export { setExternalIsLoadingAIProfile };
