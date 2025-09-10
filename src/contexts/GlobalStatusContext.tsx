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
  globalStatuses: any;  // Alias for compatibility
  isLoadingGlobalStatuses: boolean;
  fetchGlobalStatuses: () => Promise<void>;
  updateGlobalStatus: (statusId: string, updates: any) => Promise<void>;  // Add missing method
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

  const updateGlobalStatus = useCallback(async (statusId: string, updates: any) => {
    if (!supabase) {
      console.warn('[GlobalStatusContext] Supabase not available for updating status.');
      return;
    }

    try {
      if (statusId === 'admin_own_status') {
        const { error } = await supabase
          .from('admin_status_display')
          .update({
            name: updates.name,
            avatar_url: updates.avatarUrl,
            status_text: updates.statusText,
            status_image_url: updates.statusImageUrl,
            has_update: updates.hasUpdate
          })
          .eq('id', 'default');
        
        if (error) throw error;
      } else {
        // Handle managed demo contacts updates
        const { error } = await supabase
          .from('managed_demo_contacts')
          .update(updates)
          .eq('id', statusId);
          
        if (error) throw error;
      }
      
      await fetchGlobalStatuses(); // Refresh after update
      toast({
        title: "Success",
        description: "Status updated successfully.",
      });
    } catch (err: any) {
      console.error('[GlobalStatusContext] Error updating status:', err);
      toast({
        title: "Error",
        description: `Failed to update status: ${err.message}`,
        variant: "destructive"
      });
    }
  }, [fetchGlobalStatuses, toast]);

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
    <GlobalStatusContext.Provider value={{ 
      adminOwnStatus, 
      managedDemoContacts, 
      globalStatuses: { adminOwnStatus, managedDemoContacts },  // Alias for compatibility
      isLoadingGlobalStatuses, 
      fetchGlobalStatuses,
      updateGlobalStatus
    }}>
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