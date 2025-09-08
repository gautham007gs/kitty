'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { AdminStatusDisplay, ManagedContactStatus } from '@/types';
import { defaultAdminStatusDisplay, defaultManagedContactStatuses } from '@/config/ai';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface GlobalStatusContextType {
  adminOwnStatus: AdminStatusDisplay | null;
  managedDemoContacts: ManagedContactStatus[] | null;
  isLoadingGlobalStatuses: boolean;
  fetchGlobalStatuses: () => Promise<void>;
}

const GlobalStatusContext = createContext<GlobalStatusContextType | undefined>(undefined);

// Maps data from the 'admin_status_display' table to the AdminStatusDisplay type
const mapAdminStatus = (data: any): AdminStatusDisplay => ({
  name: data.name ?? defaultAdminStatusDisplay.name,
  avatarUrl: data.avatar_url ?? defaultAdminStatusDisplay.avatarUrl,
  statusText: data.status_text ?? defaultAdminStatusDisplay.statusText,
  statusImageUrl: data.status_image_url ?? defaultAdminStatusDisplay.statusImageUrl,
  hasUpdate: data.has_update ?? defaultAdminStatusDisplay.hasUpdate,
});

// Maps data from the 'managed_demo_contacts' table to the ManagedContactStatus type
const mapManagedContact = (contact: any): ManagedContactStatus => ({
  id: contact.id,
  name: contact.name,
  avatarUrl: contact.avatar_url,
  statusText: contact.status_text ?? '',
  statusImageUrl: contact.status_image_url ?? undefined,
  hasUpdate: contact.has_update ?? false,
  enabled: contact.enabled !== false,
  dataAiHint: contact.data_ai_hint ?? 'profile person',
});

export const GlobalStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adminOwnStatus, setAdminOwnStatus] = useState<AdminStatusDisplay | null>(null);
  const [managedDemoContacts, setManagedDemoContacts] = useState<ManagedContactStatus[] | null>(null);
  const [isLoadingGlobalStatuses, setIsLoadingGlobalStatuses] = useState(true);
  const { toast } = useToast();

  const fetchGlobalStatuses = useCallback(async () => {
    if (!supabase) {
      console.warn("[GlobalStatusContext] Supabase not available, using defaults.");
      setAdminOwnStatus(defaultAdminStatusDisplay);
      setManagedDemoContacts(defaultManagedContactStatuses);
      setIsLoadingGlobalStatuses(false);
      return;
    }

    setIsLoadingGlobalStatuses(true);
    try {
      const [adminStatusRes, contactsRes] = await Promise.all([
        supabase.from('admin_status_display').select('*').eq('id', 'default').single(),
        supabase.from('managed_demo_contacts').select('*').eq('enabled', true).order('id'),
      ]);

      // Process Admin Status
      if (adminStatusRes.error && adminStatusRes.error.code !== 'PGRST116') {
        console.warn('[GlobalStatusContext] Error fetching admin status:', adminStatusRes.error);
        setAdminOwnStatus(defaultAdminStatusDisplay);
      } else {
        setAdminOwnStatus(adminStatusRes.data ? mapAdminStatus(adminStatusRes.data) : defaultAdminStatusDisplay);
      }

      // Process Managed Contacts
      if (contactsRes.error) {
        console.warn('[GlobalStatusContext] Error fetching contacts:', contactsRes.error);
        setManagedDemoContacts(defaultManagedContactStatuses);
      } else {
        setManagedDemoContacts(contactsRes.data.length > 0 ? contactsRes.data.map(mapManagedContact) : defaultManagedContactStatuses);
      }

    } catch (e: any) {
      console.error('[GlobalStatusContext] Unexpected error fetching global statuses:', e);
      toast({ title: "Error Loading Global Statuses", description: `Using defaults due to an unexpected error.`, variant: "destructive" });
      setAdminOwnStatus(defaultAdminStatusDisplay);
      setManagedDemoContacts(defaultManagedContactStatuses);
    } finally {
      setIsLoadingGlobalStatuses(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGlobalStatuses(); // Initial fetch

    if (!supabase) return;

    const channel = supabase.channel('global-status-db-changes');

    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_status_display', filter: 'id=eq:default' },
        () => {
          console.log('[GlobalStatusContext] Admin status changed, refetching.');
          fetchGlobalStatuses();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'managed_demo_contacts' },
        () => {
          console.log('[GlobalStatusContext] Managed contacts changed, refetching.');
          fetchGlobalStatuses();
        }
      )
      .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('[GlobalStatusContext] Subscribed to real-time updates.');
          } else if (err) {
             console.error('[GlobalStatusContext] Real-time subscription error:', err);
          }
      });

    // The crucial cleanup function
    return () => {
      console.log('[GlobalStatusContext] Removing real-time subscription.');
      supabase.removeChannel(channel);
    };
  }, [fetchGlobalStatuses, supabase]);

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
