
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useAdSettings } from '@/contexts/AdSettingsContext';
import AdPreview from '@/components/admin/AdPreview';
import type { AdSettings } from '@/types';

export default function AdminAdsPage() {
  const { adSettings, isLoading, updateAdSettings, refreshAdSettings } = useAdSettings();
  const [localSettings, setLocalSettings] = useState<AdSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (adSettings) {
      setLocalSettings({ ...adSettings });
    }
  }, [adSettings]);

  const handleSave = async () => {
    if (!localSettings) return;

    setIsSaving(true);
    try {
      await updateAdSettings(localSettings);
      toast({
        title: "Success",
        description: "Ad settings saved successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save ad settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshAdSettings();
      toast({
        title: "Success",
        description: "Ad settings refreshed!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh ad settings",
        variant: "destructive"
      });
    }
  };

  if (isLoading || !localSettings) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ad Management</h1>
          <p className="text-gray-600 mt-1">Configure and preview advertising settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Global Ad Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Enable Ads Globally</Label>
              <p className="text-sm text-gray-600">Master switch for all advertisements</p>
            </div>
            <Switch
              checked={localSettings.adsEnabledGlobally}
              onCheckedChange={(checked) =>
                setLocalSettings(prev => prev ? { ...prev, adsEnabledGlobally: checked } : null)
              }
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Max Direct Link Ads Per Day</Label>
              <Input
                type="number"
                value={localSettings.maxDirectLinkAdsPerDay}
                onChange={(e) =>
                  setLocalSettings(prev => prev ? { ...prev, maxDirectLinkAdsPerDay: parseInt(e.target.value) || 0 } : null)
                }
              />
            </div>
            <div>
              <Label>Max Direct Link Ads Per Session</Label>
              <Input
                type="number"
                value={localSettings.maxDirectLinkAdsPerSession}
                onChange={(e) =>
                  setLocalSettings(prev => prev ? { ...prev, maxDirectLinkAdsPerSession: parseInt(e.target.value) || 0 } : null)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ad Network Configuration */}
      <Tabs defaultValue="adsterra" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="adsterra">Adsterra</TabsTrigger>
          <TabsTrigger value="monetag">Monetag</TabsTrigger>
        </TabsList>

        {/* Adsterra Tab */}
        <TabsContent value="adsterra" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Adsterra Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Direct Link */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Direct Link Ads</Label>
                      <Switch
                        checked={localSettings.adsterraDirectLinkEnabled}
                        onCheckedChange={(checked) =>
                          setLocalSettings(prev => prev ? { ...prev, adsterraDirectLinkEnabled: checked } : null)
                        }
                      />
                    </div>
                    <Input
                      placeholder="Direct link URL"
                      value={localSettings.adsterraDirectLink}
                      onChange={(e) =>
                        setLocalSettings(prev => prev ? { ...prev, adsterraDirectLink: e.target.value } : null)
                      }
                    />
                  </div>

                  <Separator />

                  {/* Banner Ads */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Banner Ads</Label>
                      <Switch
                        checked={localSettings.adsterraBannerEnabled}
                        onCheckedChange={(checked) =>
                          setLocalSettings(prev => prev ? { ...prev, adsterraBannerEnabled: checked } : null)
                        }
                      />
                    </div>
                    <Textarea
                      placeholder="Banner ad code"
                      value={localSettings.adsterraBannerCode}
                      onChange={(e) =>
                        setLocalSettings(prev => prev ? { ...prev, adsterraBannerCode: e.target.value } : null)
                      }
                      rows={4}
                    />
                  </div>

                  <Separator />

                  {/* Social Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Social Bar Ads</Label>
                      <Switch
                        checked={localSettings.adsterraSocialBarEnabled}
                        onCheckedChange={(checked) =>
                          setLocalSettings(prev => prev ? { ...prev, adsterraSocialBarEnabled: checked } : null)
                        }
                      />
                    </div>
                    <Textarea
                      placeholder="Social bar ad code"
                      value={localSettings.adsterraSocialBarCode}
                      onChange={(e) =>
                        setLocalSettings(prev => prev ? { ...prev, adsterraSocialBarCode: e.target.value } : null)
                      }
                      rows={4}
                    />
                  </div>

                  <Separator />

                  {/* Popunder */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Popunder Ads</Label>
                      <Switch
                        checked={localSettings.adsterraPopunderEnabled}
                        onCheckedChange={(checked) =>
                          setLocalSettings(prev => prev ? { ...prev, adsterraPopunderEnabled: checked } : null)
                        }
                      />
                    </div>
                    <Textarea
                      placeholder="Popunder ad code"
                      value={localSettings.adsterraPopunderCode}
                      onChange={(e) =>
                        setLocalSettings(prev => prev ? { ...prev, adsterraPopunderCode: e.target.value } : null)
                      }
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Previews */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ad Previews</h3>
              <AdPreview adType="banner" network="adsterra" />
              <AdPreview adType="social_bar" network="adsterra" />
              <AdPreview adType="popunder" network="adsterra" />
            </div>
          </div>
        </TabsContent>

        {/* Monetag Tab */}
        <TabsContent value="monetag" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monetag Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Direct Link */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Direct Link Ads</Label>
                      <Switch
                        checked={localSettings.monetagDirectLinkEnabled}
                        onCheckedChange={(checked) =>
                          setLocalSettings(prev => prev ? { ...prev, monetagDirectLinkEnabled: checked } : null)
                        }
                      />
                    </div>
                    <Input
                      placeholder="Direct link URL"
                      value={localSettings.monetagDirectLink}
                      onChange={(e) =>
                        setLocalSettings(prev => prev ? { ...prev, monetagDirectLink: e.target.value } : null)
                      }
                    />
                  </div>

                  <Separator />

                  {/* Banner Ads */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Banner Ads</Label>
                      <Switch
                        checked={localSettings.monetagBannerEnabled}
                        onCheckedChange={(checked) =>
                          setLocalSettings(prev => prev ? { ...prev, monetagBannerEnabled: checked } : null)
                        }
                      />
                    </div>
                    <Textarea
                      placeholder="Banner ad code"
                      value={localSettings.monetagBannerCode}
                      onChange={(e) =>
                        setLocalSettings(prev => prev ? { ...prev, monetagBannerCode: e.target.value } : null)
                      }
                      rows={4}
                    />
                  </div>

                  <Separator />

                  {/* Social Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Social Bar Ads</Label>
                      <Switch
                        checked={localSettings.monetagSocialBarEnabled}
                        onCheckedChange={(checked) =>
                          setLocalSettings(prev => prev ? { ...prev, monetagSocialBarEnabled: checked } : null)
                        }
                      />
                    </div>
                    <Textarea
                      placeholder="Social bar ad code"
                      value={localSettings.monetagSocialBarCode}
                      onChange={(e) =>
                        setLocalSettings(prev => prev ? { ...prev, monetagSocialBarCode: e.target.value } : null)
                      }
                      rows={4}
                    />
                  </div>

                  <Separator />

                  {/* Popunder */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Popunder Ads</Label>
                      <Switch
                        checked={localSettings.monetagPopunderEnabled}
                        onCheckedChange={(checked) =>
                          setLocalSettings(prev => prev ? { ...prev, monetagPopunderEnabled: checked } : null)
                        }
                      />
                    </div>
                    <Textarea
                      placeholder="Popunder ad code"
                      value={localSettings.monetagPopunderCode}
                      onChange={(e) =>
                        setLocalSettings(prev => prev ? { ...prev, monetagPopunderCode: e.target.value } : null)
                      }
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Previews */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ad Previews</h3>
              <AdPreview adType="banner" network="monetag" />
              <AdPreview adType="social_bar" network="monetag" />
              <AdPreview adType="popunder" network="monetag" />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Test Ad Display */}
      <Card>
        <CardHeader>
          <CardTitle>Live Ad Test</CardTitle>
          <p className="text-sm text-gray-600">Test how ads appear in the actual chat interface</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-dashed border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-medium mb-2">Banner Ad Test Area</h4>
              <div className="min-h-[90px] bg-white rounded border">
                {localSettings.adsEnabledGlobally && localSettings.adsterraBannerEnabled && localSettings.adsterraBannerCode ? (
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: localSettings.adsterraBannerCode 
                    }}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[90px] text-gray-500 text-sm">
                    No banner ad configured or disabled
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-xs text-gray-600">
              <strong>Note:</strong> Popunder ads won't show in preview mode to avoid unwanted pop-ups. 
              Social bar ads appear at the bottom of the page when enabled.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
