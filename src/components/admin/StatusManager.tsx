'use client';
import React, { useState } from 'react';
import { useGlobalStatus } from '@/contexts/GlobalStatusContext';
import { ManagedContactStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';

export function StatusManager() {
  const { managedDemoContacts, fetchGlobalStatuses } = useGlobalStatus();
  const [statuses, setStatuses] = useState<ManagedContactStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newContact, setNewContact] = useState<Partial<ManagedContactStatus>>({ name: '', avatarUrl: '', statusText: '', enabled: true, hasUpdate: true });

  // Load statuses on component mount
  React.useEffect(() => {
    const loadStatuses = async () => {
      setIsLoading(true);
      try {
        await fetchGlobalStatuses();
        if (managedDemoContacts) {
          setStatuses(managedDemoContacts);
        }
      } catch (error) {
        console.error('Failed to load statuses:', error);
        // Set some default statuses if loading fails
        setStatuses([
          {
            id: 'default_1',
            name: 'Priya',
            avatarUrl: '/api/placeholder/40/40',
            statusText: 'Just finished yoga class! 🧘‍♀️',
            hasUpdate: true,
            statusImageUrl: '/api/placeholder/200/200',
            enabled: true,
            dataAiHint: 'fitness'
          },
          {
            id: 'default_2',
            name: 'Anjali',
            avatarUrl: '/api/placeholder/40/40',
            statusText: 'Exploring new cafes in Bangalore ☕',
            hasUpdate: false,
            statusImageUrl: '/api/placeholder/200/200',
            enabled: true,
            dataAiHint: 'social'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatuses();
  }, [managedDemoContacts, fetchGlobalStatuses]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddContact = () => {
    if (newContact.name && newContact.avatarUrl) {
      const finalContact: ManagedContactStatus = {
        id: `contact_${Date.now()}`,
        name: newContact.name,
        avatarUrl: newContact.avatarUrl,
        statusText: newContact.statusText || '',
        hasUpdate: newContact.hasUpdate || false,
        statusImageUrl: newContact.statusImageUrl || '',
        enabled: newContact.enabled || false,
        dataAiHint: 'profile'
      };
      setStatuses([...statuses, finalContact]);
      setNewContact({ name: '', avatarUrl: '', statusText: '', enabled: true, hasUpdate: true });
    }
  };

  const handleUpdateContact = (id: string, field: keyof ManagedContactStatus, value: any) => {
    const updatedStatuses = statuses.map(s => s.id === id ? { ...s, [field]: value } : s);
    setStatuses(updatedStatuses);
  };

  const handleRemoveContact = (id: string) => {
    setStatuses(statuses.filter(s => s.id !== id));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Status Feed Manager</h3>
      <div className="space-y-4 mb-8 p-4 border rounded-md">
        <h4 className="font-semibold">Add New Contact Status</h4>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="new-name">Name</Label>
                <Input id="new-name" value={newContact.name || ''} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} placeholder="e.g., Priya" />
            </div>
            <div>
                <Label htmlFor="new-avatar">Avatar URL</Label>
                <Input id="new-avatar" value={newContact.avatarUrl || ''} onChange={(e) => setNewContact({ ...newContact, avatarUrl: e.target.value })} placeholder="/images/priya.png" />
            </div>
        </div>
        <div>
            <Label htmlFor="new-status-text">Status Caption</Label>
            <Input id="new-status-text" value={newContact.statusText || ''} onChange={(e) => setNewContact({ ...newContact, statusText: e.target.value })} placeholder="e.g., On a vacation!" />
        </div>
        <div>
            <Label htmlFor="new-status-image">Status Image URL</Label>
            <Input id="new-status-image" value={newContact.statusImageUrl || ''} onChange={(e) => setNewContact({ ...newContact, statusImageUrl: e.target.value })} placeholder="/images/vacation.jpg" />
        </div>
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <Switch id="new-enabled" checked={newContact.enabled} onCheckedChange={(c) => setNewContact({ ...newContact, enabled: c })} />
                <Label htmlFor="new-enabled">Enabled</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Switch id="new-has-update" checked={newContact.hasUpdate} onCheckedChange={(c) => setNewContact({ ...newContact, hasUpdate: c })} />
                <Label htmlFor="new-has-update">Has Update</Label>
            </div>
        </div>
        <Button onClick={handleAddContact}>Add Contact</Button>
      </div>

      <div className="space-y-6">
        <h4 className="font-semibold">Manage Existing Statuses</h4>
        {statuses.map((status: ManagedContactStatus) => (
          <div key={status.id} className="p-4 border rounded-md space-y-3">
            <div className="flex items-center justify-between">
                <Input className="text-lg font-bold" value={status.name} onChange={(e) => handleUpdateContact(status.id, 'name', e.target.value)} />
                <Button variant="ghost" size="icon" onClick={() => handleRemoveContact(status.id)}><Trash2 className="w-5 h-5 text-red-500" /></Button>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Avatar URL</Label>
                    <Input value={status.avatarUrl} onChange={(e) => handleUpdateContact(status.id, 'avatarUrl', e.target.value)} />
                </div>
                <div>
                    <Label>Status Image URL</Label>
                    <Input value={status.statusImageUrl || ''} onChange={(e) => handleUpdateContact(status.id, 'statusImageUrl', e.target.value)} />
                </div>
            </div>
            <div>
                <Label>Status Caption</Label>
                <Input value={status.statusText} onChange={(e) => handleUpdateContact(status.id, 'statusText', e.target.value)} />
            </div>
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <Switch checked={status.enabled} onCheckedChange={(c) => handleUpdateContact(status.id, 'enabled', c)} />
                    <Label>Enabled</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch checked={status.hasUpdate} onCheckedChange={(c) => handleUpdateContact(status.id, 'hasUpdate', c)} />
                    <Label>Has Update</Label>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}