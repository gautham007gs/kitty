"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { AdminStatusDisplay, ManagedContactStatus } from '@/types';
import { ADMIN_OWN_STATUS_CONFIG_KEY, MANAGED_DEMO_CONTACTS_CONFIG_KEY } from '@/types';
import { defaultAdminStatusDisplay, defaultManagedContactStatuses } from '@/config/ai';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { defaultAIProfile } from '@/config/ai'; // Assuming defaultAIProfile is imported from here

interface GlobalStatusContextType {
  adminOwnStatus: AdminStatusDisplay | null;
  managedDemoContacts: ManagedContactStatus[] | null;
  isLoadingGlobalStatuses: boolean;
  fetchGlobalStatuses: () => Promise<void>;
  // updateAdminOwnStatus: (newStatus: AdminStatusDisplay) => Promise<void>; // May not be needed here if admin panel handles saves
  // updateManagedDemoContacts: (newContacts: ManagedContactStatus[]) => Promise<void>; // May not beneeded here
}

const GlobalStatusContext = createContext<GlobalStatusContextType | undefined>(undefined);

export const GlobalStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adminOwnStatus, setAdminOwnStatus] = useState<AdminStatusDisplay | null>(null);
  const [managedDemoContacts, setManagedDemoContacts] = useState<ManagedContactStatus[] | null>(null);
  const [isLoadingGlobalStatuses, setIsLoadingGlobalStatuses] = useState(true);
  const { toast } = useToast();

  const fetchGlobalStatuses = useCallback(async () => {
    setIsLoadingGlobalStatuses(true);
    if (!supabase) {
      console.warn("Supabase client not available for fetching global statuses. Using defaults.");
      setAdminOwnStatus({
          name: defaultAIProfile.name,
          status: defaultAIProfile.status,
          avatarUrl: defaultAIProfile.avatarUrl,
          statusStoryText: defaultAIProfile.statusStoryText,
          statusStoryImageUrl: defaultAIProfile.statusStoryImageUrl,
          statusStoryHasUpdate: defaultAIProfile.statusStoryHasUpdate
        });
      setManagedDemoContacts(defaultManagedContactStatuses);
      setIsLoadingGlobalStatuses(false);
      return;
    }

    try {
      // Fetch admin own status from dedicated table
      const { data: adminStatusData, error: adminStatusError } = await supabase
        .from('admin_status_display')
        .select('*')
        .eq('id', 'default')
        .single();

      if (adminStatusError && adminStatusError.code !== 'PGRST116') {
        console.warn('[GlobalStatusContext] Admin status error, using defaults:', adminStatusError);
        setAdminOwnStatus(defaultAdminStatusDisplay);
      } else if (adminStatusData) {
        const adminStatus: AdminStatusDisplay = {
          name: adminStatusData.name || defaultAdminStatusDisplay.name,
          avatarUrl: adminStatusData.avatar_url || defaultAdminStatusDisplay.avatarUrl,
          statusText: adminStatusData.status_text || defaultAdminStatusDisplay.statusText,
          statusImageUrl: adminStatusData.status_image_url || defaultAdminStatusDisplay.statusImageUrl,
          hasUpdate: adminStatusData.has_update || defaultAdminStatusDisplay.hasUpdate
        };
        setAdminOwnStatus(adminStatus);
      } else {
        setAdminOwnStatus(defaultAdminStatusDisplay);
      }

      // Fetch managed demo contacts from dedicated table
      const { data: contactsData, error: contactsError } = await supabase
        .from('managed_demo_contacts')
        .select('*')
        .eq('enabled', true)
        .order('id');

      if (contactsError) {
        console.warn('[GlobalStatusContext] Contacts error, using defaults:', contactsError);
        setManagedDemoContacts(defaultManagedContactStatuses);
      } else if (contactsData && contactsData.length > 0) {
        const contacts: ManagedContactStatus[] = contactsData.map(contact => ({
          id: contact.id,
          name: contact.name,
          avatarUrl: contact.avatar_url,
          statusText: contact.status_text || '',
          statusImageUrl: contact.status_image_url || undefined,
          hasUpdate: contact.has_update || false,
          enabled: contact.enabled !== false,
          dataAiHint: contact.data_ai_hint || 'profile person'
        }));
        setManagedDemoContacts(contacts);
      } else {
        setManagedDemoContacts(defaultManagedContactStatuses);
      }

      // Also try backward compatibility with app_configurations
      if (!adminStatusData || !contactsData?.length) {
        console.log('[GlobalStatusContext] Trying backward compatibility with app_configurations');

        if (!adminStatusData) {
          const { data: backupAdminData } = await supabase
            .from('app_configurations')
            .select('settings')
            .eq('id', ADMIN_OWN_STATUS_CONFIG_KEY)
            .single();

          if (backupAdminData?.settings) {
            const adminStatusSettings = backupAdminData.settings as Partial<AdminStatusDisplay>;
            const mergedAdminStatus: AdminStatusDisplay = { 
              ...defaultAdminStatusDisplay, 
              ...adminStatusSettings 
            };
            setAdminOwnStatus(mergedAdminStatus);
          }
        }

        if (!contactsData?.length) {
          const { data: backupContactsData } = await supabase
            .from('app_configurations')
            .select('settings')
            .eq('id', MANAGED_DEMO_CONTACTS_CONFIG_KEY)
            .single();

          if (backupContactsData?.settings) {
            const contactsSettings = backupContactsData.settings as ManagedContactStatus[];
            const finalContacts = (contactsSettings && Array.isArray(contactsSettings) && contactsSettings.length > 0) 
              ? contactsSettings 
              : defaultManagedContactStatuses;

            setManagedDemoContacts(finalContacts);
          }
        }
      }

      console.log('[GlobalStatusContext] Successfully fetched global statuses');
    } catch (e: any) {
      console.error('Unexpected error fetching global statuses:', e);
      toast({ title: "Error Loading Global Statuses", description: `Unexpected error. Using defaults. ${e.message}`, variant: "destructive" });
      setAdminOwnStatus({
          name: defaultAIProfile.name,
          status: defaultAIProfile.status,
          avatarUrl: defaultAIProfile.avatarUrl,
          statusStoryText: defaultAIProfile.statusStoryText,
          statusStoryImageUrl: defaultAIProfile.statusStoryImageUrl,
          statusStoryHasUpdate: defaultAIProfile.statusStoryHasUpdate
        });
      setManagedDemoContacts(defaultManagedContactStatuses);
    } finally {
      setIsLoadingGlobalStatuses(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGlobalStatuses();

    // Set up real-time subscription for global status changes
    if (supabase && typeof supabase.channel === 'function') {
      const channel = supabase
        .channel('global_status_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'app_configurations',
            filter: `id=in.(${ADMIN_OWN_STATUS_CONFIG_KEY},${MANAGED_DEMO_CONTACTS_CONFIG_KEY})`,
          },
          (payload) => {
            console.log('Global status changed:', payload);
            fetchGlobalStatuses(); // Refetch when status changes
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchGlobalStatuses]);

  return (
    <GlobalStatusContext.Provider value={{ adminOwnStatus, managedDemoContacts, isLoadingGlobalStatuses, fetchGlobalStatuses }}>
      {children}
    </GlobalStatusContext.Provider>
  );
};

export const useGlobalStatus = (): GlobalStatusContextType => {
  const context = useContext(GlobalStatusContext);
  if (context === undefined) {
    throw new Error('useGlobalStatus must be used within a GlobalStatusProvider');
  }
  return context;
};