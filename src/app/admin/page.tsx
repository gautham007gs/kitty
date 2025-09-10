'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Users, MessageSquare, Activity, Settings, Image, Zap, BarChart3, Globe, Smartphone } from 'lucide-react';
import { StatusManager } from '@/components/admin/StatusManager';

interface AdminAnalytics {
  total_messages: number;
  today_messages: number;
  user_messages: number;
  ai_messages: number;
  active_users_today: number;
  total_sessions: number;
  avg_response_time_ms: number;
}

interface AIProfile {
  id: string;
  name: string;
  avatar_url: string;
  status: string;
  status_story_text: string;
  status_story_image_url: string;
  status_story_has_update: boolean;
  personality: string;
  language_preference: string;
  response_style: string;
  emotion_enabled: boolean;
}

interface AdSettings {
  ads_enabled_globally: boolean;
  show_ads_after_message_count: number;
  adsterra_direct_link: string;
  adsterra_direct_link_enabled: boolean;
  adsterra_banner_enabled: boolean;
  adsterra_social_bar_enabled: boolean;
  adsterra_popunder_enabled: boolean;
  monetag_direct_link_enabled: boolean;
  monetag_popunder_enabled: boolean;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics>({
    total_messages: 0,
    today_messages: 0,
    user_messages: 0,
    ai_messages: 0,
    active_users_today: 0,
    total_sessions: 0,
    avg_response_time_ms: 0
  });
  const [aiProfile, setAIProfile] = useState<AIProfile>({
    id: 'default',
    name: 'Maya',
    avatar_url: '',
    status: '',
    status_story_text: '',
    status_story_image_url: '',
    status_story_has_update: false,
    personality: 'friendly',
    language_preference: 'multilingual',
    response_style: 'casual',
    emotion_enabled: true
  });
  const [adSettings, setAdSettings] = useState<AdSettings>({
    ads_enabled_globally: true,
    show_ads_after_message_count: 8,
    adsterra_direct_link: '',
    adsterra_direct_link_enabled: false,
    adsterra_banner_enabled: false,
    adsterra_social_bar_enabled: false,
    adsterra_popunder_enabled: false,
    monetag_direct_link_enabled: false,
    monetag_popunder_enabled: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch real-time analytics
  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase.rpc('get_chat_analytics', { days_back: 30 });
      if (error) throw error;
      if (data) {
        setAnalytics(data);
      }
    } catch (error: any) {
      console.error('Analytics fetch error:', error);
      // Fallback to manual queries if RPC fails
      try {
        const [messagesResult, todayResult, usersResult] = await Promise.all([
          supabase.from('messages_log').select('*', { count: 'exact', head: true }),
          supabase.from('messages_log').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]),
          supabase.from('daily_activity_log').select('user_pseudo_id').eq('activity_date', new Date().toISOString().split('T')[0])
        ]);

        setAnalytics({
          total_messages: messagesResult.count || 0,
          today_messages: todayResult.count || 0,
          user_messages: 0,
          ai_messages: 0,
          active_users_today: new Set(usersResult.data?.map(u => u.user_pseudo_id)).size || 0,
          total_sessions: 0,
          avg_response_time_ms: 0
        });
      } catch (fallbackError) {
        console.error('Fallback analytics error:', fallbackError);
      }
    }
  };

  // Fetch AI profile settings
  const fetchAIProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_profile_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      
      if (error) throw error;
      if (data) {
        setAIProfile(data);
      }
    } catch (error: any) {
      console.error('AI Profile fetch error:', error);
    }
  };

  // Fetch ad settings
  const fetchAdSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      
      if (error) throw error;
      if (data) {
        setAdSettings(data);
      }
    } catch (error: any) {
      console.error('Ad Settings fetch error:', error);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      await Promise.all([fetchAnalytics(), fetchAIProfile(), fetchAdSettings()]);
      setIsLoading(false);
    };

    loadDashboard();

    // Set up real-time updates
    const interval = setInterval(fetchAnalytics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const saveAIProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('ai_profile_settings')
        .upsert(aiProfile)
        .eq('id', 'default');

      if (error) throw error;

      toast({
        title: 'AI Profile Updated',
        description: 'Maya\'s profile has been saved successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to save profile',
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveAdSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('ad_settings')
        .upsert(adSettings)
        .eq('id', 'default');

      if (error) throw error;

      toast({
        title: 'Ad Settings Updated',
        description: 'Advertisement settings have been saved successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to save ad settings',
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Maya Chat - Complete System Control</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" size="sm">
          <Activity className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Real-time Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_messages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Messages</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.today_messages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Messages sent today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.active_users_today.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.avg_response_time_ms)}ms</div>
            <p className="text-xs text-muted-foreground">Average AI response</p>
          </CardContent>
        </Card>
      </div>

      {/* Maya Profile Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Maya's Profile & Display Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              {aiProfile.avatar_url && (
                <img 
                  src={aiProfile.avatar_url} 
                  alt="Maya Avatar" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maya-name">Display Name</Label>
                <Input
                  id="maya-name"
                  value={aiProfile.name}
                  onChange={(e) => setAIProfile({...aiProfile, name: e.target.value})}
                  placeholder="Maya"
                />
              </div>
              <div>
                <Label htmlFor="maya-avatar">Avatar URL</Label>
                <Input
                  id="maya-avatar"
                  value={aiProfile.avatar_url}
                  onChange={(e) => setAIProfile({...aiProfile, avatar_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maya-status">Status Text</Label>
              <Input
                id="maya-status"
                value={aiProfile.status}
                onChange={(e) => setAIProfile({...aiProfile, status: e.target.value})}
                placeholder="🌸 Living my best life! Let's chat! 🌸"
              />
            </div>
            <div>
              <Label htmlFor="maya-story-caption">Story Caption</Label>
              <Input
                id="maya-story-caption"
                value={aiProfile.status_story_text}
                onChange={(e) => setAIProfile({...aiProfile, status_story_text: e.target.value})}
                placeholder="Ask me anything! 💬"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="maya-story-image">Story Image URL</Label>
            <Input
              id="maya-story-image"
              value={aiProfile.status_story_image_url}
              onChange={(e) => setAIProfile({...aiProfile, status_story_image_url: e.target.value})}
              placeholder="https://..."
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="story-update"
                checked={aiProfile.status_story_has_update}
                onCheckedChange={(checked) => setAIProfile({...aiProfile, status_story_has_update: checked})}
              />
              <Label htmlFor="story-update">Show Story Update Badge</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="emotions-enabled"
                checked={aiProfile.emotion_enabled}
                onCheckedChange={(checked) => setAIProfile({...aiProfile, emotion_enabled: checked})}
              />
              <Label htmlFor="emotions-enabled">Enable Emotional Responses</Label>
            </div>
          </div>

          <Button onClick={saveAIProfile} disabled={isSaving}>
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Profile Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Ad Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Advertisement Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <Label htmlFor="global-ads" className="text-lg font-medium">Global Ads Enabled</Label>
            <Switch
              id="global-ads"
              checked={adSettings.ads_enabled_globally}
              onCheckedChange={(checked) => setAdSettings({...adSettings, ads_enabled_globally: checked})}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <Label className="text-sm">Adsterra Direct</Label>
              <Switch
                checked={adSettings.adsterra_direct_link_enabled}
                onCheckedChange={(checked) => setAdSettings({...adSettings, adsterra_direct_link_enabled: checked})}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <Label className="text-sm">Adsterra Pop-under</Label>
              <Switch
                checked={adSettings.adsterra_popunder_enabled}
                onCheckedChange={(checked) => setAdSettings({...adSettings, adsterra_popunder_enabled: checked})}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <Label className="text-sm">Adsterra Banner</Label>
              <Switch
                checked={adSettings.adsterra_banner_enabled}
                onCheckedChange={(checked) => setAdSettings({...adSettings, adsterra_banner_enabled: checked})}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <Label className="text-sm">Adsterra Social Bar</Label>
              <Switch
                checked={adSettings.adsterra_social_bar_enabled}
                onCheckedChange={(checked) => setAdSettings({...adSettings, adsterra_social_bar_enabled: checked})}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={saveAdSettings} disabled={isSaving}>
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Ad Settings'}
            </Button>
            <Button variant="outline" onClick={() => window.open('/admin/ads', '_blank')}>
              <Settings className="mr-2 h-4 w-4" />
              Advanced Ad Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Manager */}
      <StatusManager />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" onClick={() => window.open('/admin/profile', '_blank')}>
              Profile Settings
            </Button>
            <Button variant="outline" onClick={() => window.open('/admin/ads', '_blank')}>
              Ad Management
            </Button>
            <Button variant="outline" onClick={() => window.open('/maya-chat', '_blank')}>
              View Chat App
            </Button>
            <Button variant="outline" onClick={() => window.open('/status', '_blank')}>
              View Status Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}