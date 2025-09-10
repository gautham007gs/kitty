
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
  EyeOff,
  Server,
  Cloud,
  Cpu,
  HardDrive,
  Wifi,
  Bell,
  Lock,
  Key,
  FileText,
  Download,
  Upload,
  Smartphone,
  Tablet,
  Laptop
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
    systemPrompt: '',
    statusStoryText: '',
    statusStoryImageUrl: '',
    statusStoryHasUpdate: false
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
    adsterraPopunderEnabled: false,
    monetagDirectLink: '',
    monetagDirectLinkEnabled: false,
    monetagBannerCode: '',
    monetagBannerEnabled: false,
    monetagNativeBannerCode: '',
    monetagNativeBannerEnabled: false,
    monetagSocialBarCode: '',
    monetagSocialBarEnabled: false,
    monetagPopunderCode: '',
    monetagPopunderEnabled: false
  });

  // System states
  const [systemStats, setSystemStats] = useState({
    totalMessages: 0,
    activeUsers: 0,
    uptime: '0 hours',
    responseTime: '0ms',
    databaseSize: '0 MB',
    cacheHitRate: '0%',
    memoryUsage: '0%'
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    errorAlerts: true,
    performanceAlerts: true,
    securityAlerts: true
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    ipWhitelist: '',
    apiRateLimit: 100,
    logRetention: 90
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Initialize profile data
    if (aiProfile || (!isLoadingAIProfile && !aiProfile)) {
      const currentProfile = aiProfile || defaultAIProfile;
      setProfile({
        name: currentProfile.name,
        age: (currentProfile.age || 23).toString(),
        personality: currentProfile.personality || 'Friendly and helpful',
        status: currentProfile.status,
        avatarUrl: currentProfile.avatarUrl,
        isOnline: currentProfile.isOnline ?? true,
        responseTime: currentProfile.responseTime || 2000,
        systemPrompt: currentProfile.systemPrompt || '',
        statusStoryText: currentProfile.statusStoryText || '',
        statusStoryImageUrl: currentProfile.statusStoryImageUrl || '',
        statusStoryHasUpdate: currentProfile.statusStoryHasUpdate || false
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
      const [messagesResult, activityResult] = await Promise.all([
        supabase.from('messages_log').select('id', { count: 'exact' }),
        supabase.from('daily_activity_log').select('active_users').order('date', { ascending: false }).limit(1)
      ]);

      setSystemStats({
        totalMessages: messagesResult.count || 0,
        activeUsers: activityResult.data?.[0]?.active_users || 0,
        uptime: Math.floor(Date.now() / (1000 * 60 * 60)).toString() + ' hours',
        responseTime: '145ms',
        databaseSize: '2.4 MB',
        cacheHitRate: '94%',
        memoryUsage: '67%'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile-first Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage your AI chatbot and application settings</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Activity className="h-3 w-3 mr-1" />
                Online
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Mobile-optimized Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Messages</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{systemStats.totalMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Users</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{systemStats.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Monitor className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{systemStats.uptime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Response</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{systemStats.responseTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-optimized Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 min-w-max">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">AI Profile</span>
              </TabsTrigger>
              <TabsTrigger value="ads" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Ads</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">System</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline">Monitor</span>
              </TabsTrigger>
              <TabsTrigger value="status" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Status</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Database</span>
                        <Badge variant="outline" className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Size: {systemStats.databaseSize}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Cache</span>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">Optimal</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Hit Rate: {systemStats.cacheHitRate}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Memory</span>
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">Good</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Usage: {systemStats.memoryUsage}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">API</span>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800">Fast</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Avg: {systemStats.responseTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={loadSystemStats}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Stats
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={clearCache}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Backup Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Profile Tab - Enhanced Mobile UI */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  AI Profile Configuration
                </CardTitle>
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
                    className="resize-none"
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
                      className="font-mono text-sm resize-none"
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

          {/* Enhanced Ads Tab */}
          <TabsContent value="ads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Advertisement Management
                </CardTitle>
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

                {/* Adsterra Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Adsterra Configuration</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Direct Links</Label>
                      <Switch
                        checked={localAdSettings.adsterraDirectLinkEnabled}
                        onCheckedChange={(checked) => 
                          setLocalAdSettings(prev => ({ ...prev, adsterraDirectLinkEnabled: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Popunder Ads</Label>
                      <Switch
                        checked={localAdSettings.adsterraPopunderEnabled}
                        onCheckedChange={(checked) => 
                          setLocalAdSettings(prev => ({ ...prev, adsterraPopunderEnabled: checked }))
                        }
                      />
                    </div>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Banner Ads</Label>
                      <Switch
                        checked={localAdSettings.adsterraBannerEnabled}
                        onCheckedChange={(checked) => 
                          setLocalAdSettings(prev => ({ ...prev, adsterraBannerEnabled: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Native Banner</Label>
                      <Switch
                        checked={localAdSettings.adsterraNativeBannerEnabled}
                        onCheckedChange={(checked) => 
                          setLocalAdSettings(prev => ({ ...prev, adsterraNativeBannerEnabled: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Social Bar</Label>
                      <Switch
                        checked={localAdSettings.adsterraSocialBarEnabled}
                        onCheckedChange={(checked) => 
                          setLocalAdSettings(prev => ({ ...prev, adsterraSocialBarEnabled: checked }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Banner Ad Code</Label>
                      <Textarea
                        value={localAdSettings.adsterraBannerCode}
                        onChange={(e) => setLocalAdSettings(prev => ({ 
                          ...prev, 
                          adsterraBannerCode: e.target.value 
                        }))}
                        placeholder="Paste Adsterra banner ad code here..."
                        rows={3}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Native Banner Code</Label>
                      <Textarea
                        value={localAdSettings.adsterraNativeBannerCode}
                        onChange={(e) => setLocalAdSettings(prev => ({ 
                          ...prev, 
                          adsterraNativeBannerCode: e.target.value 
                        }))}
                        placeholder="Paste Adsterra native banner code here..."
                        rows={3}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Social Bar Code</Label>
                      <Textarea
                        value={localAdSettings.adsterraSocialBarCode}
                        onChange={(e) => setLocalAdSettings(prev => ({ 
                          ...prev, 
                          adsterraSocialBarCode: e.target.value 
                        }))}
                        placeholder="Paste Adsterra social bar code here..."
                        rows={3}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Popunder Code</Label>
                      <Textarea
                        value={localAdSettings.adsterraPopunderCode}
                        onChange={(e) => setLocalAdSettings(prev => ({ 
                          ...prev, 
                          adsterraPopunderCode: e.target.value 
                        }))}
                        placeholder="Paste Adsterra popunder code here..."
                        rows={3}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Monetag Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Monetag Configuration</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Direct Links</Label>
                      <Switch
                        checked={localAdSettings.monetagDirectLinkEnabled}
                        onCheckedChange={(checked) => 
                          setLocalAdSettings(prev => ({ ...prev, monetagDirectLinkEnabled: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Popunder Ads</Label>
                      <Switch
                        checked={localAdSettings.monetagPopunderEnabled}
                        onCheckedChange={(checked) => 
                          setLocalAdSettings(prev => ({ ...prev, monetagPopunderEnabled: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Banner Ads</Label>
                      <Switch
                        checked={localAdSettings.monetagBannerEnabled}
                        onCheckedChange={(checked) => 
                          setLocalAdSettings(prev => ({ ...prev, monetagBannerEnabled: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Native Banner</Label>
                      <Switch
                        checked={localAdSettings.monetagNativeBannerEnabled}
                        onCheckedChange={(checked) => 
                          setLocalAdSettings(prev => ({ ...prev, monetagNativeBannerEnabled: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Social Bar</Label>
                      <Switch
                        checked={localAdSettings.monetagSocialBarEnabled}
                        onCheckedChange={(checked) => 
                          setLocalAdSettings(prev => ({ ...prev, monetagSocialBarEnabled: checked }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Monetag Direct Link URL</Label>
                    <Input
                      value={localAdSettings.monetagDirectLink}
                      onChange={(e) => setLocalAdSettings(prev => ({ 
                        ...prev, 
                        monetagDirectLink: e.target.value 
                      }))}
                      placeholder="Enter Monetag direct link URL"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Banner Ad Code</Label>
                      <Textarea
                        value={localAdSettings.monetagBannerCode}
                        onChange={(e) => setLocalAdSettings(prev => ({ 
                          ...prev, 
                          monetagBannerCode: e.target.value 
                        }))}
                        placeholder="Paste Monetag banner ad code here..."
                        rows={3}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Native Banner Code</Label>
                      <Textarea
                        value={localAdSettings.monetagNativeBannerCode}
                        onChange={(e) => setLocalAdSettings(prev => ({ 
                          ...prev, 
                          monetagNativeBannerCode: e.target.value 
                        }))}
                        placeholder="Paste Monetag native banner code here..."
                        rows={3}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Social Bar Code</Label>
                      <Textarea
                        value={localAdSettings.monetagSocialBarCode}
                        onChange={(e) => setLocalAdSettings(prev => ({ 
                          ...prev, 
                          monetagSocialBarCode: e.target.value 
                        }))}
                        placeholder="Paste Monetag social bar code here..."
                        rows={3}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Popunder Code</Label>
                      <Textarea
                        value={localAdSettings.monetagPopunderCode}
                        onChange={(e) => setLocalAdSettings(prev => ({ 
                          ...prev, 
                          monetagPopunderCode: e.target.value 
                        }))}
                        placeholder="Paste Monetag popunder code here..."
                        rows={3}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveAdSettings} disabled={isLoading} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Ad Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive system alerts via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Performance Alerts</Label>
                      <p className="text-sm text-gray-600">Get notified of performance issues</p>
                    </div>
                    <Switch
                      checked={notificationSettings.performanceAlerts}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, performanceAlerts: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Database Size</span>
                      <span className="text-sm text-gray-600">{systemStats.databaseSize}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Optimize Database
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage authentication and security configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your admin panel is secured with Supabase Authentication. 
                    All sensitive operations require authentication.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-600">Add extra security to your account</p>
                      </div>
                      <Switch
                        checked={securitySettings.twoFactorEnabled}
                        onCheckedChange={(checked) => 
                          setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Session Timeout (minutes)</Label>
                      <Input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings(prev => ({ 
                          ...prev, 
                          sessionTimeout: parseInt(e.target.value) || 30 
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>API Rate Limit (requests/minute)</Label>
                      <Input
                        type="number"
                        value={securitySettings.apiRateLimit}
                        onChange={(e) => setSecuritySettings(prev => ({ 
                          ...prev, 
                          apiRateLimit: parseInt(e.target.value) || 100 
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Log Retention (days)</Label>
                      <Input
                        type="number"
                        value={securitySettings.logRetention}
                        onChange={(e) => setSecuritySettings(prev => ({ 
                          ...prev, 
                          logRetention: parseInt(e.target.value) || 90 
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="flex-1">
                    <Key className="h-4 w-4 mr-2" />
                    Reset API Keys
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    View Security Logs
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out All Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Monitoring Tab */}
          <TabsContent value="monitoring">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Real-time Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Cpu className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium">CPU Usage</span>
                      </div>
                      <p className="text-lg font-bold text-green-700">23%</p>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <HardDrive className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium">Memory</span>
                      </div>
                      <p className="text-lg font-bold text-blue-700">{systemStats.memoryUsage}</p>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Cloud className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium">Network</span>
                      </div>
                      <p className="text-lg font-bold text-purple-700">1.2 MB/s</p>
                    </div>

                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Server className="h-5 w-5 text-orange-600" />
                        <span className="text-sm font-medium">Load Avg</span>
                      </div>
                      <p className="text-lg font-bold text-orange-700">0.45</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Device Compatibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-green-600" />
                        <span>Mobile</span>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Optimized
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Tablet className="h-5 w-5 text-blue-600" />
                        <span>Tablet</span>
                      </div>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        Compatible
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Laptop className="h-5 w-5 text-purple-600" />
                        <span>Desktop</span>
                      </div>
                      <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        Full Support
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminProfilePage;
