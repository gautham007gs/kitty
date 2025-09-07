'use client';
import { useState } from 'react';
import { useGlobalStatus } from '@/contexts/GlobalStatusContext';
import { ManagedContactStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';

export function StatusManager() {
  const { statuses, setStatuses } = useGlobalStatus();
  const [newContact, setNewContact] = useState<Partial<ManagedContactStatus>>({ name: '', avatar_url: '', status_text: '', enabled: true, has_update: true });

  const handleAddContact = () => {
    if (newContact.name && newContact.avatar_url) {
      const finalContact: ManagedContactStatus = {
        id: `contact_${Date.now()}`,
        name: newContact.name,
        avatar_url: newContact.avatar_url,
        status_text: newContact.status_text || '',
        has_update: newContact.has_update || false,
        status_image_url: newContact.status_image_url || '',
        enabled: newContact.enabled || false,
        data_ai_hint: 'profile',
        created_at: new Date(),
        updated_at: new Date(),
      };
      setStatuses([...statuses, finalContact]);
      setNewContact({ name: '', avatar_url: '', status_text: '', enabled: true, has_update: true });
    }
  };

  const handleUpdateContact = (id: string, field: keyof ManagedContactStatus, value: any) => {
    const updatedStatuses = statuses.map(s => s.id === id ? { ...s, [field]: value, updated_at: new Date() } : s);
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
                <Input id="new-avatar" value={newContact.avatar_url || ''} onChange={(e) => setNewContact({ ...newContact, avatar_url: e.target.value })} placeholder="/images/priya.png" />
            </div>
        </div>
        <div>
            <Label htmlFor="new-status-text">Status Caption</Label>
            <Input id="new-status-text" value={newContact.status_text || ''} onChange={(e) => setNewContact({ ...newContact, status_text: e.target.value })} placeholder="e.g., On a vacation!" />
        </div>
        <div>
            <Label htmlFor="new-status-image">Status Image URL</Label>
            <Input id="new-status-image" value={newContact.status_image_url || ''} onChange={(e) => setNewContact({ ...newContact, status_image_url: e.target.value })} placeholder="/images/vacation.jpg" />
        </div>
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <Switch id="new-enabled" checked={newContact.enabled} onCheckedChange={(c) => setNewContact({ ...newContact, enabled: c })} />
                <Label htmlFor="new-enabled">Enabled</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Switch id="new-has-update" checked={newContact.has_update} onCheckedChange={(c) => setNewContact({ ...newContact, has_update: c })} />
                <Label htmlFor="new-has-update">Has Update</Label>
            </div>
        </div>
        <Button onClick={handleAddContact}>Add Contact</Button>
      </div>

      <div className="space-y-6">
        <h4 className="font-semibold">Manage Existing Statuses</h4>
        {statuses.map(status => (
          <div key={status.id} className="p-4 border rounded-md space-y-3">
            <div className="flex items-center justify-between">
                <Input className="text-lg font-bold" value={status.name} onChange={(e) => handleUpdateContact(status.id, 'name', e.target.value)} />
                <Button variant="ghost" size="icon" onClick={() => handleRemoveContact(status.id)}><Trash2 className="w-5 h-5 text-red-500" /></Button>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Avatar URL</Label>
                    <Input value={status.avatar_url} onChange={(e) => handleUpdateContact(status.id, 'avatar_url', e.target.value)} />
                </div>
                <div>
                    <Label>Status Image URL</Label>
                    <Input value={status.status_image_url || ''} onChange={(e) => handleUpdateContact(status.id, 'status_image_url', e.target.value)} />
                </div>
            </div>
            <div>
                <Label>Status Caption</Label>
                <Input value={status.status_text} onChange={(e) => handleUpdateContact(status.id, 'status_text', e.target.value)} />
            </div>
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <Switch checked={status.enabled} onCheckedChange={(c) => handleUpdateContact(status.id, 'enabled', c)} />
                    <Label>Enabled</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch checked={status.has_update} onCheckedChange={(c) => handleUpdateContact(status.id, 'has_update', c)} />
                    <Label>Has Update</Label>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}