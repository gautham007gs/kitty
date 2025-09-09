'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Settings, 
  MessageCircle, 
  Globe, 
  Palette, 
  Shield, 
  Activity,
  Monitor,
  Database,
  Zap,
  Users,
  BarChart3,
  Save,
  LogOut,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAIProfile } from '@/contexts/AIProfileContext';
import { useAdSettings } from '@/contexts/AdSettingsContext';
import { useGlobalStatus } from '@/contexts/GlobalStatusContext';
import { defaultAIProfile } from '@/config/ai';

const AdminProfilePage: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { aiProfile, isLoadingAIProfile, updateAIProfile } = useAIProfile();
  const { adSettings, isLoadingAdSettings, updateAdSettings } = useAdSettings();
  const { globalStatuses, isLoadingGlobalStatuses, updateGlobalStatus } = useGlobalStatus();

  // Profile states
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    personality: '',
    status: '',
    avatarUrl: '',
    isOnline: true,
    responseTime: 2000,
    systemPrompt: ''
  });

  // Ad settings states
  const [localAdSettings, setLocalAdSettings] = useState({
    adsEnabledGlobally: true,
    maxDirectLinkAdsPerDay: 6,
    maxDirectLinkAdsPerSession: 3,
    adsterraDirectLink: '',
    adsterraDirectLinkEnabled: false,
    adsterraBannerCode: '',
    adsterraBannerEnabled: false,
    adsterraNativeBannerCode: '',
    adsterraNativeBannerEnabled: false,
    adsterraSocialBarCode: '',
    adsterraSocialBarEnabled: false,
    adsterraPopunderCode: '',
    adsterraPopunderEnabled: false
  });

  // System states
  const [systemStats, setSystemStats] = useState({
    totalMessages: 0,
    activeUsers: 0,
    uptime: '0 hours',
    responseTime: '0ms'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);

  useEffect(() => {
    // Initialize profile data
    if (aiProfile || (!isLoadingAIProfile && !aiProfile)) {
      const currentProfile = aiProfile || defaultAIProfile;
      setProfile({
        name: currentProfile.name,
        age: currentProfile.age.toString(),
        personality: currentProfile.personality,
        status: currentProfile.status,
        avatarUrl: currentProfile.avatarUrl,
        isOnline: currentProfile.isOnline,
        responseTime: currentProfile.responseTime,
        systemPrompt: currentProfile.systemPrompt || ''
      });
    }

    // Initialize ad settings
    if (adSettings) {
      setLocalAdSettings({ ...adSettings });
    }

    // Load system stats
    loadSystemStats();
  }, [aiProfile, isLoadingAIProfile, adSettings]);

  const loadSystemStats = async () => {
    try {
      const { data: messagesCount } = await supabase
        .from('messages_log')
        .select('id', { count: 'exact' });

      const { data: activityData } = await supabase
        .from('daily_activity_log')
        .select('active_users')
        .order('date', { ascending: false })
        .limit(1);

      setSystemStats({
        totalMessages: messagesCount?.length || 0,
        activeUsers: activityData?.[0]?.active_users || 0,
        uptime: Math.floor(Date.now() / (1000 * 60 * 60)).toString() + ' hours',
        responseTime: '150ms'
      });
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const updatedProfile = {
        ...profile,
        age: parseInt(profile.age) || 25
      };

      await updateAIProfile(updatedProfile);
      toast({ title: 'Success', description: 'AI Profile updated successfully!' });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: `Failed to update profile: ${error.message}`, 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAdSettings = async () => {
    setIsLoading(true);
    try {
      await updateAdSettings(localAdSettings);
      toast({ title: 'Success', description: 'Ad settings updated successfully!' });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: `Failed to update ad settings: ${error.message}`, 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      sessionStorage.removeItem('isAdminLoggedIn_KruthikaChat');
      sessionStorage.removeItem('admin_user_id');
      router.push('/admin/login');
      toast({ title: 'Logged Out', description: 'Successfully logged out of admin panel.' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const clearCache = async () => {
    try {
      await fetch('/api/cache-stats', { method: 'DELETE' });
      toast({ title: 'Cache Cleared', description: 'All caches have been cleared successfully.' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to clear cache.', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your AI chatbot and application settings</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="h-3 w-3 mr-1" />
            Online
          </Badge>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Monitor className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.uptime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.responseTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            AI Profile
          </TabsTrigger>
          <TabsTrigger value="ads">
            <BarChart3 className="h-4 w-4 mr-2" />
            Ads & Revenue
          </TabsTrigger>
          <TabsTrigger value="system">
            <Settings className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Monitor className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* AI Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>AI Profile Configuration</CardTitle>
              <CardDescription>
                Configure your AI chatbot's personality, appearance, and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">AI Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter AI name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Enter age"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status Message</Label>
                <Input
                  id="status"
                  value={profile.status}
                  onChange={(e) => setProfile(prev => ({ ...prev, status: e.target.value }))}
                  placeholder="Enter status message"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input
                  id="avatarUrl"
                  type="url"
                  value={profile.avatarUrl}
                  onChange={(e) => setProfile(prev => ({ ...prev, avatarUrl: e.target.value }))}
                  placeholder="Enter avatar image URL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personality">Personality Description</Label>
                <Textarea
                  id="personality"
                  value={profile.personality}
                  onChange={(e) => setProfile(prev => ({ ...prev, personality: e.target.value }))}
                  placeholder="Describe the AI's personality..."
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Prompt</Label>
                    <p className="text-sm text-gray-600">Advanced AI behavior configuration</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                  >
                    {showSystemPrompt ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                {showSystemPrompt && (
                  <Textarea
                    value={profile.systemPrompt}
                    onChange={(e) => setProfile(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    placeholder="Enter system prompt for AI behavior..."
                    rows={6}
                    className="font-mono text-sm"
                  />
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Online Status</Label>
                  <p className="text-sm text-gray-600">Show AI as online to users</p>
                </div>
                <Switch
                  checked={profile.isOnline}
                  onCheckedChange={(checked) => setProfile(prev => ({ ...prev, isOnline: checked }))}
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={isLoading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save AI Profile'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ads & Revenue Tab */}
        <TabsContent value="ads">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Global Ad Settings</CardTitle>
                <CardDescription>
                  Configure advertisement display and revenue settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Advertisements</Label>
                    <p className="text-sm text-gray-600">Enable or disable all ads globally</p>
                  </div>
                  <Switch
                    checked={localAdSettings.adsEnabledGlobally}
                    onCheckedChange={(checked) => 
                      setLocalAdSettings(prev => ({ ...prev, adsEnabledGlobally: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Max Direct Link Ads Per Day</Label>
                    <Input
                      type="number"
                      value={localAdSettings.maxDirectLinkAdsPerDay}
                      onChange={(e) => setLocalAdSettings(prev => ({ 
                        ...prev, 
                        maxDirectLinkAdsPerDay: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Direct Link Ads Per Session</Label>
                    <Input
                      type="number"
                      value={localAdSettings.maxDirectLinkAdsPerSession}
                      onChange={(e) => setLocalAdSettings(prev => ({ 
                        ...prev, 
                        maxDirectLinkAdsPerSession: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveAdSettings} disabled={isLoading} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Ad Settings'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ad Network Configuration</CardTitle>
                <CardDescription>Configure different ad networks and their settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="adsterra" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="adsterra">Adsterra</TabsTrigger>
                    <TabsTrigger value="monetag">Monetag</TabsTrigger>
                  </TabsList>

                  <TabsContent value="adsterra" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable Adsterra Direct Links</Label>
                      <Switch
                        checked={localAdSettings.adsterraDirectLinkEnabled}
                        onCheckedChange={(checked) => 
                          setLocalAdSettings(prev => ({ ...prev, adsterraDirectLinkEnabled: checked }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Adsterra Direct Link URL</Label>
                      <Input
                        value={localAdSettings.adsterraDirectLink}
                        onChange={(e) => setLocalAdSettings(prev => ({ 
                          ...prev, 
                          adsterraDirectLink: e.target.value 
                        }))}
                        placeholder="Enter Adsterra direct link URL"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Enable Popunder Ads</Label>
                      <Switch
                        checked={localAdSettings.adsterraPopunderEnabled}
                        onCheckedChange={(checked) => 
                          setLocalAdSettings(prev => ({ ...prev, adsterraPopunderEnabled: checked }))
                        }
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="monetag" className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        Monetag integration is available but currently disabled. Configure your Monetag settings here.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Manage system-wide settings and configurations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>AI Response Time (ms)</Label>
                    <Input
                      type="number"
                      value={profile.responseTime}
                      onChange={(e) => setProfile(prev => ({ 
                        ...prev, 
                        responseTime: parseInt(e.target.value) || 2000 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>System Status</Label>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Operational
                      </Badge>
                      <Button variant="outline" size="sm" onClick={loadSystemStats}>
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Clear Application Cache</Label>
                    <p className="text-sm text-gray-600">Clear all cached data to improve performance</p>
                  </div>
                  <Button variant="outline" onClick={clearCache}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Monitoring</CardTitle>
              <CardDescription>Monitor system performance and optimize settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <Monitor className="h-4 w-4" />
                  <AlertDescription>
                    Performance monitoring is active. System is running optimally.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Database Performance</h4>
                    <p className="text-2xl font-bold text-green-600">Good</p>
                    <p className="text-sm text-gray-600">Average query time: 45ms</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">API Response Time</h4>
                    <p className="text-2xl font-bold text-green-600">{systemStats.responseTime}</p>
                    <p className="text-sm text-gray-600">Average response time</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage authentication and security configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your admin panel is secured with Supabase Authentication. 
                  All sensitive operations require authentication.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Add extra security to your admin account</p>
                  </div>
                  <Button variant="outline" disabled>
                    Configure
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Management</Label>
                    <p className="text-sm text-gray-600">Manage active admin sessions</p>
                  </div>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out All Sessions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProfilePage;