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
      // Fetch Admin's Own Status
      const { data: adminStatusData, error: adminStatusError } = await supabase
        .from('app_configurations')
        .select('settings')
        .eq('id', ADMIN_OWN_STATUS_CONFIG_KEY)
        .single();

      if (adminStatusError && adminStatusError.code !== 'PGRST116') {
        console.error('Error fetching admin own status from Supabase:', adminStatusError);
        toast({ title: "Error Loading Admin Status", description: `Could not load global admin status. Using defaults. ${adminStatusError.message}`, variant: "destructive" });
        setAdminOwnStatus({
          name: defaultAIProfile.name,
          status: defaultAIProfile.status,
          avatarUrl: defaultAIProfile.avatarUrl,
          statusStoryText: defaultAIProfile.statusStoryText,
          statusStoryImageUrl: defaultAIProfile.statusStoryImageUrl,
          statusStoryHasUpdate: defaultAIProfile.statusStoryHasUpdate
        });
      } else if (adminStatusData && adminStatusData.settings) {
        setAdminOwnStatus({ ...defaultAdminStatusDisplay, ...(adminStatusData.settings as AdminStatusDisplay) });
      } else {
        setAdminOwnStatus({
          name: defaultAIProfile.name,
          status: defaultAIProfile.status,
          avatarUrl: defaultAIProfile.avatarUrl,
          statusStoryText: defaultAIProfile.statusStoryText,
          statusStoryImageUrl: defaultAIProfile.statusStoryImageUrl,
          statusStoryHasUpdate: defaultAIProfile.statusStoryHasUpdate
        });
      }

      // Fetch Managed Demo Contacts
      const { data: demoContactsData, error: demoContactsError } = await supabase
        .from('app_configurations')
        .select('settings')
        .eq('id', MANAGED_DEMO_CONTACTS_CONFIG_KEY)
        .single();

      if (demoContactsError && demoContactsError.code !== 'PGRST116') {
        console.error('Error fetching managed demo contacts from Supabase:', demoContactsError);
        toast({ title: "Error Loading Demo Contacts", description: `Could not load global demo contacts. Using defaults. ${demoContactsError.message}`, variant: "destructive" });
        setManagedDemoContacts(defaultManagedContactStatuses);
      } else if (demoContactsData && Array.isArray(demoContactsData.settings) && demoContactsData.settings.length > 0) {
         // Merge fetched data with defaults to ensure all contacts are present
        const fetchedContacts = demoContactsData.settings as ManagedContactStatus[];
        
        // Create a map of fetched contacts by ID
        const fetchedContactsMap = new Map();
        fetchedContacts.forEach(contact => {
          fetchedContactsMap.set(contact.id, contact);
        });
        
        // Merge with defaults, preferring fetched data where available
        const mergedContacts = defaultManagedContactStatuses.map(defaultContact => {
          const fetchedContact = fetchedContactsMap.get(defaultContact.id);
          return fetchedContact ? { ...defaultContact, ...fetchedContact, enabled: fetchedContact.enabled !== false } : { ...defaultContact, enabled: true };
        });
        
        // Add any extra fetched contacts not in defaults
        fetchedContacts.forEach(fetchedContact => {
          if (!defaultManagedContactStatuses.find(def => def.id === fetchedContact.id)) {
            mergedContacts.push(fetchedContact);
          }
        });
        
        setManagedDemoContacts(mergedContacts);
      } else {
        console.log("[GlobalStatusContext] Using all default managed contacts:", defaultManagedContactStatuses.length);
        setManagedDemoContacts(defaultManagedContactStatuses);
      }

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