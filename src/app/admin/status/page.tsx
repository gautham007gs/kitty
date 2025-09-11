
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
import { Activity, Save, RefreshCw, Eye, MessageCircle, Clock } from 'lucide-react';

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

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-green-500', description: 'Available for chat' },
    { value: 'away', label: 'Away', color: 'bg-yellow-500', description: 'Temporarily unavailable' },
    { value: 'busy', label: 'Busy', color: 'bg-red-500', description: 'Do not disturb' },
    { value: 'invisible', label: 'Invisible', color: 'bg-gray-500', description: 'Appear offline' }
  ];

  useEffect(() => {
    loadStatusData();
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
          <p className="text-gray-600 mt-2">Configure Maya's online status and presence settings</p>
        </div>
        <Button onClick={saveStatusData} disabled={saving} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-500" />
              Status Configuration
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

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-pink-500" />
              Profile Information
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

      {/* Preview Card */}
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
