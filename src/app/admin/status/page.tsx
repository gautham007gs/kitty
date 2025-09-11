
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Activity, Save, RefreshCw, Eye, MessageCircle, Clock, Users, Plus, Trash2, User } from 'lucide-react';

interface StatusData {
  status: string;
  custom_message: string;
  show_real_time_activity: boolean;
  name: string;
  avatarUrl: string;
  statusText: string;
  hasUpdate: boolean;
  statusImageUrl?: string;
}

interface ManagedContact {
  id: string;
  name: string;
  avatar_url: string;
  status_text: string;
  status_image_url?: string;
  has_update: boolean;
  enabled: boolean;
  data_ai_hint: string;
}

const StatusManagementPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusData, setStatusData] = useState<StatusData>({
    status: 'active',
    custom_message: 'Online and ready to chat!',
    show_real_time_activity: true,
    name: 'Maya',
    avatarUrl: '/maya-avatar.png',
    statusText: 'Tap to add status update',
    hasUpdate: false,
    statusImageUrl: ''
  });

  const [managedContacts, setManagedContacts] = useState<ManagedContact[]>([]);

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-green-500', description: 'Available for chat' },
    { value: 'away', label: 'Away', color: 'bg-yellow-500', description: 'Temporarily unavailable' },
    { value: 'busy', label: 'Busy', color: 'bg-red-500', description: 'Do not disturb' },
    { value: 'invisible', label: 'Invisible', color: 'bg-gray-500', description: 'Appear offline' }
  ];

  useEffect(() => {
    loadStatusData();
    loadManagedContacts();
  }, []);

  const loadStatusData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_configurations')
        .select('config_data')
        .eq('config_key', 'admin_status_display')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.config_data) {
        setStatusData({ ...statusData, ...data.config_data });
      }
    } catch (error) {
      console.error('Error loading status data:', error);
      toast({
        title: "Error",
        description: "Failed to load status data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadManagedContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('managed_demo_contacts')
        .select('*')
        .order('name');

      if (error) throw error;

      setManagedContacts(data || []);
    } catch (error) {
      console.error('Error loading managed contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load demo contacts",
        variant: "destructive",
      });
    }
  };

  const saveStatusData = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('app_configurations')
        .upsert({
          config_key: 'admin_status_display',
          config_data: statusData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Status settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving status data:', error);
      toast({
        title: "Error",
        description: "Failed to save status settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveContact = async (contact: ManagedContact) => {
    try {
      const { error } = await supabase
        .from('managed_demo_contacts')
        .upsert({
          id: contact.id,
          name: contact.name,
          avatar_url: contact.avatar_url,
          status_text: contact.status_text,
          status_image_url: contact.status_image_url || null,
          has_update: contact.has_update,
          enabled: contact.enabled,
          data_ai_hint: contact.data_ai_hint,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${contact.name}'s contact updated successfully`,
      });
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Error",
        description: `Failed to save ${contact.name}'s contact`,
        variant: "destructive",
      });
    }
  };

  const deleteContact = async (contactId: string, contactName: string) => {
    try {
      const { error } = await supabase
        .from('managed_demo_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      setManagedContacts(prev => prev.filter(c => c.id !== contactId));
      toast({
        title: "Success",
        description: `${contactName} deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: `Failed to delete ${contactName}`,
        variant: "destructive",
      });
    }
  };

  const addNewContact = () => {
    const newContact: ManagedContact = {
      id: `contact_${Date.now()}`,
      name: 'New Contact',
      avatar_url: '/images/default-avatar.png',
      status_text: 'New status update',
      status_image_url: '',
      has_update: true,
      enabled: true,
      data_ai_hint: 'profile person'
    };
    setManagedContacts(prev => [...prev, newContact]);
  };

  const updateContact = (contactId: string, field: keyof ManagedContact, value: any) => {
    setManagedContacts(prev => 
      prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, [field]: value }
          : contact
      )
    );
  };

  const updateStatusField = (field: keyof StatusData, value: any) => {
    setStatusData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-3 text-lg">Loading status settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Status Management
          </h1>
          <p className="text-gray-600 mt-2">Configure Maya's status and manage demo contacts</p>
        </div>
        <Button onClick={saveStatusData} disabled={saving} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {saving ? 'Saving...' : 'Save Maya Status'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maya Status Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-500" />
              Maya's Status Configuration
            </CardTitle>
            <CardDescription>Set Maya's current online status and availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Current Status</Label>
              <div className="grid grid-cols-1 gap-2">
                {statusOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      statusData.status === option.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateStatusField('status', option.value)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${option.color}`} />
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                      {statusData.status === option.value && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Message */}
            <div className="space-y-2">
              <Label htmlFor="custom_message" className="text-sm font-medium">Status Message</Label>
              <Textarea
                id="custom_message"
                value={statusData.custom_message}
                onChange={(e) => updateStatusField('custom_message', e.target.value)}
                placeholder="Enter a custom status message..."
                className="resize-none"
                rows={3}
              />
            </div>

            {/* Real-time Activity */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Real-time Activity</Label>
                <p className="text-xs text-gray-500">Show typing indicators and online presence</p>
              </div>
              <Switch
                checked={statusData.show_real_time_activity}
                onCheckedChange={(checked) => updateStatusField('show_real_time_activity', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Maya Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-pink-500" />
              Maya's Profile Information
            </CardTitle>
            <CardDescription>Manage Maya's display name and avatar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Display Name</Label>
              <Input
                id="name"
                value={statusData.name}
                onChange={(e) => updateStatusField('name', e.target.value)}
                placeholder="Enter display name..."
              />
            </div>

            {/* Avatar URL */}
            <div className="space-y-2">
              <Label htmlFor="avatarUrl" className="text-sm font-medium">Avatar URL</Label>
              <Input
                id="avatarUrl"
                value={statusData.avatarUrl}
                onChange={(e) => updateStatusField('avatarUrl', e.target.value)}
                placeholder="Enter avatar image URL..."
              />
            </div>

            {/* Status Text */}
            <div className="space-y-2">
              <Label htmlFor="statusText" className="text-sm font-medium">Status Text</Label>
              <Input
                id="statusText"
                value={statusData.statusText}
                onChange={(e) => updateStatusField('statusText', e.target.value)}
                placeholder="Enter status text..."
              />
            </div>

            {/* Status Image URL */}
            <div className="space-y-2">
              <Label htmlFor="statusImageUrl" className="text-sm font-medium">Status Image URL (Optional)</Label>
              <Input
                id="statusImageUrl"
                value={statusData.statusImageUrl || ''}
                onChange={(e) => updateStatusField('statusImageUrl', e.target.value)}
                placeholder="Enter status image URL..."
              />
            </div>

            {/* Has Update Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Show Update Indicator</Label>
                <p className="text-xs text-gray-500">Display notification badge for new updates</p>
              </div>
              <Switch
                checked={statusData.hasUpdate}
                onCheckedChange={(checked) => updateStatusField('hasUpdate', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Contacts Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              Demo Contacts Management
            </div>
            <Button onClick={addNewContact} size="sm" className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </CardTitle>
          <CardDescription>Manage the demo contacts that appear on the status page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {managedContacts.map((contact) => (
              <div key={contact.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <h3 className="font-medium text-lg">{contact.name}</h3>
                  </div>
                  <Button
                    onClick={() => deleteContact(contact.id, contact.name)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Name</Label>
                    <Input
                      value={contact.name}
                      onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                      placeholder="Contact name..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Avatar URL</Label>
                    <Input
                      value={contact.avatar_url}
                      onChange={(e) => updateContact(contact.id, 'avatar_url', e.target.value)}
                      placeholder="Avatar image URL..."
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium">Status Text</Label>
                    <Textarea
                      value={contact.status_text}
                      onChange={(e) => updateContact(contact.id, 'status_text', e.target.value)}
                      placeholder="Status message..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status Image URL (Optional)</Label>
                    <Input
                      value={contact.status_image_url || ''}
                      onChange={(e) => updateContact(contact.id, 'status_image_url', e.target.value)}
                      placeholder="Status image URL..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">AI Hint</Label>
                    <Input
                      value={contact.data_ai_hint}
                      onChange={(e) => updateContact(contact.id, 'data_ai_hint', e.target.value)}
                      placeholder="AI hint for image generation..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={contact.enabled}
                        onCheckedChange={(checked) => updateContact(contact.id, 'enabled', checked)}
                      />
                      <Label className="text-sm">Enabled</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={contact.has_update}
                        onCheckedChange={(checked) => updateContact(contact.id, 'has_update', checked)}
                      />
                      <Label className="text-sm">Has Update</Label>
                    </div>
                  </div>
                  <Button
                    onClick={() => saveContact(contact)}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            ))}

            {managedContacts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No demo contacts found. Add some to get started!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2 text-blue-500" />
            Status Preview
          </CardTitle>
          <CardDescription>Preview how Maya's status will appear to users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={statusData.avatarUrl}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/maya-avatar.png';
                  }}
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  statusOptions.find(s => s.value === statusData.status)?.color || 'bg-gray-500'
                }`} />
                {statusData.hasUpdate && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{statusData.name}</div>
                <div className="text-sm text-gray-600">{statusData.custom_message}</div>
                {statusData.show_real_time_activity && (
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Active now
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusManagementPage;
