"use client";

type EventCallback = (data?: any) => void;

class GlobalEventSystem {
  private static instance: GlobalEventSystem;
  private listeners = new Map<string, Set<EventCallback>>();

  private constructor() {}

  static getInstance(): GlobalEventSystem {
    if (!GlobalEventSystem.instance) {
      GlobalEventSystem.instance = new GlobalEventSystem();
    }
    return GlobalEventSystem.instance;
  }

  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Global events constants
export const GLOBAL_EVENTS = {
  ADMIN_AD_SETTINGS_UPDATED: 'admin:ad_settings_updated',
  ADMIN_AI_PROFILE_UPDATED: 'admin:ai_profile_updated',
  ADMIN_STATUS_UPDATED: 'admin:status_updated',
  ADMIN_DEMO_CONTACTS_UPDATED: 'admin:demo_contacts_updated',
  USER_PREFERENCES_UPDATED: 'user:preferences_updated',
  FORCE_REFRESH_ALL: 'admin:force_refresh_all'
} as const;

// Broadcast configuration changes to all clients
export const broadcastConfigChange = (type: 'ai_profile' | 'ad_settings' | 'media_assets', data: any) => {
  // In a real application, this would use WebSockets or Server-Sent Events
  // For now, we'll use localStorage events to sync across tabs
  const event = {
    type: 'config_change',
    configType: type,
    data,
    timestamp: Date.now()
  };

  // Store in localStorage for persistence
  localStorage.setItem('global_config_event', JSON.stringify(event));
  localStorage.setItem(`${type}_last_update`, JSON.stringify({ data, timestamp: Date.now() }));

  // Broadcast to all open tabs/windows
  window.dispatchEvent(new CustomEvent('global_config_change', { detail: event }));

  // Force context refresh
  window.dispatchEvent(new CustomEvent('force_context_refresh', { detail: { type } }));
};

export { GlobalEventSystem };